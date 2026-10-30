#!/usr/bin/env python3
"""Create the TEMPORARY staging VM on Hetzner Cloud with a pre-trusted SSH host key.

This only ever creates `opticworks-backend-1` (targets.json `staging`), a new
server at the current list price, from the stock `debian-13` image. It does not
use snapshot 449822273: that snapshot is the recovery artifact of the original
grandfathered server and is only checked to exist before anything is built.
The original server is never created, rebuilt or resized here (MIGRATION.md).

Run with the Hetzner folder injected (agent-harness2):
  bin/with-secrets hetzner -- python3 -I infrastructure/ansible/scripts/hcloud_provision.py [--apply]

Without --apply it only checks preconditions and prints the plan.

Trust model: a fresh ed25519 host key is generated locally and delivered via
cloud-init over the authenticated Hetzner API, so its fingerprint is known
before the first SSH connection and StrictHostKeyChecking stays on. Because
cloud-init user data is readable from the metadata service, the base role
rotates this key on first contact and blocks non-root metadata access.

Uses HETZNER_API_KEY, SSH_USER, SSH_PORT, SSH_PRIVATE_KEY. Prints no secrets.
"""
import json
import os
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
from pathlib import Path

NAME = "opticworks-backend-1"
SERVER_TYPE = "cpx21"
LOCATION = "hil"
IMAGE = "debian-13"
FIREWALL = "opticworks-backend"
SSH_KEY_NAME = "opticworks-deploy"
# The provider snapshot taken before teardown must exist before we build anything.
REQUIRED_SNAPSHOT_ID = 449822273
LABELS = {"app": "opticworks-backend", "managed-by": "ansible", "role": "staging", "temporary": "true"}
TARGETS = json.loads((Path(__file__).resolve().parents[1] / "inventory" / "targets.json").read_text())

API = "https://api.hetzner.cloud/v1"


def call(method, path, body=None):
    req = urllib.request.Request(
        API + path,
        method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"Authorization": "Bearer " + os.environ["HETZNER_API_KEY"], "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.load(r) if r.status != 204 else {}
    except urllib.error.HTTPError as e:
        try:
            err = json.load(e).get("error", {})
        except Exception:
            err = {}
        sys.exit(f"Hetzner API {method} {path}: HTTP {e.code} {err.get('code', '')} {err.get('message', '')}")


def deploy_public_key(tmp: Path) -> str:
    """Derive the public key from the injected private key (rewrapped like ssh-hetzner.py)."""
    lines = [l.strip() for l in os.environ["SSH_PRIVATE_KEY"].strip().splitlines() if l.strip()]
    body = "".join(lines[1:-1])
    key = "\n".join([lines[0]] + [body[i:i + 70] for i in range(0, len(body), 70)] + [lines[-1]]) + "\n"
    kp = tmp / "deploy"
    fd = os.open(kp, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, "w") as f:
        f.write(key)
    return subprocess.check_output(["ssh-keygen", "-y", "-f", str(kp)], text=True).strip()


def host_keypair(tmp: Path) -> tuple[str, str]:
    kp = tmp / "host_ed25519"
    subprocess.check_call(["ssh-keygen", "-q", "-t", "ed25519", "-N", "", "-C", NAME, "-f", str(kp)])
    return kp.read_text(), (tmp / "host_ed25519.pub").read_text().strip()


def cloud_init(user: str, port: str, deploy_pub: str, host_priv: str, host_pub: str) -> str:
    cfg = {
        "disable_root": True,
        "ssh_pwauth": False,
        "ssh_deletekeys": True,
        "ssh_genkeytypes": [],
        "ssh_keys": {"ed25519_private": host_priv, "ed25519_public": host_pub},
        "users": [{
            "name": user,
            "groups": ["sudo"],
            "shell": "/bin/bash",
            "lock_passwd": True,
            "sudo": "ALL=(ALL) NOPASSWD:ALL",
            "ssh_authorized_keys": [deploy_pub],
        }],
        "write_files": [{
            "path": "/etc/ssh/sshd_config.d/10-bootstrap.conf",
            "permissions": "0644",
            "content": (f"Port {port}\nPermitRootLogin no\nPasswordAuthentication no\n"
                        f"KbdInteractiveAuthentication no\nAllowUsers {user}\n"),
        }],
        "runcmd": [["systemctl", "restart", "ssh"]],
    }
    return "#cloud-config\n" + json.dumps(cfg)


def main():
    apply = "--apply" in sys.argv[1:]
    user = os.environ["SSH_USER"]
    port = os.environ.get("SSH_PORT") or "22"

    snap = call("GET", f"/images/{REQUIRED_SNAPSHOT_ID}")["image"]
    if snap["status"] != "available":
        sys.exit(f"Snapshot {REQUIRED_SNAPSHOT_ID} is {snap['status']}; refusing to continue")
    if (snap.get("created_from") or {}).get("id") != TARGETS["original"]["server_id"]:
        sys.exit(f"Snapshot {REQUIRED_SNAPSHOT_ID} is not from the original server; refusing to continue")
    print(f"recovery snapshot {REQUIRED_SNAPSHOT_ID} of the original: available ({snap['created']}); not used as the image")

    existing = call("GET", f"/servers?name={NAME}")["servers"]
    if existing:
        s = existing[0]
        sys.exit(f"{NAME} already exists (id={s['id']}, ip={s['public_net']['ipv4']['ip']}); nothing to do")

    print(f"plan: create TEMPORARY staging server {NAME} {SERVER_TYPE} in {LOCATION} from {IMAGE}, firewall {FIREWALL} (tcp/{port} + icmp only)")
    if not apply:
        print("dry run; pass --apply to create")
        return

    with tempfile.TemporaryDirectory(prefix="hcp-") as t:
        tmp = Path(t)
        os.chmod(tmp, 0o700)
        deploy_pub = deploy_public_key(tmp)

        keys = call("GET", f"/ssh_keys?name={SSH_KEY_NAME}")["ssh_keys"]
        if not keys:
            call("POST", "/ssh_keys", {"name": SSH_KEY_NAME, "public_key": deploy_pub, "labels": LABELS})
            print(f"registered ssh key {SSH_KEY_NAME}")

        fws = call("GET", f"/firewalls?name={FIREWALL}")["firewalls"]
        if fws:
            fw_id = fws[0]["id"]
        else:
            fw_id = call("POST", "/firewalls", {
                "name": FIREWALL,
                "labels": LABELS,
                "rules": [
                    {"direction": "in", "protocol": "tcp", "port": port,
                     "source_ips": ["0.0.0.0/0", "::/0"], "description": "SSH"},
                    {"direction": "in", "protocol": "icmp", "source_ips": ["0.0.0.0/0", "::/0"]},
                ],
            })["firewall"]["id"]
            print(f"created firewall {FIREWALL} ({fw_id})")

        host_priv, host_pub = host_keypair(tmp)
        created = call("POST", "/servers", {
            "name": NAME,
            "server_type": SERVER_TYPE,
            "location": LOCATION,
            "image": IMAGE,
            "ssh_keys": [SSH_KEY_NAME],
            "firewalls": [{"firewall": fw_id}],
            "user_data": cloud_init(user, port, deploy_pub, host_priv, host_pub),
            "labels": LABELS,
            "public_net": {"enable_ipv4": True, "enable_ipv6": True},
        })
        server = created["server"]
        ip = server["public_net"]["ipv4"]["ip"]

        # Trust the pre-generated key for this exact host:port before first contact.
        known = Path.home() / ".ssh" / "known_hosts"
        entry = f"[{ip}]:{port} {' '.join(host_pub.split()[:2])}"
        with open(known, "a") as f:
            f.write(entry + "\n")
        fp = subprocess.check_output(["ssh-keygen", "-lf", str(tmp / "host_ed25519.pub")], text=True).split()[1]
        print(f"server id={server['id']} ip={ip}; host key {fp} added to known_hosts")

    for _ in range(60):
        status = call("GET", f"/servers/{server['id']}")["server"]["status"]
        if status == "running":
            break
        time.sleep(5)
    print(f"status: {status}. Record server id {server['id']} as `staging` in inventory/targets.json, then "
          "run.py --target staging. Do not change the shared SSH_HOST: it still names the original.")


if __name__ == "__main__":
    main()
