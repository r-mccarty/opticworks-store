# OpticWorks Medusa Backend - Ansible Automation

Infrastructure-as-Code for provisioning and managing the OpticWorks Medusa backend on Hetzner.

## Overview

This Ansible setup provides:
- ✅ **Fully reproducible** infrastructure
- ✅ **Idempotent** operations (safe to re-run)
- ✅ **Version-controlled** configuration
- ✅ **Secrets management** via Ansible Vault or Infisical
- ✅ **Zero-downtime** deployments
- ✅ **Complete teardown** for testing

## Prerequisites

```bash
# Install Ansible
pip install ansible

# Install Ansible Galaxy collections
ansible-galaxy collection install community.postgresql
```

## Quick Start

### 1. Configure Secrets (Infisical - Source of Truth)

**⚠️ IMPORTANT**: All secrets MUST be stored in Infisical first. Ansible pulls from Infisical - it does NOT generate secrets.

**Step 1: Generate Secrets (One-Time Setup)**
```bash
# Generate secure secrets locally
cd services/medusa
pnpm run generate:secrets

# Output example:
# POSTGRES_PASSWORD=abc123...
# JWT_SECRET=def456...
# COOKIE_SECRET=ghi789...
```

**Step 2: Populate Infisical**
```bash
# Manually add secrets to Infisical web UI:
# - Project: OpticWorks
# - Environment: production
# - Paths:
#   - /infrastructure (POSTGRES_PASSWORD, CLOUDFLARE_TUNNEL_ID, CLOUDFLARE_TUNNEL_CREDENTIALS)
#   - /medusa (JWT_SECRET, COOKIE_SECRET, MEDUSA_ADMIN_EMAIL, MEDUSA_ADMIN_PASSWORD)
```

**Step 3: Sync from Infisical to Ansible**
```bash
# Set your Infisical service token
export INFISICAL_SERVICE_TOKEN=st.xxxxx

# Pull secrets from Infisical
cd infrastructure/ansible
bash scripts/generate-secrets-from-infisical.sh

# This creates group_vars/secrets.yml from Infisical
# The script will FAIL if required secrets are missing - this is intentional!
```

**Optional: Encrypt with Ansible Vault** (for additional security layer)
```bash
# Encrypt the synced secrets file
ansible-vault encrypt group_vars/secrets.yml
# You'll be prompted for a vault password - save this securely!
```

### 2. Verify Inventory

```bash
# Test SSH connectivity
ansible all -m ping

# Should return:
# hetzner-node | SUCCESS => {
#     "changed": false,
#     "ping": "pong"
# }
```

### 3. Provision Full Stack

```bash
# Full provisioning (first time)
ansible-playbook playbooks/medusa-provision.yml --ask-vault-pass

# Provision specific components only
ansible-playbook playbooks/medusa-provision.yml --tags postgresql,redis
ansible-playbook playbooks/medusa-provision.yml --tags medusa
```

### 4. Deploy Application Updates

```bash
# Update code and restart (no infrastructure changes)
ansible-playbook playbooks/medusa-deploy.yml --ask-vault-pass
```

## Playbooks

### `medusa-provision.yml`
**Purpose:** Full stack provisioning from scratch

**What it does:**
- Installs PostgreSQL 17, Redis, Node.js 22, pnpm
- Creates database and user
- Clones repository
- Builds Medusa admin dashboard
- Starts Medusa with PM2
- Configures Cloudflare Tunnel

**Usage:**
```bash
ansible-playbook playbooks/medusa-provision.yml --ask-vault-pass

# Dry run (check what would change)
ansible-playbook playbooks/medusa-provision.yml --check

# Verbose output
ansible-playbook playbooks/medusa-provision.yml -vv
```

### `medusa-deploy.yml`
**Purpose:** Deploy code updates without infrastructure changes

**What it does:**
- Pulls latest code from Git
- Installs dependencies
- Builds admin dashboard
- Restarts PM2 gracefully

**Usage:**
```bash
ansible-playbook playbooks/medusa-deploy.yml
```

### `medusa-destroy.yml`
**Purpose:** Complete teardown (for testing/rebuilds)

**⚠️  WARNING:** This destroys all data!

**Usage:**
```bash
ansible-playbook playbooks/medusa-destroy.yml
# Will prompt for confirmation
```

## Roles

| Role | Purpose | Tags |
|------|---------|------|
| `postgresql` | PostgreSQL 17 installation + database setup | `postgresql`, `database` |
| `redis` | Redis installation + configuration | `redis`, `cache` |
| `nodejs` | Node.js 22 + pnpm installation | `nodejs`, `runtime` |
| `medusa` | Medusa app deployment + PM2 management | `medusa`, `application` |
| `cloudflared` | Cloudflare Tunnel setup | `cloudflared`, `tunnel` |

## Configuration

### Inventory

**`inventory/production.ini`** - Hetzner production server
```ini
[medusa_backend]
hetzner-node ansible_host=hetzner-node ansible_user=ryan
```

### Variables

**`group_vars/all.yml`** - Non-sensitive configuration
- Node.js/PostgreSQL versions
- Application ports and paths
- PM2 settings

**`group_vars/secrets.yml`** - Sensitive data (encrypted)
- Database passwords
- Admin credentials
- JWT/cookie secrets
- Cloudflare tunnel credentials

**Note**: See `docs/KEY_MANAGEMENT.md` for complete variable inventory, Infisical organization, and rotation schedules for all secrets (storefront, backend, and infrastructure).

## Common Tasks

### Update Medusa Version
```bash
# SSH to server
ssh hetzner-node

# Update package.json versions
cd /opt/opticworks/medusa-backend/services/medusa
vim package.json

# Re-run provisioning (will install new versions)
ansible-playbook playbooks/medusa-provision.yml --tags medusa
```

### View Logs
```bash
# PM2 logs
ansible medusa_backend -a "pm2 logs medusa-prod --lines 50" -u ryan

# PostgreSQL logs
ansible medusa_backend -a "journalctl -u postgresql -n 50" -b

# Cloudflare Tunnel logs
ansible medusa_backend -a "journalctl -u cloudflared -n 50" -b
```

### Database Backup
```bash
ansible medusa_backend -a "pg_dump -U medusa_user medusa_db > /tmp/backup.sql" -b -u postgres
```

### Restart Services
```bash
# Restart Medusa only
ansible medusa_backend -a "pm2 restart medusa-prod" -u ryan

# Restart all services
ansible-playbook playbooks/medusa-provision.yml --tags medusa
```

## Troubleshooting

### Vault Password Issues
```bash
# If you forget vault password, recreate secrets:
rm group_vars/secrets.yml
cp group_vars/secrets.yml.example group_vars/secrets.yml
vim group_vars/secrets.yml
ansible-vault encrypt group_vars/secrets.yml
```

### SSH Connection Issues
```bash
# Test SSH manually
ssh -i ~/.ssh/hetzner_key ryan@hetzner-node

# Update inventory if hostname/IP changed
vim inventory/production.ini
```

### Idempotency Check
```bash
# Run twice - second run should show no changes
ansible-playbook playbooks/medusa-provision.yml --ask-vault-pass
ansible-playbook playbooks/medusa-provision.yml --ask-vault-pass
```

### Clean Reinstall
```bash
# Complete teardown + rebuild
ansible-playbook playbooks/medusa-destroy.yml
ansible-playbook playbooks/medusa-provision.yml --ask-vault-pass
```

## Integration with Infisical (Source of Truth)

**⚠️ KEY PRINCIPLE**: Infisical is the ONLY source of truth for secrets. Ansible NEVER generates secrets - it only consumes them.

### Secret Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Generate Secrets (One-Time)                              │
│    cd services/medusa && pnpm run generate:secrets          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Manually Add to Infisical Web UI                         │
│    - Environment: production                                │
│    - Paths: /infrastructure, /medusa                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Sync to Ansible (Before Every Deployment)                │
│    bash scripts/generate-secrets-from-infisical.sh          │
│    → Creates group_vars/secrets.yml                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Run Ansible Playbooks                                    │
│    ansible-playbook playbooks/medusa-provision.yml          │
└─────────────────────────────────────────────────────────────┘
```

### Required Secrets in Infisical

**Infrastructure Path** (`/infrastructure`, env: `production`):
- `POSTGRES_PASSWORD` - PostgreSQL database password
- `CLOUDFLARE_TUNNEL_ID` - Cloudflare Tunnel identifier
- `CLOUDFLARE_TUNNEL_CREDENTIALS` - Cloudflare Tunnel authentication JSON

**Medusa Path** (`/medusa`, env: `production`):
- `JWT_SECRET` - JWT signing key (64 hex chars)
- `COOKIE_SECRET` - Cookie signing key (64 hex chars)
- `MEDUSA_ADMIN_EMAIL` - Admin login email
- `MEDUSA_ADMIN_PASSWORD` - Admin login password
- `MEDUSA_SECRET_KEY` - Optional: Headless API access

**Complete Variable Inventory**: See `docs/KEY_MANAGEMENT.md` for detailed descriptions, rotation schedules, and usage notes.

### Sync Script Behavior

The `scripts/generate-secrets-from-infisical.sh` script:
- ✅ Pulls secrets from Infisical using `INFISICAL_SERVICE_TOKEN`
- ✅ Validates all required secrets exist
- ❌ **FAILS** if any required secret is missing (intentional - forces Infisical population)
- ❌ **NEVER** generates secrets as fallback
- ✅ Creates `group_vars/secrets.yml` for Ansible consumption

**If sync fails**: This means secrets are missing from Infisical. Follow the error message to populate Infisical, then re-run the sync script.

## Directory Structure

```
infrastructure/ansible/
├── ansible.cfg                   # Ansible configuration
├── README.md                     # This file
├── inventory/
│   └── production.ini            # Hetzner node
├── group_vars/
│   ├── all.yml                   # Non-sensitive config
│   ├── secrets.yml.example       # Secrets template
│   └── secrets.yml               # Encrypted secrets (git-ignored)
├── playbooks/
│   ├── medusa-provision.yml      # Full stack provisioning
│   ├── medusa-deploy.yml         # Code deployment only
│   └── medusa-destroy.yml        # Complete teardown
└── roles/
    ├── postgresql/
    ├── redis/
    ├── nodejs/
    ├── medusa/
    └── cloudflared/
```

## Known Issues & Workarounds

### World-Writable Directory Warning (Codespaces/Containers)

**Problem**: In GitHub Codespaces or Docker containers, the working directory may be world-writable, causing Ansible to ignore `ansible.cfg`:

```
[WARNING]: Ansible is being run in a world writable directory (/workspaces/...),
ignoring it as an ansible.cfg source.
```

**Solution**: Explicitly set `ANSIBLE_CONFIG` environment variable:
```bash
# Instead of:
ansible-playbook playbooks/medusa-deploy.yml

# Use:
ANSIBLE_CONFIG=./ansible.cfg ansible-playbook -i inventory/production.ini playbooks/medusa-deploy.yml
```

### Build Task Hangs or Times Out

**Problem**: The `pnpm run build` task in `medusa-deploy.yml` can take 5-10 minutes and may appear stuck in Ansible output (no progress shown).

**Symptoms**:
- Ansible shows no output for several minutes during "Rebuild Medusa admin dashboard" task
- SSH connection may timeout

**Workaround 1**: Manual deployment when Ansible hangs
```bash
# SSH directly to server
ssh hetzner-node

# Navigate to app directory
cd /opt/opticworks/medusa-backend

# Run build manually (shows progress)
pnpm run build

# Restart service
pm2 restart medusa-dev && pm2 save
```

**Workaround 2**: Deploy code first, then build separately
```bash
# Just sync files (quick)
ansible-playbook playbooks/medusa-deploy.yml --tags sync

# Then SSH and build manually with progress
ssh hetzner-node "cd /opt/opticworks/medusa-backend && pnpm run build && pm2 restart medusa-dev"
```

### No Git Repository on Server

**Problem**: The `/opt/opticworks/medusa-backend` directory on the server is NOT a git repository. Running `git` commands there fails:
```
fatal: not a git repository (or any of the parent directories): .git
```

**Why**: The `medusa-deploy.yml` playbook:
1. Clones the repo to `/tmp/medusa-deploy`
2. Rsyncs the `backend/` directory to the app root
3. Deletes the temp clone

This means the deployed directory has no `.git` folder.

**Implications**:
- Cannot run `git pull` on the server
- Cannot check `git log` or `git status` on the server
- Must use Ansible or manual rsync for all deployments

**Workaround for Quick Fixes**: If you need to make a quick change on the server:
```bash
# Edit directly (discouraged - causes drift)
ssh hetzner-node
vim /opt/opticworks/medusa-backend/src/scripts/some-file.ts

# Then document and replicate in the repo!
```

**Proper Fix**: Always deploy through Ansible or manual rsync:
```bash
# Manual rsync from local (when Ansible is problematic)
rsync -avz --exclude node_modules --exclude .medusa --exclude .env \
  backend/ hetzner-node:/opt/opticworks/medusa-backend/
```

### Rsync Delete Errors

**Problem**: The rsync task may show warnings about non-empty directories it cannot delete:
```
cannot delete non-empty directory: archive/aws-cli/dist/...
```

**Solution**: This is usually harmless - old files that don't affect the build. To force clean sync:
```bash
ssh hetzner-node "rm -rf /opt/opticworks/medusa-backend/archive"
ansible-playbook playbooks/medusa-deploy.yml
```

## CI/CD Integration

Add to `.github/workflows/deploy.yml`:
```yaml
- name: Deploy to Hetzner
  run: |
    ansible-playbook infrastructure/ansible/playbooks/medusa-deploy.yml \
      --vault-password-file <(echo "${{ secrets.ANSIBLE_VAULT_PASSWORD }}")
```

## Related Documentation

- [DEPLOYMENT_GUIDE.md](../../docs/DEPLOYMENT_GUIDE.md) - Production architecture and deployment workflow
- [CONTRIBUTORS.md](../../docs/CONTRIBUTORS.md) - SSH access and dev workflow
- [RFD-006.md](../../docs/RFD-006.md) - Deployment issues that led to this automation
- [archived/IMPLEMENTATION_GUIDE.md](../../docs/archived/IMPLEMENTATION_GUIDE.md) - Deprecated manual setup instructions
