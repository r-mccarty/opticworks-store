#!/usr/bin/env python3
"""Controller entry point for the backend host.

  python3 -I infrastructure/ansible/scripts/run.py deploy [ansible-playbook args...]
  python3 -I infrastructure/ansible/scripts/run.py rotate-hostkey

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
import urllib.parse
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
ANSIBLE = HERE.parent
REPO = ANSIBLE.parent.parent

HARNESS_PROJECT = "b291efe7-518d-448a-9388-984e715a5b9e"  # ubuntu-pair-node
HARNESS_PATHS = [f"/agents/{s}/{k}" for s in ("opticworks-backend", "neon", "stripe", "easypost", "resend", "cloudflare", "tigris", "hetzner")
                 for k in ("config", "credentials")]
SERVER_NAME = "opticworks-backend-1"
TUNNEL = "opticworks-backend"
NEON_PROJECT = "jolly-moon-85409114"
NEON_BRANCH = "br-wispy-morning-ak26hpef"  # main


def outer(argv):
    """Re-exec under `infisical run` with every needed folder."""
    profile = ["--profile", os.environ["INFISICAL_PROFILE"]] if os.environ.get("INFISICAL_PROFILE") else []
    common = ["--include-imports=false", "--expand=false", "--silent", *profile]
    cmd = ["infisical", "run", f"--projectId={HARNESS_PROJECT}", "--env=dev",
           *[f"--path={p}" for p in HARNESS_PATHS], *common, "--",
           sys.executable, "-I", __file__, "--inner", *argv]
    os.execvp(cmd[0], cmd)


def http_json(url, headers):
    with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=30) as r:
        return json.load(r)


def server_ip():
    d = http_json(f"https://api.hetzner.cloud/v1/servers?name={SERVER_NAME}",
                  {"Authorization": "Bearer " + os.environ["HETZNER_API_KEY"]})
    if not d["servers"]:
        sys.exit(f"{SERVER_NAME} not found; run hcloud_provision.py first")
    return d["servers"][0]["public_net"]["ipv4"]["ip"]


def neon_uri(pooled: bool):
    q = urllib.parse.urlencode({"branch_id": NEON_BRANCH, "database_name": "medusa", "role_name": "medusa",
                                "pooled": str(pooled).lower()})
    uri = http_json(f"https://console.neon.tech/api/v2/projects/{NEON_PROJECT}/connection_uri?{q}",
                    {"Authorization": "Bearer " + os.environ["NEON_API_KEY"]})["uri"]
    # Explicit full verification; pg's next major weakens plain `require`.
    return uri.replace("sslmode=require", "sslmode=verify-full")


def tunnel_token():
    h = {"Authorization": "Bearer " + os.environ["CLOUDFLARE_API_TOKEN"]}
    a = os.environ["ACCOUNT_ID"]
    t = http_json(f"https://api.cloudflare.com/client/v4/accounts/{a}/cfd_tunnel?name={TUNNEL}&is_deleted=false", h)["result"]
    if not t:
        sys.exit(f"Tunnel {TUNNEL} not found; run cloudflare_setup.py first")
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
    action, *rest = argv or ["deploy"]
    host = server_ip()
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
            "DATABASE_URL_POOLED": neon_uri(pooled=True),
            "DATABASE_URL_DIRECT": neon_uri(pooled=False),
            "CLOUDFLARE_TUNNEL_TOKEN": tunnel_token(),
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
        print(f"deploying {sha[:12]} to {SERVER_NAME} ({host})")
        return subprocess.run(["ansible-playbook", str(ANSIBLE / "playbooks" / "site.yml"), *rest],
                              cwd=ANSIBLE, env=env).returncode
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    args = sys.argv[1:]
    if args[:1] == ["--inner"]:
        sys.exit(inner(args[1:]))
    outer(args)
