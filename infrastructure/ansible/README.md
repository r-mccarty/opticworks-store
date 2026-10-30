# Backend host (Ansible)

Builds and operates the dark Medusa backend on Hetzner. Everything on the host
is managed here; don't edit the server over SSH.

**Topology is in transition.** The final host is the original, grandfathered
40 GB CPX21 (`110578382`). `opticworks-backend-1` (`173582205`) is temporary
staging and gets deleted after cutover. Read [MIGRATION.md](MIGRATION.md) before
any Hetzner action: deleting, recreating or rescaling the original loses its legacy price.

```
Browser ──► Cloudflare Access ──► backend.optic.works ──► tunnel (outbound) ──► 127.0.0.1:9000
                                                                                 │
             Hetzner cpx21 (hil): medusa-server + medusa-worker ◄── local Redis ─┤
                                                                                 └─► Neon Postgres (us-west-2)
             hourly restic ─► R2 (opticworks-backups/medusa-v2) + Tigris (opticworks-backend-backups)
```

| Piece | Where |
| --- | --- |
| VM | `--target staging`: `opticworks-backend-1` (temporary, 80 GB). `--target original`: the grandfathered 40 GB CPX21, after Gate 2 approval. Both are cpx21 in Hillsboro and listed in `inventory/targets.json` by server ID |
| App | Medusa 2.21.2 from `backend/`, two systemd units (`medusa-server` API on :9000, `medusa-worker` on :9001), both loopback-only |
| Database | Neon project `opticworks-store` (`jolly-moon-85409114`): staging uses branch `dev`, the original uses `main` |
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

# 0. Any time: read-only check of both servers, the recovery snapshot and staging's resources
agent-harness2/bin/with-secrets hetzner -- python3 -I infrastructure/ansible/scripts/hcloud_audit.py

# 1. Once (done): the temporary staging VM, from stock debian-13
agent-harness2/bin/with-secrets hetzner -- python3 -I infrastructure/ansible/scripts/hcloud_provision.py --apply
python3 -I infrastructure/ansible/scripts/run.py --target staging rotate-hostkey   # replace the bootstrap host key

# 2. Once: edge (Access is created before DNS, so the hostname is never public)
agent-harness2/bin/with-secrets cloudflare -- sh -c \
  'ACCESS_ALLOWED_EMAILS=you@example.com python3 -I infrastructure/ansible/scripts/cloudflare_setup.py --apply'

# 3. Once: generated secrets
python3 -I infrastructure/ansible/scripts/generate_secrets.py

# 4. Every change: commit backend/, then converge + deploy
python3 -I infrastructure/ansible/scripts/run.py --target staging deploy   # extra args go to ansible-playbook
python3 -I infrastructure/ansible/scripts/run.py --target staging deploy --check --diff
# The original only after the owner's Gate 2 approval (MIGRATION.md):
agent-harness2/bin/with-secrets hetzner -- sh -c 'OPTICWORKS_CONFIRM_SERVER_ID=110578382 \
  python3 -I infrastructure/ansible/scripts/hcloud_rebuild_original.py'   # dry run; --apply ERASES it
python3 -I infrastructure/ansible/scripts/run.py --target staging stop-tunnel     # one connector at a time
OPTICWORKS_CONFIRM_SERVER_ID=110578382 python3 -I infrastructure/ansible/scripts/run.py --target original deploy
```

A deploy builds the committed `backend/` into `/srv/medusa/releases/<sha>`, runs
migrations against Neon's direct endpoint, switches `current`, and health-checks.
On failure it restores the previous release and fails.

## Restore

```bash
sudo -i
set -a; . /root/.config/opticworks/restic-r2.env; set +a      # or restic-tigris.env
restic snapshots --tag opticworks-backend --host opticworks-staging   # or opticworks-original
restic restore latest --target /root/restore
# Neon: PGSSLROOTCERT=system pg_restore --no-owner -d "<direct url of a NEW branch>" /root/restore/var/backups/opticworks/staging/neon/medusa.dump
# Redis: systemctl stop medusa-worker medusa-server redis-server; copy dump.rdb into /var/lib/redis
#        (move appendonlydir aside); start redis, then the services
```

Restore into a new Neon branch, never over `main` directly. A restore rehearsal
has not been performed yet.
