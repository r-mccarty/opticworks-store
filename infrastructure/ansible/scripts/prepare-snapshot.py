#!/usr/bin/env python3
"""Root-only recovery capture. Secrets stay in mode-0600 recovery artifacts."""
import datetime
import hashlib
import json
import os
from pathlib import Path
import shlex
import shutil
import subprocess
import sys

APP=Path('/opt/opticworks/medusa-backend')
UNITS=['cloudflared.service','postgresql@17-main.service','redis-server.service']

def run(args,**kwargs):
    p=subprocess.run(args,stderr=subprocess.PIPE,**kwargs)
    if p.returncode:
        raise RuntimeError('Command failed: '+Path(args[0]).name+' exit '+str(p.returncode))
    return p

def output(args):
    return run(args,stdout=subprocess.PIPE,text=True).stdout

def save(path,data):
    with path.open('w') as stream:
        json.dump(data,stream,indent=2);stream.write('\n')
    path.chmod(0o600)

def load_env(path):
    values={}
    for line in path.read_text().splitlines():
        line=line.strip()
        if line.startswith('export '):
            line=line[7:]
        if '=' in line and not line.startswith('#'):
            k,v=line.split('=',1)
            if k in ['AWS_ACCESS_KEY_ID','AWS_SECRET_ACCESS_KEY','RESTIC_REPOSITORY','RESTIC_PASSWORD']:
                parts=shlex.split(v)
                values[k]=parts[0] if parts else ''
    return values

def dump(args,destination):
    with destination.open('wb') as stream:
        run(args,stdout=stream)
    destination.chmod(0o600)

def preflight(root):
    if not APP.is_dir():
        raise RuntimeError('Expected application directory not found')
    if shutil.disk_usage('/var/backups').free < 1024**3:
        raise RuntimeError('Less than one GiB free for recovery capture')
    root.mkdir(parents=True,exist_ok=True,mode=0o700)
    root.chmod(0o700)
    if (root/'before.json').exists():
        raise RuntimeError('Recovery destination already initialized; choose a new capture id')
    units={}
    for unit in UNITS:
        p=subprocess.run(['systemctl','show',unit,'-p','ActiveState','-p','UnitFileState'],capture_output=True,text=True)
        units[unit]=dict(line.split('=',1) for line in p.stdout.splitlines() if '=' in line)
    before={'time_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'units':units,'app_root':str(APP)}
    save(root/'before.json',before)
    prior=Path('/home/ryan/.pm2/dump.pm2')
    if prior.is_file():
        shutil.copyfile(prior,root/'pm2-before.json');(root/'pm2-before.json').chmod(0o600)
    print(json.dumps({'preflight':'passed','directory':str(root)}))

def database(root):
    names=json.loads(output(['sudo','-n','-u','postgres','psql','-X','-A','-t','-c',"SELECT json_agg(datname) FROM pg_database WHERE NOT datistemplate AND datallowconn"]))
    records=[]
    for name in names:
        # Current inventory uses only these safe database names.
        if name not in ['postgres','medusa','medusa_db']:
            raise RuntimeError('Unexpected database; review inventory before capture')
        target=root/(name+'.dump')
        dump(['sudo','-n','-u','postgres','pg_dump','--format=custom','--dbname='+name],target)
        listing=output(['pg_restore','--list',str(target)])
        # Decode the complete archive to /dev/null without executing SQL.
        run(['pg_restore','--file=/dev/null',str(target)],stdout=subprocess.DEVNULL)
        records.append({'database':name,'file':target.name,'bytes':target.stat().st_size,'toc_entries':sum(1 for l in listing.splitlines() if l and not l.startswith(';')),'archive_decode_verified':True})
    dump(['sudo','-n','-u','postgres','pg_dumpall','--globals-only'],root/'postgres-globals.sql')
    save(root/'database-manifest.json',{'databases':records,'globals_file':'postgres-globals.sql'})
    print(json.dumps({'database_archives_verified':len(records)}))

def archive(root):
    for unit in UNITS:
        p=subprocess.run(['systemctl','is-active',unit],capture_output=True,text=True)
        if p.stdout.strip()=='active':
            raise RuntimeError('Expected stopped service still active')
    candidates=['opt/opticworks/medusa-backend','opt/opticworks/backup','etc/cloudflared','etc/postgresql','etc/redis','home/ryan/.pm2/dump.pm2']
    paths=[p for p in candidates if Path('/'+p).exists()]
    dump(['tar','--exclude=opt/opticworks/medusa-backend/node_modules','--exclude=opt/opticworks/medusa-backend/.medusa','--exclude=opt/opticworks/medusa-backend/logs','--exclude=opt/opticworks/medusa-backend/.cache','-czf','-','-C','/',*paths],root/'application-and-config.tar.gz')
    redis=Path('/var/lib/redis/dump.rdb')
    if redis.is_file():
        shutil.copyfile(redis,root/'redis-dump.rdb');(root/'redis-dump.rdb').chmod(0o600)
    artifacts=[]
    for p in sorted(root.iterdir()):
        if p.is_file() and p.name not in ['MANIFEST.json','SNAPSHOT_READY.json']:
            digest=hashlib.sha256()
            with p.open('rb') as stream:
                for chunk in iter(lambda:stream.read(1024*1024),b''):
                    digest.update(chunk)
            artifacts.append({'file':p.name,'bytes':p.stat().st_size,'sha256':digest.hexdigest()})
    manifest={'captured_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_commit_reference':'13b04849bb05dbedcbf142ddcfb42cd30165f7ec','scope':'logical databases, globals, application source/config, original PM2 state, Redis RDB; not a provider VM snapshot','services_stopped':UNITS,'artifacts':artifacts}
    save(root/'MANIFEST.json',manifest)
    print(json.dumps({'recovery_artifact_count':len(artifacts)}))

def offsite(root):
    env=os.environ.copy();env.update(load_env(Path('/opt/opticworks/backup/.restic-env')))
    p=run(['restic','--no-cache','backup','--json','--tag','pre-redeployment','--tag',root.name,str(root)],stdout=subprocess.PIPE,text=True,env=env)
    summary=next((json.loads(l) for l in reversed(p.stdout.splitlines()) if l.startswith('{') and json.loads(l).get('message_type')=='summary'),None)
    if not summary or not summary.get('snapshot_id'):
        raise RuntimeError('Restic did not return a snapshot id')
    identifier=summary['snapshot_id']
    snapshots=json.loads(output_with_env(['restic','--no-lock','--no-cache','snapshots','--json',identifier],env))
    if not snapshots:
        raise RuntimeError('New offsite snapshot could not be read back')
    ready={'prepared_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'directory':str(root),'restic_snapshot_id':identifier,'offsite_readback_verified':True,'services_stopped':UNITS,'medusa_process':'stopped','provider_vm_snapshot_taken':False,'ssh_available':True}
    save(root/'SNAPSHOT_READY.json',ready)
    print(json.dumps(ready))

def output_with_env(args,env):
    return run(args,stdout=subprocess.PIPE,text=True,env=env).stdout

if __name__=='__main__':
    try:
        if os.geteuid()!=0:
            raise RuntimeError('Root is required')
        os.umask(0o077)
        phase=sys.argv[1];root=Path(sys.argv[2]).resolve()
        if root.parent!=Path('/var/backups/opticworks') or not root.name.startswith('pre-redeployment-'):
            raise RuntimeError('Unexpected recovery destination')
        {'preflight':preflight,'database':database,'archive':archive,'offsite':offsite}[phase](root)
    except Exception as e:
        print(json.dumps({'error_type':type(e).__name__,'details':str(e) if isinstance(e,RuntimeError) else 'withheld'}));sys.exit(1)
