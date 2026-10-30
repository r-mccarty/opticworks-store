# Migration to the original CPX21

The backend's final home is the **original, grandfathered CPX21**, not the VM
this PR created. `opticworks-backend-1` is temporary staging: use it to bring up
and validate the stack, then delete it. Owner direction: PR #137 comments of
2026-10-30.

| Role | Server ID | Name | Disk | Price | Fate |
| --- | --- | --- | --- | --- | --- |
| `original` | `110578382` | `debian-2gb-hil-1-test-instance` | 40 GB | $13.99/mo (legacy) | Rebuild in place, keep forever |
| `staging` | `173582205` | `opticworks-backend-1` | 80 GB | $37.49/mo (current) | Delete in Gate 4 |

Both are listed in [`inventory/targets.json`](inventory/targets.json). Scripts resolve
servers **by ID** and stop on drift. Check with
`bin/with-secrets hetzner -- python3 -I scripts/hcloud_audit.py`.

## Hard rules (Hetzner legacy pricing)

Per the [Hetzner billing FAQ](https://docs.hetzner.com/cloud/billing/faq/#which-customer-actions-cause-servers-with-legacy-prices-to-switch-to-the-current-pricing):

- **Keeps** legacy pricing: rebuilding in place; a transfer to a project with the
  same billing currency.
- **Loses** legacy pricing: **any rescale** (up or down), **restoring a deleted
  server**, a transfer to a project with a different currency.

So the original server is **never deleted, recreated, rescaled, or transferred
across currencies**. Restoring snapshot `449822273` onto a *new* server does not
count as an in-place rebuild. If Hetzner's rules are ambiguous for a step, stop,
ask Hetzner, and get owner approval before going further.

The original's delete and rebuild protection is **on**. Hetzner blocks rebuilding
a protected server, so turning that protection off for the cutover needs specific
owner approval, and it must be turned back on right after.

## Image compatibility

- An image of the 80 GB staging server **cannot** rebuild the 40 GB original. A
  server can't take an image whose disk is larger than its own. Never plan an
  image-based copy from staging.
- `hcloud_provision.py` builds staging from stock `debian-13`. Snapshot `449822273`
  (40 GB, created from the original) is the original's **recovery artifact**. It is
  not a build source.
- Rebuild path: the stock `debian-13` image on the original, then the same pinned
  Ansible converge and release (`run.py --target original deploy`), then a
  separate data restore. Neon holds the database, so the host carries only Redis
  state and config.

## Gate 0: inventory (read-only) — 2026-10-30

Done using only the Hetzner, Neon and Cloudflare APIs:

- **Original** `110578382`: running, cpx21 / hil, 40 GB disk, Debian 13, IPv4
  `5.78.106.67`, created 2025-10-11. Delete and rebuild protection are on. No Hetzner
  firewall, volumes, floating IPs, or backups attached. It is still the shared
  `SSH_HOST` in Infisical `/agents/hetzner/config` (unchanged).
- **Staging** `173582205`: running, cpx21 / hil, 80 GB, IPv4 `5.78.211.217`, no
  protection. Exclusive resources: firewall `opticworks-backend` (`11927072`, applied
  only to staging) and primary IPs `158978120` / `158978121` (auto-delete).
  The SSH key `opticworks-deploy` (`131963477`) is shared: keep it.
- **Snapshot** `449822273`: available, 40 GB (2.3 GB used), created from the original
  on 2026-10-30. Delete protection on (owner, 2026-10-30).
- **Neon** `jolly-moon-85409114`: `main` (`br-wispy-morning-ak26hpef`, default) and
  `dev` (`br-lingering-frost-ak09xb0l`). Neither is protected.
- **Cloudflare**: tunnel `opticworks-backend` is inactive (no connector yet).
  Legacy tunnel `opticworks-medusa` is down. `backend.optic.works` → new tunnel, behind
  Access app "OpticWorks backend (dark)". `api.` / `medusa.` CNAMEs → legacy tunnel,
  served by the 503 offline Worker.
- **Original host (SSH, read-only, owner-approved, 2026-10-30):** Debian 13, 38 GB
  filesystem with 7.7 GB used, up 49 weeks. Only `sshd` listens (`:8032`). The legacy
  stack is stopped: pm2 Medusa, local PostgreSQL 17 (86 MB in `/var/lib/postgresql`)
  and Redis are enabled but not running. Legacy files: `/home/ryan/opticworks-store`,
  `/opt/opticworks`, `.cloudflared` credentials for the legacy tunnel, `/root/.claude`.
  Empty crontab, no Docker. ufw and fail2ban are enabled. **Since snapshot `449822273`
  only a DHCP lease file changed**, so the snapshot is a complete recovery copy.
  Owner: nothing on it needs keeping.
- The API can't show the billed rate. Confirm $13.99 on the Hetzner invoice or in the console.

## Gate 1: staging (`--target staging`)

Staging was recreated on 2026-10-30 (old ID `173468157`, deleted before anything
was deployed): its pre-trusted host key had never been recorded on this
controller. The new server got the same IPv4.

Deploy, run dark end-to-end tests, and rehearse a restore, all on staging only.
Staging uses Neon `dev`. Live commerce and webhooks stay off.

- [x] `generate_secrets.py` succeeded (2026-10-30)
- [x] `run.py --target staging deploy` succeeded at `6e4ab50` (ok=71, failed=0), then
      `rotate-hostkey` (now `SHA256:eGJrmKQaO+zL/VlTbDAnXL59GAy1JILMnLfe+ArKBlI`)
- [x] Loopback probes: `/health` 200; store without a key 400; admin without auth 401;
      legacy paths never 2xx; 11th bad login 429; store with a publishable key lists
      **0** products (seeded drafts hidden), regions 200. Only SSH listens publicly
- [x] Edge: anonymous `/`, `/health`, `/app`, `/store/products` → 302 to Access
- [x] Through Access with the owner's service token (`/agents/opticworks-backend`):
      `/health` and `/app` 200. Admin `support@optic.works` (password in Infisical
      `MEDUSA_ADMIN_PASSWORD`): wrong password 401, login 200, `/admin/users/me` 200, admin
      lists the two drafts. Python's default User-Agent gets a Cloudflare 403: set one
- [x] Live integrations (test-mode keys): a password-reset email went to `support@optic.works`
      through Resend. A temporary published product and cart to the company address got
      EasyPost rates (Ground Advantage $20.91, Priority $25.08; FedEx 2Day unavailable, failing
      closed). Stripe Tax: $1.94 on $25 (shipping untaxed). A Stripe test PaymentIntent was
      created (`livemode: false`) but not confirmed. The test product was deleted. Use the
      `optic.works storefront` publishable key: Medusa's auto-created "Default Publishable API
      Key" points at a sales channel with no stock location, so it offers no shipping options
- [x] First backup landed in R2 **and** Tigris (`--host opticworks-staging`). The Tigris repo
      passed `restic check`
- [x] Restore rehearsal: R2 snapshot → `pg_restore` into an empty database on a new
      Neon branch. 147 tables and 665 rows, identical per-table counts to `dev`.
      The rehearsal branch was deleted afterwards. Booting Medusa against a restored
      branch has not been tested
- [x] Recorded: Medusa 2.21.2, Node 22, pnpm 10.18.1, Debian 13. Disk use 5.1 GB of 75 GB;
      `/srv/medusa` 1.1 GB with one release, so ~3 GB at three retained releases. **Fits
      the 40 GB original.** RAM use about 1 GB of 3.8 GB

Fixes the first real converge needed (all in this PR): `group_vars` was never
loaded; the journald drop-in directory was missing; Medusa writes `~/.config` (EROFS);
seccomp killed `chown` (SIGSYS); a release that couldn't start skipped rollback;
`pg_dump` needed `PGSSLROOTCERT=system`; Neon API resets needed a retry.

## Gate 2: plan for the original — STOP for owner approval

- [x] Inventory (Gate 0). Nothing to keep. Snapshot `449822273` (protected, 40 GB,
      current) is the independent recovery copy
- [x] Rebuild API (Hetzner OpenAPI spec, 2026-10-30): `POST /servers/{id}/actions/rebuild`
      takes `image` and **`user_data`**. It runs on the same server, so ID, primary IPs and
      type are kept. First boot therefore uses the same pre-trusted host key as staging,
      and strict checking stays on. **Delete and rebuild protection must have the same
      value**, so both are off for the rebuild window. `hcloud_rebuild_original.py` re-enables
      them as soon as the rebuild is accepted (retrying through the lock), including on failure
- [x] Tooling: `scripts/hcloud_rebuild_original.py` (dry run checked: no drift, snapshot
      protected and fitting); `run.py --target staging stop-tunnel`
- **Downtime:** none user-facing. The site doesn't use this backend (dark, Access-only),
  and the original serves nothing today. `backend.optic.works` is down from `stop-tunnel`
  until the original's deploy finishes (about 10–15 minutes)
- **Rollback:** at any point, rebuild `110578382` again from snapshot `449822273` (same
  ID, legacy price kept), or restart `cloudflared` on staging (`run.py --target staging deploy`)
- **Data on Neon `main`:** the deploy runs migrations. The seed and the admin user exist only
  on `dev`, so once `main` is migrated run the seed once and create the admin user. The
  storefront publishable key is per database, so `main` gets a new one
- **Firewall:** apply Hetzner firewall `11927072` to the original as defense in depth (it then
  becomes shared: keep it in Gate 4)
- [x] **Owner approved (2026-10-30):** the window; protection off/on; the in-place rebuild (erases the disk);
      Neon `main` for the original (seed + admin user); applying the firewall

## Gate 3: cutover (owner-scheduled)

```bash
H="agent-harness2/bin/with-secrets hetzner --"; export OPTICWORKS_CONFIRM_SERVER_ID=110578382
$H python3 -I scripts/hcloud_audit.py                                  # no drift
$H python3 -I scripts/hcloud_rebuild_original.py --apply               # same ID, debian-13, protection back on
python3 -I scripts/run.py --target staging stop-tunnel                 # one connector only
python3 -I scripts/run.py --target original deploy                     # Neon main; refuses while staging is connected
python3 -I scripts/run.py --target original rotate-hostkey
```

Then: seed `main` and create the admin user; repeat the Gate 1 probes, integrations and a
restore rehearsal (`--host opticworks-original`); apply firewall `11927072`; update only the
scoped SSH/agent-harness references (the `/agents/hetzner` `SSH_HOST` stays `5.78.106.67`,
but its host key changes); run `hcloud_audit.py`; confirm the invoice still shows $13.99.

### Gate 3 result — 2026-10-30 (cutover done)

- [x] Pre-flight audit clean. `hcloud_rebuild_original.py --apply`: protection off →
      rebuild from `debian-13` → protection on. Still `110578382`, cpx21, 40 GB, `5.78.106.67`,
      created 2025-10-11 (same server). Host key pre-trusted, then rotated
      (`SHA256:3dNLJ8Iu1qEOEz9wSaV0SkfZZL8w8fNC/xQGnLmmyZw`) and recorded in Infisical
      `/agents/hetzner/config` `SSH_KNOWN_HOSTS`. The login key `SSH_PRIVATE_KEY` is unchanged
- [x] `stop-tunnel` on staging (0 connections), then `run.py --target original deploy` at
      `58a4b5a` (ok=72, failed=0; one more fix: release pruning on a first release). The tunnel
      is healthy from the original's IPv6 only
- [x] Neon `main`: migrations (deploy); seed run once (region, `OpticWorks Store` channel, two
      draft products, new storefront publishable key); admin `support@optic.works` created
- [x] Probes as in Gate 1 pass on the original. Through Access: admin login; EasyPost rates,
      Stripe Tax and a Stripe test PaymentIntent on a temporary product (deleted again; it and
      one abandoned test cart remain soft-deleted in `main`)
- [x] Backups `--host opticworks-original` in R2 and Tigris. Restore rehearsal from a fresh
      backup into an empty database on a temporary branch of `main`: 147 tables and 694 rows,
      identical. The branch was deleted
- [x] Firewall `11927072` applied to the original (now shared with staging). SSH verified after
- [x] agent-harness2 updated (service registry, inventory, host key): agent-harness2 PR #3
- [ ] Owner: confirm the invoice still shows **$13.99/month** for `110578382`
- Disk use 5.0 GB of 38 GB; RAM about 1 GB of 3.8 GB

## Gate 4: cleanup

After the owner accepts the original (staging's `cloudflared` is already stopped), delete
server `173582205` along with its primary IPs. **Keep firewall `11927072`: it now protects
the original.** Keep the SSH key, DNS, the tunnel and snapshot `449822273`.
Delete any snapshot made from staging. Confirm billing has stopped, and record
the final resources and costs here and in the PR.
