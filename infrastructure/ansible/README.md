# Backend host (Ansible)

Builds and operates the dark Medusa backend on Hetzner. Everything on the host
is managed here; don't edit the server over SSH.

```
Browser ──► Cloudflare Access ──► backend.optic.works ──► tunnel (outbound) ──► 127.0.0.1:9000
                                                                                 │
             Hetzner cpx21 (hil): medusa-server + medusa-worker ◄── local Redis ─┤
                                                                                 └─► Neon Postgres (us-west-2)
             hourly restic ─► R2 (opticworks-backups/medusa-v2) + Tigris (opticworks-backend-backups)
```

| Piece | Where |
| --- | --- |
| VM | `opticworks-backend-1`, cpx21, Hillsboro. Hetzner firewall `opticworks-backend`: tcp/8032 + ICMP in, nothing else |
| App | Medusa 2.21.2 from `backend/`, two systemd units (`medusa-server` API on :9000, `medusa-worker` on :9001), both loopback-only |
| Database | Neon project `opticworks-store` (`jolly-moon-85409114`), branch `main`; `dev` for migrations and tests |
| Redis | local, ACL users `medusa` (no admin/destructive commands) and `backup`; AOF + RDB; `noeviction` |
| Edge | tunnel `opticworks-backend`; Access app restricts `backend.optic.works` to the owners. No inbound web ports |
| Backups | hourly Redis RDB, daily Neon `pg_dump`, config → two restic repos; weekly `restic check` reading 5% of data |
| Alerts | any failed backup/check/health unit emails `support@optic.works` via Resend (max 1/unit/hour) |

## Secrets

Nothing secret is stored in this repo or written on the controller. `scripts/run.py`
reads at run time from Infisical:

All secrets live in Infisical project `ubuntu-pair-node`, environment `dev`:

- `/agents/opticworks-backend/credentials`: `JWT_SECRET`, `COOKIE_SECRET`,
  `REDIS_APP_PASSWORD`, `REDIS_BACKUP_PASSWORD`, `RESTIC_PASSWORD`,
  `STRIPE_WEBHOOK_SECRET`. Create once with `scripts/generate_secrets.py`
  (refuses to overwrite: a new `RESTIC_PASSWORD` would orphan every backup).
- `/agents/{neon,stripe,easypost,resend,cloudflare,tigris,hetzner}`: provider
  keys and the deploy SSH key.

Neon connection strings and the tunnel token are fetched from the provider APIs
per run. Provider keys are currently **test mode** (Stripe, EasyPost).

## Runbook

```bash
export INFISICAL_PROFILE=<your profile>          # infisical profile list

# 1. Once: VM (refuses unless the pre-teardown snapshot is available)
agent-harness2/bin/with-secrets hetzner -- python3 -I infrastructure/ansible/scripts/hcloud_provision.py --apply
python3 -I infrastructure/ansible/scripts/run.py rotate-hostkey   # replace the bootstrap host key

# 2. Once: edge (Access is created before DNS, so the hostname is never public)
agent-harness2/bin/with-secrets cloudflare -- sh -c \
  'ACCESS_ALLOWED_EMAILS=you@example.com python3 -I infrastructure/ansible/scripts/cloudflare_setup.py --apply'

# 3. Once: generated secrets
python3 -I infrastructure/ansible/scripts/generate_secrets.py

# 4. Every change: commit backend/, then converge + deploy
python3 -I infrastructure/ansible/scripts/run.py deploy            # extra args go to ansible-playbook
python3 -I infrastructure/ansible/scripts/run.py deploy --check --diff
```

A deploy builds the committed `backend/` into `/srv/medusa/releases/<sha>`, runs
migrations against Neon's direct endpoint, switches `current`, and health-checks.
On failure it restores the previous release and fails.

## Restore

```bash
sudo -i
set -a; . /root/.config/opticworks/restic-r2.env; set +a      # or restic-tigris.env
restic snapshots --tag opticworks-backend
restic restore latest --target /root/restore
# Neon: pg_restore --no-owner -d "<direct url of a NEW branch>" /root/restore/var/backups/opticworks/staging/neon/medusa.dump
# Redis: systemctl stop medusa-worker medusa-server redis-server; copy dump.rdb into /var/lib/redis
#        (move appendonlydir aside); start redis, then the services
```

Restore into a new Neon branch, never over `main` directly. A restore rehearsal
has not been performed yet.
