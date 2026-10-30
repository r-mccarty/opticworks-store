# Reference Documentation

Start with [`CLAUDE.md`](../../CLAUDE.md) for daily development.

| Document | Purpose |
|----------|---------|
| [BACKEND_OFFLINE_FRONTEND.md](BACKEND_OFFLINE_FRONTEND.md) | Current website state: routes, edge routing, what was removed, open issues |
| [CLOUDFLARE_API.md](CLOUDFLARE_API.md) | Cloudflare API access: R2, tunnels, DNS, WAF |
| [LEGACY_BACKEND_API.md](LEGACY_BACKEND_API.md) | Frozen API inventory of the retired Medusa backend and its old frontend integration |
| [LEGACY_BACKEND_SNAPSHOT.md](LEGACY_BACKEND_SNAPSHOT.md) | Recovery artifacts for the retired backend (Hetzner snapshot `449822273`) |
| [`legacy-api/`](legacy-api/) | Machine-readable route catalogs and the offline-route state for the above |
| [`../SECRETS.md`](../SECRETS.md) | Where secrets live (the website needs none) |

The new Medusa 2.21 backend (dark at `backend.optic.works`) is documented with its automation:
[`infrastructure/ansible/README.md`](../../infrastructure/ansible/README.md) and
[`MIGRATION.md`](../../infrastructure/ansible/MIGRATION.md).

Documentation for the retired storefront (checkout, payments, tax, fulfillment, webhooks, E2E,
devices, operations of the old host) was removed on 2026-10-30. It remains in git history.
