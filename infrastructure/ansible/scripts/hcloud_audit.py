#!/usr/bin/env python3
"""Read-only Hetzner audit of the deploy targets (Gate 0 / Gate 3 / Gate 4 check).

  bin/with-secrets hetzner -- python3 -I infrastructure/ansible/scripts/hcloud_audit.py

Checks every target in inventory/targets.json by server ID and reports drift:
type, location, primary disk, protection, and the recovery snapshot of the
original. Also lists which billable resources are exclusive to the temporary
staging server (to delete with it in Gate 4) and which are shared (to keep).
Makes only GET requests. The API reports the current list price for a server
type, not a grandfathered rate: confirm legacy pricing on the Hetzner invoice.

Exit status 1 if anything drifted. Uses HETZNER_API_KEY. Prints no secrets.
"""
import json
import os
import sys
import urllib.request
from pathlib import Path

TARGETS = json.loads((Path(__file__).resolve().parents[1] / "inventory" / "targets.json").read_text())
API = "https://api.hetzner.cloud/v1"


def get(path):
    req = urllib.request.Request(API + path, headers={"Authorization": "Bearer " + os.environ["HETZNER_API_KEY"]})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def server(server_id):
    try:
        return get(f"/servers/{server_id}")["server"]
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None
        raise


def main():
    problems = []
    servers = {}
    for role, t in TARGETS.items():
        if role.startswith("_"):
            continue
        s = server(t["server_id"])
        if s is None:
            # A missing original is the one outcome that must never be "fixed" by recreating it.
            problems.append(f"{role}: server {t['server_id']} NOT FOUND")
            continue
        servers[role] = s
        loc = (s.get("location") or s.get("datacenter", {}).get("location"))["name"]
        print(f"{role}: id={s['id']} name={s['name']} status={s['status']} type={s['server_type']['name']} "
              f"loc={loc} disk={s['primary_disk_size']}GB ipv4={s['public_net']['ipv4']['ip']} "
              f"protection={s['protection']} created={s['created']}")
        for field, live in (("server_type", s["server_type"]["name"]), ("location", loc),
                            ("primary_disk_gb", s["primary_disk_size"]), ("name", s["name"])):
            if live != t[field]:
                problems.append(f"{role}: {field} is {live!r}, expected {t[field]!r}")
        if role == "original" and not (s["protection"]["delete"] and s["protection"]["rebuild"]):
            problems.append(f"original: protection is {s['protection']}; expected delete and rebuild protection")

    orig = TARGETS["original"]
    snap_id = orig["recovery_snapshot_id"]
    try:
        snap = get(f"/images/{snap_id}")["image"]
        print(f"recovery snapshot: id={snap_id} status={snap['status']} disk={snap['disk_size']}GB "
              f"from={snap['created_from']} protection={snap['protection']}")
        if (snap.get("created_from") or {}).get("id") != orig["server_id"]:
            problems.append(f"snapshot {snap_id} was not created from the original server")
        if not snap["protection"]["delete"]:
            print("  note: snapshot has no delete protection")
    except urllib.error.HTTPError:
        problems.append(f"recovery snapshot {snap_id} NOT FOUND")

    if "staging" in servers:
        sid = servers["staging"]["id"]
        others = {s["id"] for r, s in servers.items() if r != "staging"}
        print("staging resources (exclusive = delete with the server in Gate 4; shared = keep):")
        for fw in get("/firewalls")["firewalls"]:
            on = {a["server"]["id"] for a in fw["applied_to"] if a["type"] == "server"}
            if sid in on:
                print(f"  firewall {fw['id']} {fw['name']}: {'shared' if on & others else 'exclusive'}")
        for ip in get("/primary_ips")["primary_ips"]:
            if ip["assignee_id"] == sid:
                print(f"  primary ip {ip['id']} {ip['ip']}: exclusive, auto_delete={ip['auto_delete']}")
        for key in ("volumes", "floating_ips"):
            for v in get(f"/{key}")[key]:
                if v.get("server") == sid:
                    print(f"  {key[:-1]} {v['id']}: attached to staging")
        for img in get("/images?type=snapshot")["images"] + get("/images?type=backup")["images"]:
            if (img.get("created_from") or {}).get("id") == sid:
                print(f"  image {img['id']} ({img['type']}): made from staging; {img['disk_size']}GB, "
                      f"cannot be used to rebuild the {orig['primary_disk_gb']}GB original")
        print("  ssh key opticworks-deploy: shared (also needed to reach the original); keep")

    for p in problems:
        print("DRIFT: " + p, file=sys.stderr)
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
