#!/usr/bin/env python3
"""Controller entry point for the backend host.

  python3 -I infrastructure/ansible/scripts/run.py --target staging deploy [ansible-playbook args...]
  python3 -I infrastructure/ansible/scripts/run.py --target staging rotate-hostkey

Targets come from inventory/targets.json and are resolved by Hetzner server ID.
`staging` is the temporary validation VM (Neon `dev` branch). `original` is the
grandfathered CPX21 (Neon `main`); it is refused unless
OPTICWORKS_CONFIRM_SERVER_ID equals its server ID, which is the owner's Gate 2
approval (see MIGRATION.md). Either target is refused if its live type, location
or disk differs from targets.json, or if the tunnel is connected from another host.

Secrets are pulled at run time with `infisical run` from the ubuntu-pair-node
project (the agent-harness service folders, including opticworks-backend) and live only in this process tree:
nothing is written to disk except the SSH key, in a 0700 temp dir removed on exit.
The release is `git archive` of the committed backend/ tree; uncommitted
changes are refused so what's deployed is always reproducible.

Env: INFISICAL_PROFILE (optional) selects the Infisical login profile.
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
ANSIBLE = HERE.parent
REPO = ANSIBLE.parent.parent

HARNESS_PROJECT = "b291efe7-518d-448a-9388-984e715a5b9e"  # ubuntu-pair-node
HARNESS_PATHS = [f"/agents/{s}/{k}" for s in ("opticworks-backend", "neon", "stripe", "easypost", "resend", "cloudflare", "tigris", "hetzner")
                 for k in ("config", "credentials")]
TARGETS = json.loads((ANSIBLE / "inventory" / "targets.json").read_text())
TUNNEL = "opticworks-backend"
NEON_PROJECT = "jolly-moon-85409114"


def outer(argv):
    """Re-exec under `infisical run` with every needed folder."""
    profile = ["--profile", os.environ["INFISICAL_PROFILE"]] if os.environ.get("INFISICAL_PROFILE") else []
    common = ["--include-imports=false", "--expand=false", "--silent", *profile]
    cmd = ["infisical", "run", f"--projectId={HARNESS_PROJECT}", "--env=dev",
           *[f"--path={p}" for p in HARNESS_PATHS], *common, "--",
           sys.executable, "-I", __file__, "--inner", *argv]
    os.execvp(cmd[0], cmd)


def http_json(url, headers):
    # Retry network errors (resets, timeouts); HTTP errors are answers and raise at once.
    for attempt in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=30) as r:
                return json.load(r)
        except urllib.error.HTTPError:
            raise
        except (urllib.error.URLError, TimeoutError, ConnectionError):
            if attempt == 2:
                raise
            time.sleep(2 ** attempt)


def target(name):
    """Look up the target by server ID and refuse on any drift from targets.json."""
    if name not in ("staging", "original"):
        sys.exit("--target must be staging or original")
    t = TARGETS[name]
    if name == "original" and os.environ.get("OPTICWORKS_CONFIRM_SERVER_ID") != str(t["server_id"]):
        sys.exit(f"refusing the original server {t['server_id']} without owner approval: "
                 "set OPTICWORKS_CONFIRM_SERVER_ID to its ID (Gate 2, MIGRATION.md)")
    try:
        s = http_json(f"https://api.hetzner.cloud/v1/servers/{t['server_id']}",
                      {"Authorization": "Bearer " + os.environ["HETZNER_API_KEY"]})["server"]
    except urllib.error.HTTPError as e:
        sys.exit(f"{name} server {t['server_id']}: HTTP {e.code}; never recreate it, see MIGRATION.md")
    loc = (s.get("location") or s.get("datacenter", {}).get("location"))["name"]
    live = {"name": s["name"], "server_type": s["server_type"]["name"], "location": loc,
            "primary_disk_gb": s["primary_disk_size"]}
    drift = {k: v for k, v in live.items() if v != t[k]}
    if drift:
        sys.exit(f"{name} server {t['server_id']} drifted from targets.json: {drift}")
    v6 = (s["public_net"].get("ipv6") or {}).get("ip", "")
    return t, s["public_net"]["ipv4"]["ip"], v6.split("::/")[0] + ":"


def neon_uri(branch: str, pooled: bool):
    q = urllib.parse.urlencode({"branch_id": branch, "database_name": "medusa", "role_name": "medusa",
                                "pooled": str(pooled).lower()})
    uri = http_json(f"https://console.neon.tech/api/v2/projects/{NEON_PROJECT}/connection_uri?{q}",
                    {"Authorization": "Bearer " + os.environ["NEON_API_KEY"]})["uri"]
    # Explicit full verification; pg's next major weakens plain `require`.
    return uri.replace("sslmode=require", "sslmode=verify-full")


def tunnel_token(host, v6_prefix):
    h = {"Authorization": "Bearer " + os.environ["CLOUDFLARE_API_TOKEN"]}
    a = os.environ["ACCOUNT_ID"]
    t = http_json(f"https://api.cloudflare.com/client/v4/accounts/{a}/cfd_tunnel?name={TUNNEL}&is_deleted=false", h)["result"]
    if not t:
        sys.exit(f"Tunnel {TUNNEL} not found; run cloudflare_setup.py first")
    # Connectors on two hosts would load-balance backend.optic.works between them.
    others = sorted(ip for ip in {c.get("origin_ip") or "" for c in t[0].get("connections", [])}
                    if ip != host and not ip.startswith(v6_prefix))
    if others:
        sys.exit(f"tunnel {TUNNEL} is connected from {others}; stop cloudflared there before deploying to {host}")
    return http_json(f"https://api.cloudflare.com/client/v4/accounts/{a}/cfd_tunnel/{t[0]['id']}/token", h)["result"]


def write_key(tmp: Path) -> Path:
    lines = [l.strip() for l in os.environ["SSH_PRIVATE_KEY"].strip().splitlines() if l.strip()]
    body = "".join(lines[1:-1])
    key = "\n".join([lines[0]] + [body[i:i + 70] for i in range(0, len(body), 70)] + [lines[-1]]) + "\n"
    kp = tmp / "deploy"
    fd = os.open(kp, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, "w") as f:
        f.write(key)
    return kp


def release(tmp: Path):
    dirty = subprocess.run(["git", "-C", str(REPO), "status", "--porcelain", "--", "backend"],
                           capture_output=True, text=True, check=True).stdout.strip()
    if dirty:
        sys.exit("backend/ has uncommitted changes; commit them so the release is reproducible")
    sha = subprocess.run(["git", "-C", str(REPO), "rev-parse", "HEAD"], capture_output=True, text=True,
                         check=True).stdout.strip()
    archive = tmp / f"backend-{sha[:12]}.tar.gz"
    subprocess.run(["git", "-C", str(REPO), "archive", "--format=tar.gz", "--prefix=backend/",
                    "-o", str(archive), "HEAD:backend"], check=True)
    return sha, archive


def ssh(host, key, port, user, command):
    return subprocess.run(["ssh", "-F", "/dev/null", "-i", str(key), "-p", port, "-o", "IdentitiesOnly=yes",
                           "-o", "StrictHostKeyChecking=yes", "-o", "BatchMode=yes", f"{user}@{host}", command],
                          capture_output=True, text=True)


def rotate_hostkey(host, key, port, user):
    """Replace the cloud-init host key over the already-verified connection."""
    new = ssh(host, key, port, user,
              "sudo rm -f /etc/ssh/ssh_host_ed25519_key.new* && "
              "sudo ssh-keygen -q -t ed25519 -N '' -C '' -f /etc/ssh/ssh_host_ed25519_key.new && "
              "sudo cat /etc/ssh/ssh_host_ed25519_key.new.pub")
    if new.returncode != 0 or not new.stdout.startswith("ssh-ed25519 "):
        sys.exit("could not generate the new host key")
    pub = " ".join(new.stdout.split()[:2])
    swap = ssh(host, key, port, user,
               "sudo mv /etc/ssh/ssh_host_ed25519_key.new /etc/ssh/ssh_host_ed25519_key && "
               "sudo mv /etc/ssh/ssh_host_ed25519_key.new.pub /etc/ssh/ssh_host_ed25519_key.pub && "
               "sudo sshd -t && sudo systemctl reload ssh")
    if swap.returncode != 0:
        sys.exit("host key swap failed; old key still in place")
    entry = f"[{host}]:{port}"
    subprocess.run(["ssh-keygen", "-R", entry], capture_output=True)
    with open(Path.home() / ".ssh" / "known_hosts", "a") as f:
        f.write(f"{entry} {pub}\n")
    check = ssh(host, key, port, user, "true")
    fp = subprocess.run(["ssh-keygen", "-lf", "-"], input=pub, capture_output=True, text=True).stdout.split()[1]
    if check.returncode != 0:
        sys.exit("reconnect with the rotated key failed; investigate via the Hetzner console")
    print(f"host key rotated; now trusting {fp} for {entry}")


def inner(argv):
    if argv[:1] != ["--target"] or len(argv) < 2:
        sys.exit(__doc__)
    name, (action, *rest) = argv[1], argv[2:] or ["deploy"]
    tgt, host, v6_prefix = target(name)
    port = os.environ.get("SSH_PORT") or "8032"
    user = os.environ.get("SSH_USER") or "ryan"
    tmp = Path(tempfile.mkdtemp(prefix="owd-"))
    try:
        os.chmod(tmp, 0o700)
        key = write_key(tmp)
        if action == "rotate-hostkey":
            rotate_hostkey(host, key, port, user)
            return 0
        if action != "deploy":
            sys.exit(__doc__)
        sha, archive = release(tmp)
        env = dict(os.environ)
        env.update({
            "BACKEND_HOST": host,
            "ANSIBLE_SSH_KEY_FILE": str(key),
            "ANSIBLE_CONFIG": str(ANSIBLE / "ansible.cfg"),
            "BACKEND_TARGET": name,
            "DATABASE_URL_POOLED": neon_uri(tgt["neon_branch_id"], pooled=True),
            "DATABASE_URL_DIRECT": neon_uri(tgt["neon_branch_id"], pooled=False),
            "CLOUDFLARE_TUNNEL_TOKEN": tunnel_token(host, v6_prefix),
            "TIGRIS_ACCESS_KEY_ID": os.environ.get("AWS_ACCESS_KEY_ID", ""),
            "TIGRIS_SECRET_ACCESS_KEY": os.environ.get("AWS_SECRET_ACCESS_KEY", ""),
            "TIGRIS_ENDPOINT": os.environ.get("AWS_ENDPOINT_URL", ""),
            "RELEASE_SHA": sha,
            "RELEASE_ARCHIVE": str(archive),
        })
        # Ansible must not mistake Tigris credentials for AWS ones, or pick up the
        # Cloudflare/Hetzner/Neon management tokens it never needs.
        for k in ("AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_ENDPOINT_URL",
                  "CLOUDFLARE_API_TOKEN", "HETZNER_API_KEY", "NEON_API_KEY", "SSH_PRIVATE_KEY"):
            env.pop(k, None)
        print(f"deploying {sha[:12]} to {name} server {tgt['server_id']} ({host}), "
              f"Neon branch {tgt['neon_branch_name']}")
        return subprocess.run(["ansible-playbook", str(ANSIBLE / "playbooks" / "site.yml"), *rest],
                              cwd=ANSIBLE, env=env).returncode
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    args = sys.argv[1:]
    if args[:1] == ["--inner"]:
        sys.exit(inner(args[1:]))
    outer(args)
