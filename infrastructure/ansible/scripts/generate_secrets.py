#!/usr/bin/env python3
"""One-time generation of the backend's own secrets into Infisical.

  python3 -I infrastructure/ansible/scripts/generate_secrets.py

Writes to project opticworks-store, environment prod, folder /backend. Refuses
to run if that folder already exists: regenerating RESTIC_PASSWORD would make
every existing backup unreadable, and new JWT/cookie secrets log everyone out.
Rotate individual values deliberately in Infisical instead. Prints no values.
"""
import os
import secrets
import subprocess
import sys
import tempfile
from pathlib import Path

PROJECT = "42e9e77c-88fa-4cbb-925b-5064c8e3b18c"  # opticworks-store
ENV = "prod"
FOLDER = "backend"
PROFILE = os.environ.get("INFISICAL_PROFILE")


def infisical(*args, capture=False):
    cmd = ["infisical", *args, "--projectId", PROJECT, "--env", ENV]
    if PROFILE:
        cmd += ["--profile", PROFILE]
    # Output is discarded: `secrets set` echoes values in its result table.
    return subprocess.run(cmd, stdout=subprocess.PIPE if capture else subprocess.DEVNULL,
                          stderr=subprocess.DEVNULL, text=True)


def main():
    listing = infisical("secrets", "folders", "get", "--path", "/", capture=True)
    if listing.returncode != 0:
        sys.exit("Could not list folders in opticworks-store/prod (check login and access)")
    if any(f"│ {FOLDER} " in line for line in listing.stdout.splitlines()):
        sys.exit(f"/{FOLDER} already exists in opticworks-store/prod; refusing to regenerate secrets")

    values = {
        "JWT_SECRET": secrets.token_urlsafe(48),
        "COOKIE_SECRET": secrets.token_urlsafe(48),
        "REDIS_APP_PASSWORD": secrets.token_hex(32),
        "REDIS_BACKUP_PASSWORD": secrets.token_hex(32),
        "RESTIC_PASSWORD": secrets.token_urlsafe(48),
        # Inert until a real Stripe webhook endpoint exists: verification fails closed.
        "STRIPE_WEBHOOK_SECRET": "whsec_" + secrets.token_urlsafe(32),
    }

    if infisical("secrets", "folders", "create", "--name", FOLDER, "--path", "/").returncode != 0:
        sys.exit(f"Could not create folder /{FOLDER}")

    with tempfile.TemporaryDirectory(prefix="gen-") as d:
        os.chmod(d, 0o700)
        f = Path(d) / "secrets.env"
        fd = os.open(f, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(fd, "w") as out:
            out.writelines(f"{k}={v}\n" for k, v in values.items())
        result = infisical("secrets", "set", "--path", f"/{FOLDER}", "--file", str(f))
    if result.returncode != 0:
        sys.exit("infisical secrets set failed; the folder exists but may be incomplete; inspect it in the dashboard")
    print(f"stored {len(values)} secrets in opticworks-store/{ENV}/{FOLDER}: {', '.join(values)}")


if __name__ == "__main__":
    main()
