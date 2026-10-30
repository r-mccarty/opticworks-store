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
- **Not yet inventoried:** what runs and is stored on the original's disk, the
  state of the staging host, and Restic and Hookdeck. A host inspection over SSH
  needs operator approval: it is a read of the production host. The API can't
  show the billed rate. Confirm $13.99 on the Hetzner invoice or in the console.

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
- [ ] Admin login through Access (owner account)
- [ ] Email/test integrations (password-reset email, Stripe/EasyPost test calls)
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

Prepare and review, without touching the original:

- [ ] Inventory the original's disk, services and duties. Decide what to keep, and
      copy it to a restorable, independent place (snapshot `449822273` plus a file-level copy)
- [ ] Verify that a rebuild with `debian-13` keeps server ID, IPs and type. Settle
      how first-boot access works (does the rebuild accept the cloud-init `user_data` used
      for the pre-trusted host key, or does a root password plus console step apply?).
      Keep strict host-key checking either way
- [ ] Expected downtime, rollback (re-rebuild from snapshot `449822273`, same ID), and
      tunnel handover: stop `cloudflared` on staging first. `run.py` refuses while the
      tunnel is connected from another host
- [ ] Owner approves: protection change, wipe/rebuild, traffic switch, and the
      Neon branch (`main`) the original will use

## Gate 3: cutover (owner-scheduled)

Disable rebuild protection, rebuild `110578382` in place with `debian-13` (**no
resize**), and re-enable protection right away. Then run
`OPTICWORKS_CONFIRM_SERVER_ID=110578382 run.py --target original deploy`
followed by `rotate-hostkey`, and restore Redis and config from Restic.
Validate health, auth, admin, store, persistence, Access/TLS, backup timers and
a restore. Update only scoped SSH/agent-harness references. Run
`hcloud_audit.py` and confirm the invoice still shows $13.99.

## Gate 4: cleanup

After the owner accepts the original, stop `cloudflared` on staging. Delete
server `173582205` along with its primary IPs, and firewall `11927072` if no
other server uses it. Keep the SSH key, DNS, the tunnel and snapshot `449822273`.
Delete any snapshot made from staging. Confirm billing has stopped, and record
the final resources and costs here and in the PR.
