# OpticWorks Platform Deployment Guide

**Version**: 1.0
**Last Updated**: 2025-11-18
**Deployment Method**: Ansible Infrastructure-as-Code
**Architecture**: Next.js Storefront + Medusa Backend + Cloudflare Services

---

## Overview

This guide documents the OpticWorks production architecture and deployment workflow. The platform consists of:

- **Storefront**: Next.js 15.5 application (Cloudflare Pages - Phase 4)
- **Backend**: Medusa v2 e-commerce engine (Hetzner Cloud via Ansible)
- **Infrastructure**: Fully automated via Ansible playbooks
- **Security**: Cloudflare Tunnel + Access Zero Trust

**Key Principle**: Infrastructure-as-Code ensures reproducibility and prevents configuration drift.

---

## Architecture

### Production Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE SERVICES                       │
├─────────────────────────────────────────────────────────────┤
│  Pages (optic.works)          Tunnel (api.optic.works)      │
│  ↓ Next.js Storefront         ↓ Medusa Backend Proxy        │
└────────┬──────────────────────────────┬─────────────────────┘
         │                              │
         │                              ↓
         │                    ┌──────────────────────┐
         │                    │  HETZNER CLOUD       │
         │                    │  (3 vCPU, 4GB RAM)   │
         │                    ├──────────────────────┤
         │                    │  • PostgreSQL 17     │
         │                    │  • Redis 7.x         │
         │                    │  • Node.js 22        │
         │                    │  • Medusa v2.11.3    │
         │                    │  • PM2 Manager       │
         │                    │  • Cloudflared       │
         │                    └──────────────────────┘
         │
         └──────────────────────────────┘
                  API Calls
```

### Infrastructure Management

**Ansible Roles** (`infrastructure/ansible/roles/`):
- `postgresql` - PostgreSQL 17 + database creation
- `redis` - Redis server configuration
- `nodejs` - Node.js 22 + pnpm installation
- `medusa` - Application deployment + PM2 management
- `cloudflared` - Cloudflare Tunnel configuration

**Playbooks** (`infrastructure/ansible/playbooks/`):
- `medusa-provision.yml` - Full stack deployment (8-12 min)
- `medusa-deploy.yml` - Code updates only (2-3 min)
- `medusa-destroy.yml` - Complete teardown for rebuilds

---

## Deployment Workflow

### Prerequisites

1. **SSH Access**: Configure Hetzner node access (see `docs/CONTRIBUTORS.md`)
2. **Ansible**: Install locally (`pip install ansible` or `apt install ansible`)
3. **Infisical**: Ensure all secrets are stored in Infisical **before** deployment
   - Project: `OpticWorks`
   - Environment: `production`
   - Paths: `/infrastructure`, `/medusa`
   - See `docs/KEY_MANAGEMENT.md` for complete variable list
4. **Infisical Service Token**: Set `INFISICAL_SERVICE_TOKEN` environment variable

### Quick Start

```bash
# 0. Sync secrets from Infisical (REQUIRED before every deployment)
export INFISICAL_SERVICE_TOKEN=st.xxxxx
cd infrastructure/ansible
bash scripts/generate-secrets-from-infisical.sh
# → Creates group_vars/secrets.yml from Infisical
# → Script FAILS if required secrets are missing

# 1. Verify connectivity
ansible all -m ping
# Expected: hetzner-node | SUCCESS => {"ping": "pong"}

# 2. Full provisioning (first time or after teardown)
ansible-playbook playbooks/medusa-provision.yml

# 3. Verify deployment
curl https://api.optic.works/health
# Expected: {"status": "ok"}

# 4. Access admin dashboard
open https://api.optic.works/app
```

**Time Estimates**:
- Initial provision: 8-12 minutes
- Code deployment: 2-3 minutes
- Complete teardown: 1-2 minutes

### Deployment Modes

#### Full Provisioning (Clean Install)
```bash
ansible-playbook playbooks/medusa-provision.yml
```

**When to use**:
- First-time deployment
- After infrastructure changes
- Recovery from configuration drift
- Testing infrastructure changes

**What it does**:
- Installs system packages (PostgreSQL, Redis, Node.js)
- Creates database and user
- Clones/updates repository
- Builds Medusa admin dashboard
- Configures PM2 process manager
- Sets up Cloudflare Tunnel
- Starts all services

#### Code Deployment (Updates Only)
```bash
ansible-playbook playbooks/medusa-deploy.yml
```

**When to use**:
- Application code updates
- Medusa version upgrades
- Script changes

**What it does**:
- Pulls latest code from Git
- Installs/updates dependencies
- Rebuilds admin dashboard
- Restarts PM2 gracefully
- Verifies health

#### Teardown (Clean Rebuild)
```bash
ansible-playbook playbooks/medusa-destroy.yml
```

**When to use**:
- Resolving configuration drift
- Testing clean deployments
- Major infrastructure changes

**What it removes**:
- PM2 processes
- PostgreSQL database/user
- Redis data
- Application files
- Cloudflare Tunnel service

**What it preserves**:
- SSH keys and configuration
- System packages
- User accounts
- Network configuration

---

## Configuration Management

### Secrets (Ansible)

**File**: `infrastructure/ansible/group_vars/secrets.yml`

**Contents**:
```yaml
# PostgreSQL
postgres_db_password: "..."

# Medusa Admin
medusa_admin_email: "admin@optic.works"
medusa_admin_password: "..."

# Application Secrets
jwt_secret: "..."
cookie_secret: "..."

# Cloudflare Tunnel
cloudflare_tunnel_id: "..."
cloudflare_tunnel_credentials: |
  {...}
```

**Security**:
- Never commit secrets.yml to Git (`.gitignore` configured)
- Use Ansible Vault for encryption: `ansible-vault encrypt secrets.yml`
- Sync to Infisical for team access (see `docs/KEY_MANAGEMENT.md`)

### Environment Variables (Storefront)

**File**: `.env.local` (local development)

**Managed via**: Infisical (production/team)

**Complete Variable Inventory**: See `docs/KEY_MANAGEMENT.md` for all ~50 variables, Infisical paths, and rotation schedules.

**Key variables** (example):
```bash
NEXT_PUBLIC_MEDUSA_ENABLED=true
NEXT_PUBLIC_MEDUSA_BASE_URL=https://api.optic.works
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
RESEND_API_KEY=re_...
# See KEY_MANAGEMENT.md for complete list
```

---

## Development vs Production

### Development Environment

**Storefront**:
```bash
pnpm install
pnpm run dev  # localhost:3000
```

**Backend** (local Medusa):
```bash
cd services/medusa
pnpm install
docker-compose up -d  # PostgreSQL + Redis
pnpm run dev  # localhost:9000
```

### Production Environment

**Storefront**: Cloudflare Pages (Phase 4)
**Backend**: Hetzner Cloud (via Ansible)

**Access**:
- Backend API: `https://api.optic.works`
- Admin Dashboard: `https://api.optic.works/app`
- Store API: `https://api.optic.works/store/*`

**Monitoring**:
```bash
# SSH to server
ssh hetzner-node

# PM2 status
pm2 status
pm2 logs medusa-dev

# Service health
systemctl status cloudflared
systemctl status postgresql
systemctl status redis-server

# Application logs
tail -f /opt/opticworks/medusa-backend/services/medusa/logs/*.log
```

---

## Post-Deployment Tasks

After successful provisioning, complete these steps to activate the backend:

### 1. Create Admin User
```bash
# Access admin dashboard
open https://api.optic.works/app

# Use credentials from secrets.yml
Email: admin@optic.works
Password: <from secrets.yml>
```

### 2. Create Publishable API Key
```bash
# Via Admin UI:
Settings → API Key Management → Create API Key
- Name: "Storefront"
- Type: Publishable
- Sales Channel: "Default Sales Channel"

# Copy the key immediately (cannot retrieve later)
# Update Infisical: NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
```

### 3. Import Product Catalog
```bash
ssh hetzner-node
cd /opt/opticworks/medusa-backend/services/medusa

# Import all products from src/lib/products.ts
pnpm run catalog:import

# Verify import
pnpm run catalog:verify

# Test Store API
curl -H "x-publishable-api-key: pk_..." \
  https://api.optic.works/store/products
```

### 4. Sync Secrets to Infisical
```bash
# Upload generated secrets for team access
# See: docs/KEY_MANAGEMENT.md

# Key secrets to sync:
- POSTGRES_PASSWORD
- MEDUSA_ADMIN_PASSWORD
- JWT_SECRET
- COOKIE_SECRET
- NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
```

---

## Troubleshooting

### Common Issues

**Issue**: `ansible all -m ping` fails
```bash
# Verify SSH access
ssh hetzner-node

# Check inventory
cat infrastructure/ansible/inventory/production.ini

# Test with verbose output
ansible all -m ping -vvv
```

**Issue**: Medusa build fails during provision
```bash
# Check build logs
ssh hetzner-node
pm2 logs medusa-dev --lines 100

# Manually rebuild
cd /opt/opticworks/medusa-backend/services/medusa
pnpm run build
```

**Issue**: 502 Bad Gateway on api.optic.works
```bash
# Check Cloudflare Tunnel
ssh hetzner-node
systemctl status cloudflared

# Check Medusa service
pm2 status
pm2 restart medusa-dev

# Check local health
curl http://localhost:9000/health
```

**Issue**: Admin auth fails (401 Unauthorized)
```bash
# See: docs/RFD-006.md for known auth issues
# Workaround: Use secret API key instead of JWT

# Get secret key from database
ssh hetzner-node
psql medusa_db -c "SELECT token FROM api_key WHERE type='secret';"
```

### Health Checks

```bash
# Backend health endpoint
curl https://api.optic.works/health

# PostgreSQL connection
ssh hetzner-node "psql medusa_db -c 'SELECT version();'"

# Redis connection
ssh hetzner-node "redis-cli ping"

# PM2 process status
ssh hetzner-node "pm2 status"

# Cloudflare Tunnel status
ssh hetzner-node "systemctl status cloudflared"
```

### Logs

```bash
# Application logs
ssh hetzner-node "pm2 logs medusa-dev --lines 50"

# Cloudflare Tunnel logs
ssh hetzner-node "journalctl -u cloudflared -n 50"

# PostgreSQL logs
ssh hetzner-node "journalctl -u postgresql -n 50"

# System logs
ssh hetzner-node "journalctl -xe"
```

---

## Roadmap

### Current State (2025-11-20)
- ✅ Ansible Infrastructure-as-Code **COMPLETE**
- ✅ Hetzner backend provisioned **LIVE**
- ✅ Cloudflare Tunnel operational **LIVE**
- ✅ Backend serving at api.optic.works **VERIFIED**
- ✅ Phase 2 infrastructure deployment **COMPLETE**
- ⚠️  Running in dev mode (medusa-dev) due to prod admin bundler issue

### Phase 2: Infrastructure & Backend Deployment (✅ COMPLETE - 2025-11-20)

**Status:** ✅ All infrastructure operational and validated

**Delivered:**
- ✅ Backend at `https://api.optic.works` (Hetzner + Cloudflare Tunnel)
- ✅ PostgreSQL 17 + Redis 7.x operational (proven via API)
- ✅ Medusa v2.11.3 serving Store/Admin APIs (7 products queryable)
- ✅ Admin dashboard accessible with authentication
- ✅ Cloudflare Tunnel configured and routing traffic
- ✅ Infisical secret management integrated
- ✅ Ansible automation preventing infrastructure drift
- ✅ Next.js storefront builds successfully (46 pages)
- ✅ Infrastructure validation suite created

**Validation**: See `docs/PHASE2_VALIDATION_REPORT.md` for complete test results.

**What's Deferred to Phase 3**: Full e-commerce configuration (cart/checkout flow, Medusa regions, payment processing) - infrastructure is ready, configuration is next.

### Phase 3: Complete E-Commerce Integration (📋 READY TO IMPLEMENT)

**Status:** Ready for implementation; focused on Medusa e-commerce migration

**Core Implementation Tracks** (see `docs/PHASE3_PLAN.md` for details):
- [ ] **Track 1**: Medusa e-commerce configuration (regions, payments, shipping)
- [ ] **Track 2**: Cart & checkout integration (full customer purchase flow)
- [ ] **Track 3**: Hookdeck webhook infrastructure (Stripe → Hookdeck → Medusa)
- [ ] **Track 4**: Customer authentication & portal (Medusa CIAM)
- [ ] **Track 5**: E2E + CI coverage for checkout flows

**Deferred to Phase 4 (per `docs/PHASE3_PLAN.md`):** Discord integration, Hugo documentation site, and broader CI/CD hardening.

**Estimated Effort**: ~15-20 implementation sessions focused on Medusa migration

**Details**: See `docs/PHASE3_PLAN.md` for comprehensive implementation guide.

### Phase 4: Production Optimization (📋 FUTURE)

**Planned features:**
- [ ] Migrate storefront from Vercel to Cloudflare Pages
- [ ] Performance optimization (Core Web Vitals)
- [ ] SEO finalization
- [ ] International expansion (EU region, multi-currency)
- [ ] Advanced features (subscriptions, bundles, pre-orders)

---

## Related Documentation

### Documentation Priority

**Start Here:**
1. **This file (DEPLOYMENT_GUIDE.md)** - Infrastructure provisioning and deployment
2. **[PHASE2_VALIDATION_REPORT.md](PHASE2_VALIDATION_REPORT.md)** - Infrastructure validation results
3. **[PHASE3_PLAN.md](PHASE3_PLAN.md)** - Next implementation phase

**Infrastructure & Deployment:**
- **[CONTRIBUTORS.md](CONTRIBUTORS.md)** - Dev setup, SSH access, Hetzner workflow
- **[KEY_MANAGEMENT.md](KEY_MANAGEMENT.md)** - Secret rotation and Infisical strategy
- `infrastructure/ansible/README.md` - Ansible playbook details

**Integration & Development:**
- **[INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)** - Storefront-Backend integration walkthrough
- **[CODEBASE_EXPLANATION.md](CODEBASE_EXPLANATION.md)** - Storefront architecture
- **[STATE_MANAGEMENT.md](STATE_MANAGEMENT.md)** - Zustand store patterns
- **[STRIPE_INTEGRATION.md](STRIPE_INTEGRATION.md)** - Checkout implementation
- **[API_STUBS.md](API_STUBS.md)** - API endpoint design

**Phase Documentation:**
- **[PHASE2_RECREATION_GUIDE.md](PHASE2_RECREATION_GUIDE.md)** - How to recreate validated Phase 2 state

**Archived (Reference Only):**
- `docs/archived/MIGRATION_PLAN.md` - Old manual deployment plan
- `docs/archived/IMPLEMENTATION_GUIDE.md` - Manual setup runbooks
- `docs/archived/INFISICAL_SETUP.md` - Superseded by KEY_MANAGEMENT.md
- `docs/archived/CLOUDFLARE_ACCESS_SETUP.md` - Not implemented

---

## Quick Reference

### Essential Commands

```bash
# Provision full stack
cd infrastructure/ansible
ansible-playbook playbooks/medusa-provision.yml

# Deploy code updates
ansible-playbook playbooks/medusa-deploy.yml

# Teardown for rebuild
ansible-playbook playbooks/medusa-destroy.yml

# SSH to server
ssh hetzner-node

# Check services
pm2 status
systemctl status cloudflared postgresql redis-server

# View logs
pm2 logs medusa-dev
journalctl -u cloudflared -f

# Database access
psql medusa_db

# Redis access
redis-cli
```

### Important URLs

- **Backend API**: https://api.optic.works
- **Admin Dashboard**: https://api.optic.works/app
- **Store API**: https://api.optic.works/store/*
- **Health Check**: https://api.optic.works/health
- **GitHub Repo**: https://github.com/r-mccarty/opticworks-store
- **Cloudflare Dashboard**: https://dash.cloudflare.com

---

**Last Updated**: 2025-11-20
**Next Review**: After Phase 3 Track 1 completion
