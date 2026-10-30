# Legacy backend snapshot preparation

The legacy backend was preserved and stopped on 2026-10-29 ahead of a separate Hetzner VM snapshot and a future backend teardown. The old frontend remains deployed and visible. This document records the completed preparation, the remaining snapshot step, and how to recover deliberately.

## Completed state

| Component | State |
| --- | --- |
| `optic.works`, `www.optic.works` | Existing storefront deployment retained; root, store and cart pages returned HTTP 200 after the API disconnection. |
| API boundary | Temporary Worker `opticworks-backend-offline-20261029` returns JSON `503 BACKEND_OFFLINE`, with no origin fetch. Allowed frontend CORS preflights return 204. |
| Routes | `api.optic.works/*`, `medusa.optic.works/*`, `optic.works/api/*`, `www.optic.works/api/*` point to the offline Worker. DNS/tunnel records were retained. |
| Original storefront version | `690cf649-520c-49df-8a17-bd2b623bf381`; deployment unchanged. No storefront rebuild or replacement homepage was deployed. |
| Hookdeck | Existing Stripe and EasyPost connections paused; not deleted or replayed. |
| Medusa | PM2 `medusa-prod` stopped; stopped process list saved. |
| Cloudflare tunnel | `cloudflared.service` stopped and disabled. |
| PostgreSQL | `postgresql@17-main.service` stopped cleanly after logical dumps. |
| Redis | SAVE completed; `redis-server.service` stopped cleanly; RDB copied to recovery capture. |
| Old backup cron | Disabled for user `ryan`; its stale embedded password was causing failed dumps. It was not used for this capture. |
| SSH | Retained at the existing verified host/port. |
| Teardown | **Not performed.** Application files, databases, PostgreSQL cluster, Redis persistence, tunnel configuration and provider resources remain. |
| Provider VM snapshot | **Still to be taken and verified by the operator.** The offsite Restic recovery snapshot below is a separate artifact. |

The existing browser JavaScript can still attempt legacy requests; the edge gate rejects those requests and prevents them from reaching the old backend. Account, cart mutation, checkout, support/API and payment operations are unavailable. Preserving the pages does not mean preserving interactive functionality.

## Recovery artifacts

Server: `debian-2gb-hil-1-test-instance`, existing SSH account `ryan` with sudo.

Recovery directory:

```text
/var/backups/opticworks/pre-redeployment-20261029T213953Z
```

The directory is root-only (0700), with recovery files at 0600:

- `postgres.dump`, `medusa.dump`, `medusa_db.dump`: custom-format logical dumps of all three non-template databases. Each archive was listed and fully decoded to `/dev/null` with `pg_restore`; no restore SQL was applied. The application dump is 1,057,402 bytes and has 939 archive table-of-contents entries.
- `postgres-globals.sql`: global role definitions, including sensitive role/password information. Never copy it into Git, tickets or logs.
- `application-and-config.tar.gz`: backend source and environment, existing backup configuration, tunnel and database configuration, and persisted stopped PM2 state. `node_modules`, `.medusa` build output, application logs and cache are excluded. A full VM snapshot separately preserves the complete disk.
- `redis-dump.rdb`: Redis persistence after SAVE/clean stop.
- `pm2-before.json`: original PM2 dump before the stop, retained for deliberate recovery. Treat it as secret-bearing configuration.
- `before.json`, `database-manifest.json`, `MANIFEST.json`: original service state, dump validation metadata, file sizes and SHA-256 checksums.
- `SNAPSHOT_READY.json`: preparation result and offsite snapshot identifier.

An encrypted offsite Restic backup was created in the existing R2 backup repository:

```text
f648623b648631b3befa913632438daaad1ff333c3bdd169fda175afb7a43cc4
```

Tags include `pre-redeployment` and `pre-redeployment-20261029T213953Z`. Snapshot metadata was successfully read back. This is stronger than the previous stale backup record, but it is **not a full database/application restore rehearsal**. The server's final `SNAPSHOT_READY.json` was written after the offsite backup; the capture's `MANIFEST.json` and database/configuration artifacts are in that offsite snapshot.

The Restic password and R2 credentials remain in the existing protected configuration/Infisical. Retain access to that encryption password through teardown. No credential was printed or committed as part of this preparation. Prior public credential exposures identified in the audit were not rotated by this operation; recovery artifacts contain the legacy configuration and must remain private.

The missing-from-main device migration was preserved as [historical source text](legacy-api/Migration20251220185122.ts.txt). Do not feed it automatically into a completely new schema.

## Take the provider snapshot next

1. In the Hetzner account, select the existing server by its hostname and verified address. Keep the current application services stopped while creating the VM snapshot. If the provider workflow calls for powering the VM off first, do that through the provider console; SSH availability will end until it is powered back on.
2. Record the provider snapshot ID, server ID and creation time. Wait until the provider reports successful completion. Do not infer a completed VM snapshot from the Restic identifier above.
3. Retain the R2/Restic backup, this repository branch and application Infisical project independently of the VM.
4. Only after the provider snapshot is confirmed should the later teardown proceed. The current task has not run `medusa-destroy.yml`, deleted provider resources, initialized Neon or dropped any database.

The bootstrap harness has guest SSH access but no configured Hetzner Cloud API token, so it cannot independently verify the operator-created provider snapshot yet.

## Applied automation

- [Snapshot playbook](https://github.com/r-mccarty/opticworks-store/blob/b747f160c973/infrastructure/ansible/playbooks/medusa-prepare-snapshot.yml): all backend changes were made with Ansible, in accordance with AGENTS.md.
- [Snapshot helper](https://github.com/r-mccarty/opticworks-store/blob/b747f160c973/infrastructure/ansible/scripts/prepare-snapshot.py): opens dump files as root, uses local PostgreSQL administrator access, verifies archive decoding, captures private configuration, and runs an encrypted offsite backup. It does not execute the old failing backup shell script.
- [API-offline Worker](../../infrastructure/workers/backend-offline/worker.mjs) and [routing configuration](../../infrastructure/workers/backend-offline/wrangler.jsonc).
- [Nonsecret state receipt](legacy-api/snapshot-preparation-state.json): service states, route IDs, paused connection IDs, archive validation results and recovery identifiers.

The playbook requires a unique UTC `capture_id` matching `YYYYMMDDTHHMMSSZ`; it refuses to reuse an initialized recovery directory. It was run once with `20261029T213953Z`. It is not a general idempotent resume/deploy playbook. The controller used service-scoped Infisical injection and a temporary SSH key in `/dev/shm`, with strict host checking; that key was removed after the run.

## Deliberate recovery or rollback

Backend changes must continue to go through Ansible. These steps describe the sequence; they are not instructions to resume the old system automatically.

1. Keep the API-offline routes and Hookdeck pauses in place while inspecting/restoring. Verify the recovery manifest/checksums; restore private artifacts only to a protected destination. A restored VM must be isolated from public traffic and outbound delivery until legacy exposed credentials are addressed.
2. If recovering the existing VM rather than restoring data, do not import dumps unnecessarily: the original PostgreSQL/Redis data are still present. Start PostgreSQL and Redis, then resume Medusa through a reviewed Ansible change. The prior PM2 dump is a recovery reference; avoid displaying its contents.
3. Verify local health and application behavior, database target and migration state before enabling the tunnel. The original production Infisical `DATABASE_URL` is stale; the old deployment template constructs its working `medusa_db` URL from `POSTGRES_PASSWORD`. Do not substitute the saved URL blindly.
4. Enable/start `cloudflared.service` only after an explicit decision to expose that backend. Restore the legacy backup cron only after replacing its stale password handling and verifying a new backup.
5. Remove only the four offline route IDs recorded in the state receipt to reconnect the old hostnames and storefront APIs. The original DNS and storefront Worker were left intact. Keep the offline Worker until its routes are removed and rollback is complete.
6. Review queued webhook events and the intended target before unpausing the two recorded Hookdeck connections. A fresh backend should not receive historical events automatically. Queue retention is subject to the provider's plan; pausing is not an indefinite event archive.

For a new deployment using Neon, keep the old recovery data separate. Decide which historical entities, if any, should migrate. A new database does not recreate old customer identities, Stripe/Medusa links, device pairing state or fulfillment idempotency automatically. Use [the API catalog](LEGACY_BACKEND_API.md) as a reference for translation, rather than a requirement to reproduce stale product/business logic.
