# Deployment Guide

Ansible-based deployment for the Medusa backend on Hetzner Cloud.

---

## Quick Reference

```bash
# Full provisioning (first time or recovery)
cd infrastructure/ansible
ansible-playbook -i inventory/production.ini playbooks/medusa-provision.yml

# Code updates only
ansible-playbook -i inventory/production.ini playbooks/medusa-deploy.yml

# Setup/update backup system
ansible-playbook -i inventory/production.ini playbooks/backup-setup.yml

# Teardown for clean rebuild
ansible-playbook -i inventory/production.ini playbooks/medusa-destroy.yml
```

> **Note**: The `-i inventory/production.ini` flag is required because Codespaces
> uses world-writable directories, causing Ansible to ignore the local `ansible.cfg`
> for security reasons.

---

## Prerequisites

1. **SSH Access**: `ssh hetzner-node` (pre-configured in Codespaces)
2. **Infisical Token**: `export INFISICAL_SERVICE_TOKEN=st.xxx`
3. **Secrets Sync**: `bash scripts/generate-secrets-from-infisical.sh`

---

## Deployment Modes

### Full Provisioning

```bash
ansible-playbook -i inventory/production.ini playbooks/medusa-provision.yml
```

**When**: First-time deployment, after infrastructure changes, recovery from drift

**Time**: 8-12 minutes

**What it does**:
- Installs PostgreSQL, Redis, Node.js
- Clones repository and builds Medusa
- Configures PM2 and Cloudflare Tunnel
- Creates admin user

### Code Deployment

```bash
ansible-playbook -i inventory/production.ini playbooks/medusa-deploy.yml
```

**When**: Application code updates, Medusa version upgrades

**Time**: 2-3 minutes

**What it does**:
- Pulls latest code from Git
- Installs dependencies
- Rebuilds admin dashboard
- Kills any orphaned node processes (prevents zombie accumulation)
- Restarts PM2 with fresh process

### Teardown

```bash
ansible-playbook -i inventory/production.ini playbooks/medusa-destroy.yml
```

**When**: Configuration drift, clean rebuilds

**What it removes**: PM2 processes, database, Redis data, application files

**What it preserves**: SSH keys, system packages, user accounts

---

## Process Management

PM2 manages the Medusa backend process. The ecosystem config (`backend/ecosystem.config.js`) is designed to prevent orphaned processes:

### Key Configuration

| Setting | Value | Purpose |
|---------|-------|---------|
| `script` | `node` | Runs node directly (not pnpm) for proper process tree management |
| `treekill` | `true` | Ensures entire process tree is killed on stop/restart |
| `kill_timeout` | `15000` | Allows 15s for graceful shutdown |

### Why This Matters

When PM2 manages a wrapper (like pnpm) instead of the actual node process, child processes can become orphaned during restarts. Over time, these zombie processes consume CPU and memory.

**Symptoms of orphaned processes:**
- High CPU/memory usage when idle
- Multiple `medusajs/cli` processes in `ps aux`
- Load average higher than expected

**The deployment playbook automatically cleans up orphans** by running `pkill -f "medusajs/cli"` before starting fresh processes.

### Manual Cleanup

If orphaned processes accumulate between deployments:

```bash
# Check for orphans
ssh hetzner-node "ps aux | grep medusajs/cli | grep -v grep"

# Kill them (graceful, then force)
ssh hetzner-node "pkill -f 'medusajs/cli'; sleep 2; pkill -9 -f 'medusajs/cli'"

# Restart PM2 process
ssh hetzner-node "cd /opt/opticworks/medusa-backend && PM2_TARGET=production pm2 start ecosystem.config.js --env production"
```

---

## Secrets Management

Secrets are pulled from Infisical before every deployment:

```bash
cd infrastructure/ansible
export INFISICAL_SERVICE_TOKEN=st.xxx
bash scripts/generate-secrets-from-infisical.sh
# Creates group_vars/secrets.yml
```

**Never** edit `secrets.yml` directly.

---

## Cloudflare R2 Storage

Medusa uses R2 for product images. Configuration in `backend/medusa-config.ts`:

```typescript
{
  resolve: "@medusajs/medusa/file-s3",
  options: {
    file_url: process.env.R2_PUBLIC_URL,
    access_key_id: process.env.R2_ACCESS_KEY_ID,
    secret_access_key: process.env.R2_SECRET_ACCESS_KEY,
    region: "auto",
    bucket: process.env.R2_BUCKET_NAME,
    endpoint: process.env.R2_ENDPOINT_URL,
  },
}
```

---

## Troubleshooting

### Ansible ping fails

```bash
ssh hetzner-node              # Verify SSH access
ansible all -m ping -vvv      # Verbose output
```

### 502 Bad Gateway

```bash
ssh hetzner-node
systemctl status cloudflared  # Check tunnel
pm2 status                    # Check Medusa
curl http://localhost:9000/health
```

### Viewing Medusa Application Logs

**Important**: PM2 logs (`pm2 logs`) only show pnpm wrapper output, NOT Medusa's
internal application logs. This is because PM2 → pnpm → medusa doesn't pipe
stdout properly.

**Solution**: Medusa is configured to write logs to a file via `LOG_FILE` env var.

```bash
# View Medusa application logs (what you usually want)
ssh hetzner-node "tail -100 /opt/opticworks/medusa-backend/logs/medusa-app.log"

# Follow logs in real-time
ssh hetzner-node "tail -f /opt/opticworks/medusa-backend/logs/medusa-app.log"

# View PM2 wrapper logs (pnpm start/restart info only)
ssh hetzner-node "pm2 logs medusa-prod --lines 50"
```

**Log locations on server**:
| Log File | Contents |
|----------|----------|
| `logs/medusa-app.log` | Medusa application logs (EasyPost, Resend, workflows, etc.) |
| `logs/pm2-prod-out.log` | PM2/pnpm wrapper stdout |
| `logs/pm2-prod-error.log` | PM2/pnpm wrapper stderr |

**Reference**: [Medusa Logging Documentation](https://docs.medusajs.com/learn/debugging-and-testing/logging)

### Backend TypeScript build fails in Codespaces

**Symptom**: Running `pnpm run build` in the `backend/` directory fails with errors like:

```
Cannot find module '@medusajs/framework/utils' or its corresponding type declarations.
```

**Root cause**: The Medusa CLI build command requires specific module resolution settings that aren't fully compatible with Codespaces' ephemeral environment. The build works on the production server but fails locally.

**Why this happens**:
1. Medusa v2 uses complex package exports with subpath imports (`@medusajs/framework/utils`)
2. TypeScript's module resolution in Codespaces doesn't fully resolve these paths
3. The production server builds fresh from git clone, avoiding cached/stale node_modules

**Workarounds**:

1. **Trust the production build**: The Ansible deploy runs the build on the server where it works
2. **For local validation**, manually check TypeScript syntax (not full build):
   ```bash
   # Check for syntax errors only
   cd backend
   npx tsc --noEmit --skipLibCheck 2>&1 | grep -v "Cannot find module"
   ```
3. **For full local builds**, try a clean install:
   ```bash
   cd backend
   rm -rf node_modules .medusa
   pnpm install
   pnpm run build
   ```

**Permanent fix needed**: Track 1 in `PLATFORM_ENGINEERING_PLAN.md` proposes GitHub Actions CI that runs builds in a clean environment, catching issues before deployment.

---

### Database connection timeout

**Root cause**: PostgreSQL password contained URL-unsafe characters (`/`, `+`, `=`).

**Prevention**: The `generate-secrets-from-infisical.sh` script now validates that `POSTGRES_PASSWORD` contains only hex characters (no special characters that require URL encoding).

**If this error occurs**:
```bash
# Generate a new hex-only password
openssl rand -hex 32

# Update in Infisical
infisical secrets set POSTGRES_PASSWORD="<new-hex-password>" --env=prod \
  --projectId=42e9e77c-88fa-4cbb-925b-5064c8e3b18c --token="$INFISICAL_SERVICE_TOKEN"

# Regenerate secrets and redeploy
cd infrastructure/ansible
bash scripts/generate-secrets-from-infisical.sh
ansible-playbook -i inventory/production.ini playbooks/medusa-deploy.yml
```

**Note**: After changing the password, you must also update it in PostgreSQL:
```bash
ssh hetzner-node "sudo -u postgres psql -c \"ALTER USER medusa PASSWORD '<new-hex-password>';\""
```

---

## Backup & Recovery

Automated backups run daily at 3 AM using Restic to Cloudflare R2.

### Setup

```bash
ansible-playbook -i inventory/production.ini playbooks/backup-setup.yml
```

### Manual Backup

```bash
ssh hetzner-node "/opt/opticworks/backup/backup.sh"
```

### List Snapshots

```bash
ssh hetzner-node "/opt/opticworks/backup/restore.sh --list"
```

### Restore Database Only

```bash
ssh hetzner-node "/opt/opticworks/backup/restore.sh latest --db-only"
```

### Full Restore

```bash
ssh hetzner-node "/opt/opticworks/backup/restore.sh <snapshot-id> --full"
```

### What's Backed Up

- PostgreSQL database dump
- `/opt/opticworks/medusa-backend/` (excluding node_modules, cache, logs)

### Retention Policy

- 7 daily snapshots
- 4 weekly snapshots
- 6 monthly snapshots

### Backup Logs

```bash
ssh hetzner-node "tail -100 /var/log/opticworks-backup.log"
```

---

## Health Checks

```bash
# Backend health
curl https://api.optic.works/health

# PostgreSQL
ssh hetzner-node "psql medusa_db -c 'SELECT version();'"

# Redis
ssh hetzner-node "redis-cli ping"

# PM2
ssh hetzner-node "pm2 status"

# Logs
ssh hetzner-node "pm2 logs medusa-dev --lines 50"
```

---

## Important URLs

- **Backend API**: https://api.optic.works
- **Admin Dashboard**: https://api.optic.works/app
- **Health Check**: https://api.optic.works/health
