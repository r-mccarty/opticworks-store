#!/usr/bin/env python3
"""Gate 3: rebuild the ORIGINAL grandfathered server IN PLACE from stock debian-13.

  bin/with-secrets hetzner -- sh -c \\
    'OPTICWORKS_CONFIRM_SERVER_ID=110578382 python3 -I infrastructure/ansible/scripts/hcloud_rebuild_original.py [--apply]'

Without --apply it only checks preconditions and prints the plan. With --apply it
ERASES the original's disk. Run it only in the owner-approved cutover window
(MIGRATION.md, Gate 2).

Legacy pricing: the only server actions used are `change_protection` and
`rebuild`, which Hetzner documents as not changing legacy pricing. There is no
delete, create, rescale (change_type) or transfer. Hetzner requires delete and
rebuild protection to have the same value, so both come off for the shortest
possible window: they are re-enabled right after the rebuild is accepted,
retrying while the server is locked, and in a `finally` if anything fails.

First contact keeps strict host checking: as in hcloud_provision.py, a fresh
host key goes in through the rebuild's cloud-init user data and is trusted
before the first connection. run.py rotate-hostkey replaces it afterwards.

Uses HETZNER_API_KEY, SSH_USER, SSH_PORT, SSH_PRIVATE_KEY. Prints no secrets.
"""
import importlib.util
import json
import os
import subprocess
import sys
import tempfile
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
TARGETS = json.loads((HERE.parent / "inventory" / "targets.json").read_text())
IMAGE = "debian-13"

# Reuse the provisioning helpers (API call, deploy key, host key, cloud-init) without
# putting this directory on sys.path (scripts run with -I).
_spec = importlib.util.spec_from_file_location("hcloud_provision", HERE / "hcloud_provision.py")
hp = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(hp)
call = hp.call


def wait(action_id, what):
    for _ in range(240):
        a = call("GET", f"/actions/{action_id}")["action"]
        if a["status"] != "running":
            if a["status"] != "success":
                sys.exit(f"{what} failed: {a.get('error')}")
            return
        time.sleep(5)
    sys.exit(f"{what} still running after 20 minutes")


def protect(server_id, on):
    """Set delete+rebuild protection, retrying while a rebuild holds the server lock."""
    for _ in range(120):
        try:
            a = hp_call_soft("POST", f"/servers/{server_id}/actions/change_protection", {"delete": on, "rebuild": on})
        except RuntimeError as e:
            if "locked" in str(e) or "conflict" in str(e):
                time.sleep(5)
                continue
            raise
        wait(a["action"]["id"], "change_protection")
        return
    raise RuntimeError("server stayed locked; set protection manually in the Hetzner console NOW")


def hp_call_soft(method, path, body=None):
    """Like hp.call, but raises instead of exiting so protection can be restored."""
    import urllib.error
    import urllib.request
    req = urllib.request.Request(
        hp.API + path, method=method, data=json.dumps(body).encode() if body is not None else None,
        headers={"Authorization": "Bearer " + os.environ["HETZNER_API_KEY"], "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        try:
            err = json.load(e).get("error", {})
        except Exception:
            err = {}
        raise RuntimeError(f"HTTP {e.code} {err.get('code', '')} {err.get('message', '')}")


def main():
    apply = "--apply" in sys.argv[1:]
    t = TARGETS["original"]
    sid = t["server_id"]
    if os.environ.get("OPTICWORKS_CONFIRM_SERVER_ID") != str(sid):
        sys.exit(f"set OPTICWORKS_CONFIRM_SERVER_ID={sid} (owner approval, MIGRATION.md Gate 2)")
    user = os.environ["SSH_USER"]
    port = os.environ.get("SSH_PORT") or "22"

    s = call("GET", f"/servers/{sid}")["server"]
    loc = (s.get("location") or s.get("datacenter", {}).get("location"))["name"]
    live = {"name": s["name"], "server_type": s["server_type"]["name"], "location": loc,
            "primary_disk_gb": s["primary_disk_size"]}
    drift = {k: v for k, v in live.items() if v != t[k]}
    if drift:
        sys.exit(f"server {sid} drifted from targets.json: {drift}; refusing")
    snap = call("GET", f"/images/{t['recovery_snapshot_id']}")["image"]
    if snap["status"] != "available" or (snap.get("created_from") or {}).get("id") != sid \
            or not snap["protection"]["delete"] or snap["disk_size"] > s["primary_disk_size"]:
        sys.exit(f"recovery snapshot {snap['id']} is not an available, protected, fitting image of {sid}; refusing")
    image = call("GET", f"/images?name={IMAGE}&type=system&architecture=x86")["images"]
    if not image or image[0]["disk_size"] > s["primary_disk_size"]:
        sys.exit(f"{IMAGE} not found or larger than the {s['primary_disk_size']} GB disk")
    ip = s["public_net"]["ipv4"]["ip"]
    print(f"original {sid} {s['name']}: {live}, ip {ip}, protection {s['protection']}")
    print(f"recovery snapshot {snap['id']}: available, protected, {snap['disk_size']} GB (rollback = rebuild from it, same ID)")
    print(f"plan: protection off -> rebuild {sid} IN PLACE from {IMAGE} (disk erased; no resize, no delete) -> protection on")
    if not apply:
        print("dry run; pass --apply in the approved window")
        return

    with tempfile.TemporaryDirectory(prefix="hcr-") as d:
        tmp = Path(d)
        os.chmod(tmp, 0o700)
        deploy_pub = hp.deploy_public_key(tmp)
        host_priv, host_pub = hp.host_keypair(tmp)
        user_data = hp.cloud_init(user, port, deploy_pub, host_priv, host_pub)
        fp = subprocess.check_output(["ssh-keygen", "-lf", str(tmp / "host_ed25519.pub")], text=True).split()[1]

        protected = s["protection"]["delete"] or s["protection"]["rebuild"]
        try:
            if protected:
                protect(sid, False)
                print("protection off")
            a = hp_call_soft("POST", f"/servers/{sid}/actions/rebuild", {"image": IMAGE, "user_data": user_data})
            print(f"rebuild accepted (action {a['action']['id']})")
        finally:
            # Back on even if the rebuild request failed; retries through the rebuild's lock.
            protect(sid, True)
            print("protection on (delete + rebuild)")
        wait(a["action"]["id"], "rebuild")

        known = Path.home() / ".ssh" / "known_hosts"
        entry = f"[{ip}]:{port}"
        subprocess.run(["ssh-keygen", "-R", entry], capture_output=True)
        with open(known, "a") as f:
            f.write(f"{entry} {' '.join(host_pub.split()[:2])}\n")
        print(f"rebuilt {sid}; host key {fp} trusted for {entry}")

    after = call("GET", f"/servers/{sid}")["server"]
    print(f"now: id={after['id']} type={after['server_type']['name']} disk={after['primary_disk_size']}GB "
          f"ip={after['public_net']['ipv4']['ip']} protection={after['protection']} status={after['status']}")
    print("Next: run.py --target original deploy, then rotate-hostkey; hcloud_audit.py; check the invoice.")


if __name__ == "__main__":
    main()
