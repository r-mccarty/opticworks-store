# Contributors Guide

This document outlines infrastructure access and development workflows for contributors to the OpticWorks Presence Intelligence Platform.

## Codespaces Devcontainer

We ship a fully configured devcontainer so contributors can land in a consistent VS Code / Codespaces environment:

- `.devcontainer/devcontainer.json` pins the Node 20 image, forwards the storefront (`3000`) and Hugo docs (`1313`) ports, disables Next telemetry, and syncs common VS Code extensions/settings (ESLint, Prettier, Tailwind, Docker).
- `.devcontainer/Dockerfile` layers Hugo Extended `v0.140.0`, Corepack+pnpm `9.15.3`, `libssl3`, and the tooling the storefront expects (curl, git, OpenSSH) on top of Microsoft’s TypeScript image so OpenSSH/libcrypto always have the right runtime deps.
- `.devcontainer/post-create.sh` runs on container startup to `apt-get` Hugo + Git LFS (so hooks work out of the box), normalize + install the Hetzner SSH key, enable Corepack, install the OpenAI/Gemini/Claude CLIs, configure the Hetzner SSH alias when the `HETZNER_VM_SSH_KEY` secret is present, and finish with `pnpm install` so `pnpm run dev`, `pnpm run lint`, and `pnpm run build` are ready immediately. It also runs `git lfs install` and a smoke `ssh hetzner-node "echo 'hetzner-ssh-ready'"` to confirm connectivity; see `/tmp/hetzner-ssh.log` after container creation for the log.
- Because the post-create script injects the SSH config, you can run `ssh hetzner-node` from a Codespace or local VS Code Remote - Containers session without touching secrets by hand.

Keep these files in sync with any additional tooling expectations so the Codespaces image stays reproducible.

## GitHub Codespaces SSH Access to Hetzner Node

Contributors working in GitHub Codespaces have pre-configured SSH access to the Hetzner development VM for backend development, testing, and service deployment.

### SSH Credentials

- **Server IP**: 5.78.106.67
- **Port**: 8032
- **Username**: ryan
- **Key Type**: ED25519
- **Key Fingerprint**: SHA256:PvzDIOlxe2TSRg62dicEVNVxFzLn9tm7PPtpMvBw6Tg
- **OS**: Debian GNU/Linux (6.12.41+deb13-cloud-amd64)
- **Hostname**: debian-2gb-hil-1-test-instance

### Quick Start

The SSH key is automatically injected into your Codespace via the `HETZNER_VM_SSH_KEY` GitHub secret. An SSH alias is pre-configured in `~/.ssh/config`.

**Connect to the Hetzner node:**
```bash
ssh hetzner-node
```

This is equivalent to:
```bash
ssh -i ~/.ssh/hetzner_key -p 8032 ryan@5.78.106.67
```

### Manual Setup (if needed)

If you need to manually set up SSH access:

1. **Extract the SSH key from the environment:**
   ```bash
   env | grep HETZNER_VM_SSH_KEY
   ```

2. **Save the key with proper permissions (remove any leading whitespace before writing or it will fail with a libcrypto error):**
   ```bash
   mkdir -p ~/.ssh
   python3 - <<'PY'
import os, pathlib, textwrap
key = textwrap.dedent(os.environ["HETZNER_VM_SSH_KEY"]).strip() + "\n"
pathlib.Path.home().joinpath(".ssh", "hetzner_key").write_text(key, encoding="utf-8")
PY
   chmod 600 ~/.ssh/hetzner_key
   ```

3. **Add the SSH alias to `~/.ssh/config`:**
   ```
   Host hetzner-node
     HostName 5.78.106.67
     Port 8032
     User ryan
     IdentityFile ~/.ssh/hetzner_key
     StrictHostKeyChecking no
   ```

4. **Test the connection:**
   ```bash
   ssh hetzner-node "echo 'Connection successful!'"
   ```

### Verified Connectivity

- **Last verified manually**: 2025-11-16 19:35:27 UTC
- **Command**:
  ```bash
  ssh hetzner-node "echo 'connection-ok'"
  ```
- **Result**:
  ```
  connection-ok
  ```

Every Codespace/devcontainer build now also runs:
```bash
ssh -o BatchMode=yes hetzner-node "echo 'hetzner-ssh-ready'"
```
and records the stdout/stderr under `/tmp/hetzner-ssh.log`. Check that file if you need to confirm whether the automated post-create verification succeeded.

If you see `error in libcrypto` when the key loads, make sure the PEM file has no leading spaces (the example Python snippet above handles this automatically) and retry the verification command above.

### SSH Key Configuration Details

The SSH key stored in `HETZNER_VM_SSH_KEY` is:
- Format: OpenSSH private key (ED25519)
- Passphrase: None (used for headless authentication)
- Authorized on server: `/home/ryan/.ssh/authorized_keys`

### Common SSH Operations

**Execute a remote command:**
```bash
ssh hetzner-node "command here"
```

**Copy files to the server:**
```bash
scp -P 8032 -i ~/.ssh/hetzner_key local_file ryan@5.78.106.67:~/
```

**Copy files from the server:**
```bash
scp -P 8032 -i ~/.ssh/hetzner_key ryan@5.78.106.67:~/remote_file ./
```

**Open an interactive shell:**
```bash
ssh hetzner-node
```

### Troubleshooting

**Connection hangs or times out:**
- Check that the Hetzner firewall allows SSH on port 8032
- Verify the server is online and running
- Try connecting with verbose output: `ssh -vvv hetzner-node`

**Permission denied errors:**
- Ensure the SSH key file has correct permissions (600): `chmod 600 ~/.ssh/hetzner_key`
- Verify the key fingerprint matches the expected value above
- Check that the server has your public key in `/home/ryan/.ssh/authorized_keys`

**Key format errors:**
- Ensure the key has proper line breaks (not all on one line)
- The key should start with `-----BEGIN OPENSSH PRIVATE KEY-----` and end with `-----END OPENSSH PRIVATE KEY-----`

### Security Notes

- Never commit the SSH key or `HETZNER_VM_SSH_KEY` secret to the repository
- The SSH key is only available within GitHub Codespaces
- Disable UFW or configure appropriate firewall rules on the Hetzner VM before attempting connections
- The key is intended for development workflows only

### Development vs. Production Access

**Development Access** (SSH - current workflow):
```bash
# Direct SSH for development, testing, and deployment
ssh hetzner-node

# Deploy Medusa backend
ssh hetzner-node "cd /opt/opticworks/medusa-backend && git pull && pnpm install"

# View Medusa logs (runs via PM2, not systemd)
ssh hetzner-node "pm2 logs medusa-dev -f"

# Check server status
ssh hetzner-node "uptime && df -h"
```

**Production Access** (Cloudflare Tunnel - Phase 4):

Once Phase 4 is complete, production traffic will flow through Cloudflare Tunnel:
- **Medusa API**: `https://api.optic.works` (via tunnel, no direct IP exposure)
- **Storefront**: `https://optic.works` (Cloudflare Pages)
- **Webhook Buffer**: `https://webhook.optic.works` (Cloudflare Workers)

SSH access will remain for:
- Service management (systemd restart, log inspection)
- Database administration (backups, migrations)
- Infrastructure provisioning (PostgreSQL, Redis, Cloudflared)
- Emergency troubleshooting

**Architecture Diagram** (Ansible-managed infrastructure):
```
GitHub Codespaces
    │ SSH (port 8032)
    ↓
Hetzner Node (5.78.106.67)
    ├─ Medusa (localhost:9000, PM2-managed) ←─┐
    ├─ PostgreSQL 17 (localhost:5432)         │ (Ansible-provisioned)
    ├─ Redis 7.x (localhost:6379)             │
    └─ Cloudflared (tunnel daemon, systemd)   ┘
              │
              │ HTTPS (production)
              ↓
    Cloudflare Edge
        ├─ api.optic.works → Medusa
        ├─ optic.works → Pages (storefront - Phase 4)
        └─ webhook.optic.works → Workers (Phase 4)
```

### Deployment to Hetzner

**All infrastructure is now managed via Ansible** - See `docs/DEPLOYMENT_GUIDE.md` for complete deployment procedures.

**Quick deployment commands:**
```bash
cd infrastructure/ansible

# Full provisioning (first time or after teardown)
ansible-playbook playbooks/medusa-provision.yml

# Code updates only (2-3 min)
ansible-playbook playbooks/medusa-deploy.yml

# Complete teardown for rebuilds
ansible-playbook playbooks/medusa-destroy.yml
```

**What's deployed:**
- PostgreSQL 17 + Redis 7.x (system services)
- Node.js 22 + pnpm (runtime environment)
- Medusa v2.11.3 (PM2-managed process)
- Cloudflare Tunnel (systemd service)

**Manual SSH is primarily for:**
- Monitoring: `pm2 status`, `pm2 logs medusa-dev`
- Database admin: `psql medusa_db`
- Troubleshooting: service logs, health checks
- Emergency operations: restarts, log inspection

See `infrastructure/ansible/README.md` for detailed playbook documentation.

---

## Medusa Automation: CLI vs HTTP API

### TL;DR

**Use `medusa exec` for automation scripts, NOT HTTP Admin API calls.**

This section documents lessons learned from debugging Medusa v2 authentication (see `docs/archived/RFD-005.md` and `RFD-006.md` for the full journey).

### Why HTTP Admin API Auth Is Problematic

Early attempts to automate Medusa via HTTP Admin API (`/admin/*` endpoints) hit several blockers:

| Issue | Description |
|-------|-------------|
| **`MEDUSA_ADMIN_TOKEN` misconception** | There's no static bearer token in Medusa v2 - this concept doesn't exist |
| **JWT `actor_id` bug** | Tokens from `/auth/admin/emailpass` may have empty `actor_id`, causing 401 on all admin endpoints |
| **Secret API Key capture** | Must be captured at creation time in Admin UI - can't retrieve later |
| **Complex auth configuration** | `authMethodsPerActor`, module registration, etc. is fragile |

### Recommended Approach: Bypass HTTP Auth

Instead of fighting the HTTP authentication layer, use Medusa's CLI and `exec` command:

#### 1. One-off Commands: Use Medusa CLI

```bash
# Create admin user
pnpm exec medusa user -e admin@optic.works -p 'password'

# Run database migrations
pnpm exec medusa db:migrate

# Build for production
pnpm exec medusa build
```

These commands run inside the Medusa process context - no HTTP authentication needed.

#### 2. Automation Scripts: Use `medusa exec`

Create scripts that get direct access to Medusa's container and workflows:

```typescript
// backend/src/scripts/my-automation.ts
import { ExecArgs } from "@medusajs/framework/types"
import { createRegionsWorkflow } from "@medusajs/medusa/core-flows"

export default async function myScript({ container }: ExecArgs) {
  // Direct access to workflows - no HTTP auth!
  await createRegionsWorkflow(container).run({
    input: { regions: [{ name: "US", currency_code: "usd", countries: ["us"] }] }
  })
}
```

Run with:
```bash
pnpm exec medusa exec src/scripts/my-automation.ts
```

**Available in the container:**
- All registered modules (via `container.resolve(Modules.REGION)`, etc.)
- Query service (`ContainerRegistrationKeys.QUERY`)
- Link service (`ContainerRegistrationKeys.LINK`)
- Logger (`ContainerRegistrationKeys.LOGGER`)
- All core workflows from `@medusajs/medusa/core-flows`

#### 3. Store API (Storefront): Use Publishable Key

The Store API (`/store/*`) uses **publishable** API keys (not secret keys):

```bash
# Publishable key is created by the seed script
# Query the database to get it:
ssh hetzner-node "psql \$DATABASE_URL -c \"SELECT token FROM api_key WHERE type='publishable';\""

# Use in requests:
curl -H "x-publishable-api-key: pk_xxx" https://api.optic.works/store/products
```

The storefront uses this key in `.env.local`:
```
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxx
```

#### 4. Manual Configuration: Use Admin Dashboard

For one-off configuration that doesn't need automation:

1. Navigate to `https://api.optic.works/app`
2. Login with admin credentials (from Infisical: `MEDUSA_ADMIN_EMAIL`, `MEDUSA_ADMIN_PASSWORD`)
3. Configure regions, payment providers, shipping options, etc.

### Comparison: Old vs New Approach

| Task | ❌ Old (HTTP API) | ✅ New (CLI/exec) |
|------|------------------|-------------------|
| Create admin user | `POST /admin/users` + auth header | `medusa user -e EMAIL -p PASS` |
| Create region | `POST /admin/regions` + JWT | `medusa exec seed-region.ts` |
| Seed products | Custom script with auth helper | `medusa exec seed.ts` |
| Get publishable key | `GET /admin/api-keys` + auth | Query database directly |
| Store API calls | Works with publishable key | Same - no change |

### When HTTP Admin API Is Still Needed

The HTTP Admin API is required for:
- **External integrations** that need to call Medusa from outside (webhooks, third-party tools)
- **Real-time admin dashboards** (the built-in Admin UI uses session cookies)
- **CI/CD pipelines** that can't run `medusa exec` (consider Secret API Keys for this)

For these cases, create a Secret API Key via the Admin Dashboard UI and use:
```bash
curl -H "Authorization: Basic sk_xxx" https://api.optic.works/admin/products
```

### Key Files

- `backend/src/scripts/seed.ts` - Main seed script (products, regions, keys)
- `backend/src/scripts/seed-us-region.ts` - US region setup for Track 1
- `docs/archived/RFD-005.md` - Full authentication debugging history
- `docs/archived/RFD-006.md` - Publishable key blocker investigation
