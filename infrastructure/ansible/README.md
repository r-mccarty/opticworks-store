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

### 1. Configure Secrets

Choose ONE of the following methods:

**Method A: Ansible Vault (Recommended for production)**
```bash
# Copy secrets template
cp group_vars/secrets.yml.example group_vars/secrets.yml

# Edit secrets
vim group_vars/secrets.yml

# Encrypt with Ansible Vault
ansible-vault encrypt group_vars/secrets.yml
# You'll be prompted for a vault password - save this securely!
```

**Method B: Infisical (Recommended for teams)**
```bash
# Pull secrets from Infisical (run from repo root)
cd ../..
bash scripts/pull-infisical-secrets.sh

# Then return to ansible directory
cd infrastructure/ansible

# This creates group_vars/secrets.yml from Infisical
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

## Integration with Infisical

**Variable Inventory**: See `docs/KEY_MANAGEMENT.md` for the complete list of infrastructure secrets that should be stored in Infisical (environment: `production`, path: `/infrastructure`).

**Key variables**:
- `POSTGRES_PASSWORD` - Database credentials
- `CLOUDFLARE_TUNNEL_ID` - Tunnel identifier
- `CLOUDFLARE_TUNNEL_CREDENTIALS` - Tunnel authentication JSON
- `HETZNER_API_TOKEN` - Server management API

The repository includes a script at `scripts/pull-infisical-secrets.sh` that automatically syncs secrets from Infisical.

To use it for Ansible deployment:
```bash
# From repository root
export INFISICAL_SERVICE_TOKEN=st.xxxxx
bash scripts/pull-infisical-secrets.sh

# Optionally encrypt with Ansible Vault for additional security
cd infrastructure/ansible
ansible-vault encrypt group_vars/secrets.yml
```

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
