# Secrets Management

Never commit secrets, `.env*` files or `backend/.env`. Inject values at run time instead.

## Website

The website (`src/`, Worker `opticworks-store`) needs **no secrets or environment variables**
while the store is off or in mock mode. `wrangler.jsonc` holds only the Worker's name, routes
and asset binding.

Only `STORE_MODE=medusa` (server-side calls to the new backend) needs these, as Worker
variables/secrets set in the dashboard, never in `wrangler.jsonc`:

| Variable | Kind | Value |
|----------|------|-------|
| `STORE_MODE` | variable | `off` / `mock` / `medusa` (see [STORE_FRONTEND.md](reference/STORE_FRONTEND.md)) |
| `MEDUSA_BACKEND_URL` | variable | `https://backend.optic.works` |
| `MEDUSA_PUBLISHABLE_KEY` | variable | Admin → Settings → Publishable API Keys → "optic.works storefront" (public, per database) |
| `CLOUDFLARE_BACKEND_ACCESS_ID` / `_TOKEN` | secret | Access service token while the backend is dark (`/agents/opticworks-backend/credentials`) |

The retired storefront's Worker secrets were removed on 2026-10-30. See
[CLOUDFLARE_API.md](reference/CLOUDFLARE_API.md).

## Backend (Medusa 2.21, via Ansible)

The backend's values live in Infisical project `ubuntu-pair-node`, environment `dev`, under
`/agents/<service>/{config,credentials}`. The old `OpticWorks` Infisical project belonged to the
retired storefront and backend; nothing current reads it.

| Variable | Folder | Purpose |
|----------|--------|---------|
| `JWT_SECRET`, `COOKIE_SECRET` | `/agents/opticworks-backend/credentials` | Auth token signing, session cookies |
| `REDIS_APP_PASSWORD`, `REDIS_BACKUP_PASSWORD` | same | Local Redis ACL users `medusa` and `backup` |
| `RESTIC_PASSWORD` | same | Backup encryption. **Never regenerate:** existing backups become unreadable |
| `STRIPE_WEBHOOK_SECRET` | same | Placeholder until a Stripe webhook exists (#138) |
| `MEDUSA_ADMIN_EMAIL` / `MEDUSA_ADMIN_PASSWORD` | `/agents/opticworks-backend/{config,credentials}` | Admin login (`support@optic.works`) |
| `CLOUDFLARE_BACKEND_ACCESS_ID` / `_TOKEN` | same | Cloudflare Access service token for `backend.optic.works` |
| `SSH_HOST`, `SSH_KNOWN_HOSTS`, `SSH_PRIVATE_KEY`, `HETZNER_API_KEY` | `/agents/hetzner` | Host address, pinned host key, deploy key, Hetzner API |
| Provider keys | `/agents/{neon,stripe,easypost,resend,cloudflare,tigris}` | Neon, Stripe (test), EasyPost (test), Resend, Cloudflare/R2, Tigris |

Database URLs (Neon) and the tunnel token aren't stored. `run.py` fetches them from the provider
APIs on each run.

`infrastructure/ansible/scripts/run.py` injects these into the Ansible process. Nothing is
written to `group_vars` or to disk on the controller, apart from an ephemeral SSH key in a 0700
temp dir:

```bash
export INFISICAL_PROFILE=<your profile> OPTICWORKS_CONFIRM_SERVER_ID=110578382
python3 -I infrastructure/ansible/scripts/run.py --target original deploy
```

The backend's own values were created once with `scripts/generate_secrets.py` (it refuses to
overwrite). Rotate individual values deliberately in Infisical, then redeploy. Full runbook:
[`infrastructure/ansible/README.md`](../infrastructure/ansible/README.md).

## Adding a secret

1. Add it in Infisical under the right `/agents/<service>` folder (`config` for non-secret
   settings, `credentials` for secrets).
2. Read it in `run.py` or the relevant role. Never write it into the repo, `group_vars`, issues
   or logs.
