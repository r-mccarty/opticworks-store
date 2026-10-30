#!/usr/bin/env python3
"""Idempotently create the dark backend's Cloudflare edge.

  bin/with-secrets cloudflare -- python3 -I infrastructure/ansible/scripts/cloudflare_setup.py [--apply]

Order matters: tunnel -> ingress -> Access application -> DNS. The hostname is
only published after Access protects it, so it is never briefly public.
Existing DNS records pointing elsewhere are never overwritten. Prints IDs only.

Env: ACCOUNT_ID, CLOUDFLARE_API_TOKEN, ACCESS_ALLOWED_EMAILS (comma-separated).
"""
import json
import os
import sys
import urllib.error
import urllib.request

ZONE = "optic.works"
HOSTNAME = "backend.optic.works"
TUNNEL = "opticworks-backend"
ORIGIN = "http://127.0.0.1:9000"
APP_NAME = "OpticWorks backend (dark)"

A = os.environ["ACCOUNT_ID"]
API = "https://api.cloudflare.com/client/v4"


def call(method, path, body=None):
    req = urllib.request.Request(
        API + path,
        method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"Authorization": "Bearer " + os.environ["CLOUDFLARE_API_TOKEN"], "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.load(r)["result"]
    except urllib.error.HTTPError as e:
        try:
            errs = [(x.get("code"), x.get("message")) for x in json.load(e).get("errors", [])]
        except Exception:
            errs = []
        sys.exit(f"Cloudflare {method} {path.split('?')[0]}: HTTP {e.code} {errs}")


def main():
    apply = "--apply" in sys.argv[1:]
    emails = [e.strip() for e in os.environ.get("ACCESS_ALLOWED_EMAILS", "").split(",") if e.strip()]
    if not emails:
        sys.exit("Set ACCESS_ALLOWED_EMAILS")

    zone_id = call("GET", f"/zones?name={ZONE}")[0]["id"]
    tunnels = call("GET", f"/accounts/{A}/cfd_tunnel?name={TUNNEL}&is_deleted=false")
    apps = [a for a in call("GET", f"/accounts/{A}/access/apps") if a.get("domain") == HOSTNAME]
    records = call("GET", f"/zones/{zone_id}/dns_records?name={HOSTNAME}")
    print(f"tunnel exists: {bool(tunnels)}; access app exists: {bool(apps)}; dns records: {len(records)}")
    if not apply:
        print("dry run; pass --apply")
        return

    tunnel_id = tunnels[0]["id"] if tunnels else call(
        "POST", f"/accounts/{A}/cfd_tunnel", {"name": TUNNEL, "config_src": "cloudflare"})["id"]
    print(f"tunnel {TUNNEL}: {tunnel_id}")

    call("PUT", f"/accounts/{A}/cfd_tunnel/{tunnel_id}/configurations", {"config": {"ingress": [
        {"hostname": HOSTNAME, "service": ORIGIN, "originRequest": {"connectTimeout": 10, "noTLSVerify": False}},
        {"service": "http_status:404"},
    ]}})
    print(f"ingress: {HOSTNAME} -> {ORIGIN}; everything else 404")

    if apps:
        app_id = apps[0]["id"]
    else:
        app_id = call("POST", f"/accounts/{A}/access/apps", {
            "name": APP_NAME,
            "domain": HOSTNAME,
            "type": "self_hosted",
            "session_duration": "24h",
            "app_launcher_visible": False,
            "http_only_cookie_attribute": True,
            "same_site_cookie_attribute": "lax",
            "policies": [{
                "name": "Owners",
                "decision": "allow",
                "include": [{"email": {"email": e}} for e in emails],
            }],
        })["id"]
    # Never publish the hostname unless Access is verifiably in front of it.
    app = call("GET", f"/accounts/{A}/access/apps/{app_id}")
    if app.get("domain") != HOSTNAME or not app.get("policies"):
        sys.exit("Access application has no policy; refusing to publish DNS")
    print(f"access app: {app_id} ({len(app['policies'])} policy)")

    target = f"{tunnel_id}.cfargotunnel.com"
    if records:
        rec = records[0]
        if rec["type"] != "CNAME" or rec["content"] != target or not rec.get("proxied"):
            sys.exit(f"{HOSTNAME} already has a {rec['type']} record to another target; not overwriting")
        print("dns: already correct")
    else:
        call("POST", f"/zones/{zone_id}/dns_records", {
            "type": "CNAME", "name": HOSTNAME, "content": target, "proxied": True,
            "comment": "Dark Medusa backend via tunnel; protected by Cloudflare Access",
        })
        print(f"dns: {HOSTNAME} CNAME (proxied) -> tunnel")


if __name__ == "__main__":
    main()
