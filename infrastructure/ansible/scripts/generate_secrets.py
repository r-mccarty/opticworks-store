#!/usr/bin/env python3
"""One-time generation of the backend's own secrets into Infisical.

  python3 -I infrastructure/ansible/scripts/generate_secrets.py

Writes to project ubuntu-pair-node, environment dev, folder
/agents/opticworks-backend/credentials (the agent-harness convention). Refuses
to run if /agents/opticworks-backend already exists: regenerating RESTIC_PASSWORD would make
every existing backup unreadable, and new JWT/cookie secrets log everyone out.
Rotate individual values deliberately in Infisical instead. Prints no values.
"""
import os
import secrets
import subprocess
import sys
import tempfile
from pathlib import Path

PROJECT = "b291efe7-518d-448a-9388-984e715a5b9e"  # ubuntu-pair-node
ENV = "dev"
PARENT = "/agents"
SERVICE = "opticworks-backend"
FOLDER = f"{PARENT}/{SERVICE}/credentials"
PROFILE = os.environ.get("INFISICAL_PROFILE")


def infisical(*args, capture=False, show_errors=False):
    cmd = ["infisical", *args, "--projectId", PROJECT, "--env", ENV, "--silent"]
    if PROFILE:
        cmd += ["--profile", PROFILE]
    # stdout is discarded: `secrets set` echoes values in its result table.
    # stderr is shown only for folder operations, whose errors carry no values.
    r = subprocess.run(cmd, stdout=subprocess.PIPE if capture else subprocess.DEVNULL,
                       stderr=subprocess.PIPE, text=True)
    if r.returncode != 0 and show_errors:
        print("infisical: " + (r.stderr.strip().splitlines() or ["(no error text)"])[-1], file=sys.stderr)
    return r


def main():
    listing = infisical("secrets", "folders", "get", "--path", PARENT, capture=True, show_errors=True)
    if listing.returncode != 0:
        sys.exit(f"Could not list folders in ubuntu-pair-node/{ENV}{PARENT} (check login and access)")
    if any(f"│ {SERVICE} " in line for line in listing.stdout.splitlines()):
        sys.exit(f"{PARENT}/{SERVICE} already exists in ubuntu-pair-node/{ENV}; refusing to regenerate secrets")

    values = {
        "JWT_SECRET": secrets.token_urlsafe(48),
        "COOKIE_SECRET": secrets.token_urlsafe(48),
        "REDIS_APP_PASSWORD": secrets.token_hex(32),
        "REDIS_BACKUP_PASSWORD": secrets.token_hex(32),
        "RESTIC_PASSWORD": secrets.token_urlsafe(48),
        # Inert until a real Stripe webhook endpoint exists: verification fails closed.
        "STRIPE_WEBHOOK_SECRET": "whsec_" + secrets.token_urlsafe(32),
    }

    for name, parent in ((SERVICE, PARENT), ("config", f"{PARENT}/{SERVICE}"), ("credentials", f"{PARENT}/{SERVICE}")):
        if infisical("secrets", "folders", "create", "--name", name, "--path", parent, show_errors=True).returncode != 0:
            sys.exit(f"Could not create folder {parent}/{name}")

    with tempfile.TemporaryDirectory(prefix="gen-") as d:
        os.chmod(d, 0o700)
        f = Path(d) / "secrets.env"
        fd = os.open(f, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(fd, "w") as out:
            out.writelines(f"{k}={v}\n" for k, v in values.items())
        result = infisical("secrets", "set", "--path", FOLDER, "--file", str(f))
    if result.returncode != 0:
        sys.exit("infisical secrets set failed; the folder exists but may be incomplete; inspect it in the dashboard")
    print(f"stored {len(values)} secrets in ubuntu-pair-node/{ENV}{FOLDER}: {', '.join(values)}")


if __name__ == "__main__":
    main()
