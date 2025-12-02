# RFD-001 Implementation Summary: Standard Medusa Setup (Option A)

**Date**: December 2, 2025
**Status**: 🔄 IN PROGRESS - Deployment Architecture Fix Required
**Approach**: Option A - Migrate to Standard Medusa Structure

---

## Summary

Rebuilt the Medusa backend infrastructure to follow official Medusa v2 standards, moving from a problematic pnpm workspace setup to a standalone project structure. Local builds succeed, database migrations complete, but deployment requires architecture fix to properly isolate `/backend` from monorepo workspace.

---

## Changes Implemented

### 1. New Backend Structure (`/backend`)

Created a standard Medusa v2.12.0 project at `/backend` with:
- ✅ Standard directory structure (not a workspace package)
- ✅ Independent `package.json` and `pnpm-lock.yaml`
- ✅ Functional Medusa CLI (`pnpm exec medusa --version` works)
- ✅ Successful production builds (`pnpm exec medusa build`)
- ✅ PM2 ecosystem configuration for process management

### 2. Production-Ready Module Configuration

Configured `medusa-config.ts` with:

**Infrastructure Modules (Redis-backed)**:
- Cache Module (`@medusajs/medusa/cache-redis`)
- Event Bus Module (`@medusajs/medusa/event-bus-redis`)
- Workflow Engine Module (`@medusajs/medusa/workflow-engine-redis`)
- Locking Module (`@medusajs/medusa/locking`)

**Integration Modules**:
- Payment Module: Stripe (`@medusajs/medusa/payment-stripe`)
- Notification Module: Local (Resend integration via custom module)
- File Module: Local (`@medusajs/medusa/file-local`, R2 migration planned)

**Core Modules (using defaults)**:
- Currency, Cart, Customer, Auth, Session, API Key, Order, Product, Region

### 3. Migrated Custom Scripts

All operational scripts moved to `/backend/src/scripts/`:
- `health-check.ts`, `validate-build.ts`, `smoke-test.ts`, `e2e-validation.ts`
- `import-products.ts`, `verify-catalog.ts`, `setup-publishable-key.ts`
- `generate-secrets.ts`, `pull-secrets-from-infisical.sh`, `push-secrets-to-infisical.sh`
- Utility modules: `utils/auth.ts`, `utils/retry.ts`

### 4. Updated Workspace Configuration

**Root `pnpm-workspace.yaml`**:
- Added `'!backend'` exclusion to prevent workspace hoisting
- Backend now installs dependencies independently with `--ignore-workspace` flag

### 5. Rebuilt Ansible IaC

**Updated Variables** (`infrastructure/ansible/group_vars/all.yml`):
```yaml
medusa_service_dir: "{{ app_root }}/backend"  # Changed from /services/medusa
```

**Rewritten Medusa Role** (`roles/medusa/tasks/main.yml`):
- ❌ Removed: Root `pnpm install` (no monorepo logic)
- ❌ Removed: Service-specific `pnpm install` (replaced with standalone install)
- ✅ Added: `pnpm install --ignore-workspace` in backend directory
- ✅ Added: Medusa CLI verification step
- ✅ Added: `pnpm exec medusa build` for production builds
- ✅ Updated: PM2 startup to use `ecosystem.config.js --env production`

**Enhanced Environment Template** (`roles/medusa/templates/medusa.env.j2`):
- Added Redis URLs for infrastructure modules (`REDIS_CACHE_URL`, `REDIS_EVENTS_URL`, etc.)
- Added Stripe configuration (`STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`)
- Added Resend/email configuration (`RESEND_API_KEY`, `EMAIL_FROM`)
- Updated CORS variables to match Medusa v2 naming (`STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS`)

---

## Build Verification

**Backend Build**: ✅ SUCCESS
```bash
$ cd /workspaces/solar-saas-template/backend
$ pnpm exec medusa build
[32minfo[39m:    Backend build completed successfully (8.94s)
```

**Medusa CLI**: ✅ FUNCTIONAL
```bash
$ pnpm exec medusa --version
Medusa CLI version: 2.12.0
Medusa version: 2.12.0
```

**Admin Build**: ✅ FIXED (Dec 2, 2025)
- Issue: Missing `@medusajs/admin-shared` dependency
- Fix: Added `@medusajs/admin-shared@2.12.0` to devDependencies
- Result: Both backend and frontend build successfully

---

## Deployment Progress (Dec 2, 2025)

### ✅ Successfully Completed

1. **Database Infrastructure**
   - PostgreSQL 17 running and accessible
   - Database `medusa_db` and user `medusa_user` created
   - Schema permissions granted (`GRANT ALL ON SCHEMA public`)
   - ✅ All migrations completed successfully (100+ migrations across 20+ modules)

2. **Environment Configuration**
   - DATABASE_URL properly encoded (forward slashes as `%2F`)
   - Redis connections established (cache, events, workflow engine)
   - dotenv-cli added for reliable environment loading in PM2
   - `.env` file templated via Ansible with proper URL encoding

3. **Build System**
   - Backend builds successfully (`medusa build` - backend: 4.2s)
   - Admin panel builds successfully (frontend: 23.2s)
   - Both `.medusa/server` and `.medusa/client` directories created
   - Medusa CLI functional and verified

4. **Code Fixes Applied**
   - Added `@medusajs/admin-shared` to package.json devDependencies
   - Updated `package.json` to use `dotenv-cli` in start script
   - Temporarily disabled Notification and File modules (incorrect import paths)
   - Fixed Ansible template to properly encode DATABASE_URL passwords

### ❌ Deployment Blocker Discovered

**Issue**: Monorepo Workspace Conflict

**Problem**:
- Ansible clones entire monorepo to `/opt/opticworks/medusa-backend/`
- This creates workspace `node_modules` at `/opt/opticworks/medusa-backend/node_modules`
- When Medusa runs from `/opt/opticworks/medusa-backend/backend/`, pnpm resolves modules from parent workspace
- Admin panel looks for build in `/opt/opticworks/medusa-backend/.medusa/admin/` (doesn't exist)
- Actual admin build is at `/opt/opticworks/medusa-backend/backend/.medusa/client/`

**Root Cause**:
The `/backend` directory is designed to be a **standalone Medusa project**, not a workspace package. Deploying it within the monorepo creates module resolution conflicts that break the runtime.

**Impact**:
- Medusa server fails to start: `Could not find index.html in the admin build directory`
- Module paths reference wrong `node_modules` directory
- Cannot serve admin panel or API endpoints

---

## Plan: Deploy-Only-Backend Architecture (Option 1)

### Objective
Modify Ansible deployment to clone and deploy **only** the `/backend` directory as a standalone application, completely isolated from the monorepo workspace.

### Implementation Steps

#### 1. Update Ansible Clone Strategy

**Current** (`roles/medusa/tasks/main.yml`):
```yaml
- name: Clone or update repository
  ansible.builtin.git:
    repo: "{{ repo_url }}"
    dest: "{{ app_root }}"        # Clones entire monorepo
    version: "{{ repo_branch }}"
```

**Proposed**:
```yaml
- name: Clone repository with sparse checkout (backend only)
  block:
    - name: Initialize git repository
      ansible.builtin.command:
        cmd: git init
        chdir: "{{ app_root }}"
      args:
        creates: "{{ app_root }}/.git"

    - name: Configure sparse checkout
      ansible.builtin.command:
        cmd: git sparse-checkout set backend
        chdir: "{{ app_root }}"

    - name: Add remote origin
      ansible.builtin.command:
        cmd: git remote add origin {{ repo_url }}
        chdir: "{{ app_root }}"
      ignore_errors: yes  # May already exist

    - name: Pull backend directory only
      ansible.builtin.command:
        cmd: git pull origin {{ repo_branch }}
        chdir: "{{ app_root }}"

    - name: Move backend contents to app root
      ansible.builtin.command:
        cmd: rsync -a backend/ . && rm -rf backend/
        chdir: "{{ app_root }}"
```

**Alternative (simpler)**:
```yaml
- name: Clone full repository to temp location
  ansible.builtin.git:
    repo: "{{ repo_url }}"
    dest: "/tmp/medusa-clone"
    version: "{{ repo_branch }}"
    force: yes

- name: Sync backend directory to app root
  ansible.builtin.synchronize:
    src: "/tmp/medusa-clone/backend/"
    dest: "{{ app_root }}/"
    delete: yes
  delegate_to: "{{ inventory_hostname }}"

- name: Clean up temp clone
  ansible.builtin.file:
    path: "/tmp/medusa-clone"
    state: absent
```

#### 2. Update Ansible Variables

**Change** (`infrastructure/ansible/group_vars/all.yml`):
```yaml
# Before:
medusa_service_dir: "{{ app_root }}/backend"

# After:
medusa_service_dir: "{{ app_root }}"  # app_root IS the backend now
```

#### 3. Update PM2 Ecosystem Config

**No changes needed** - `cwd: __dirname` already correct since `/backend` will be deployed as root

#### 4. Update Deployment Tasks

**Modify** (`roles/medusa/tasks/main.yml`):
```yaml
# Remove redundant backend subdirectory references
- name: Install Medusa dependencies (standalone, not workspace)
  ansible.builtin.command:
    cmd: pnpm install --ignore-workspace
    chdir: "{{ app_root }}"  # Not {{ app_root }}/backend

- name: Create Medusa .env file
  ansible.builtin.template:
    src: medusa.env.j2
    dest: "{{ app_root }}/.env"  # Not {{ medusa_service_dir }}/.env
```

#### 5. Verification Steps Post-Deployment

```bash
# 1. Verify no workspace artifacts
ssh hetzner-node "ls -la /opt/opticworks/medusa-backend/ | grep -E 'pnpm-workspace|package.json'"
# Should ONLY show backend's package.json, no pnpm-workspace.yaml

# 2. Verify module resolution
ssh hetzner-node "cd /opt/opticworks/medusa-backend && pnpm exec medusa --version"
# Should use /opt/opticworks/medusa-backend/node_modules

# 3. Verify admin build location
ssh hetzner-node "ls -la /opt/opticworks/medusa-backend/.medusa/client/index.html"
# Should exist

# 4. Start Medusa and check health
ssh hetzner-node "pm2 restart medusa-prod"
curl https://api.optic.works/health
# Should return {"status": "ok"}

# 5. Verify admin panel accessible
curl -I https://api.optic.works/app
# Should return 200 OK
```

### Expected Outcome

After implementing Option 1:
- ✅ `/opt/opticworks/medusa-backend/` contains ONLY backend code (no monorepo artifacts)
- ✅ Module resolution works correctly (no workspace conflicts)
- ✅ Admin panel accessible at `https://api.optic.works/app`
- ✅ API endpoints respond at `https://api.optic.works/health`, `/store/*`, etc.
- ✅ PM2 runs Medusa successfully without crashes

### Files Requiring Updates

1. `infrastructure/ansible/roles/medusa/tasks/main.yml` - Clone strategy
2. `infrastructure/ansible/group_vars/all.yml` - Variable paths
3. `backend/package.json` - Add `@medusajs/admin-shared` (already done locally)
4. Ansible environment template - Ensure DATABASE_URL encoding (already fixed)

---

## Current Deployment State

**Deployed but Not Running**:
- ✅ PostgreSQL 17 + Redis 7.x operational
- ✅ Database migrations completed (all 100+ migrations successful)
- ✅ Backend code deployed to `/opt/opticworks/medusa-backend/backend/`
- ✅ Admin and server builds exist
- ❌ Medusa fails to start due to workspace conflict
- ❌ Health endpoint not accessible

**Next Actions**:
1. Implement Option 1 deployment architecture changes (Ansible updates)
2. Commit all fixes to repository (`@medusajs/admin-shared`, `dotenv-cli`, medusa-config changes)
3. Redeploy using updated Ansible playbook
4. Verify Medusa starts successfully
5. Import product catalog (7 products)
6. Complete E2E validation

---

## Deployment Readiness (Updated)

### Prerequisites Checklist

Before deploying to Hetzner:

1. **Secrets Sync**:
   ```bash
   cd infrastructure/ansible
   bash scripts/generate-secrets-from-infisical.sh
   ```

2. **Verify Infisical Variables** (see `docs/KEY_MANAGEMENT.md`):
   - `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`
   - `RESEND_API_KEY`, `EMAIL_FROM`
   - `JWT_SECRET`, `COOKIE_SECRET`, `MEDUSA_ADMIN_PASSWORD`
   - Database credentials: `POSTGRES_DB_PASSWORD`

3. **Database Strategy**: Start fresh (re-import 7 products post-deployment)

### Deployment Command

```bash
cd infrastructure/ansible
ansible-playbook playbooks/medusa-provision.yml
```

**Expected Outcome**:
- ✅ PostgreSQL 17, Redis 7.x installed
- ✅ Backend cloned to `/opt/opticworks/medusa-backend/backend`
- ✅ Dependencies installed with `pnpm install --ignore-workspace`
- ✅ Production build executes successfully
- ✅ PM2 starts `medusa-prod` process
- ✅ Cloudflare Tunnel routes `api.optic.works` → `localhost:9000`
- ✅ Health endpoint responds: `curl https://api.optic.works/health`

### Post-Deployment

1. **Import Products**:
   ```bash
   ssh hetzner-node
   cd /opt/opticworks/medusa-backend/backend
   pnpm exec tsx src/scripts/import-products.ts
   ```

2. **Verify Catalog**:
   ```bash
   pnpm exec tsx src/scripts/verify-catalog.ts
   ```

3. **Run E2E Validation**:
   ```bash
   pnpm exec tsx src/scripts/e2e-validation.ts
   ```

4. **Check PM2 Status**:
   ```bash
   pm2 status
   pm2 logs medusa-prod
   ```

---

## Architecture Comparison

| Aspect | Before (Monorepo Workspace) | After (Standard Structure) |
|--------|----------------------------|----------------------------|
| **Location** | `/services/medusa/` | `/backend/` |
| **Structure** | pnpm workspace package | Standalone Medusa project |
| **CLI Binary** | ❌ NOT created | ✅ Works (`node_modules/.bin/medusa`) |
| **Production Build** | ❌ Fails (`medusa: not found`) | ✅ Succeeds (`pnpm exec medusa build`) |
| **Deployment Mode** | Dev mode workaround (`medusa develop`) | Production mode (`medusa start`) |
| **Source Code** | `src/` mostly empty | Full Medusa source structure |
| **Dependencies** | Hoisted to root workspace | Independent `node_modules/` |
| **Maintenance** | Fighting Medusa architecture | Aligned with official docs |

---

## Rollback Plan

If deployment fails:

1. **Git Revert**:
   ```bash
   git revert HEAD
   ```

2. **Revert Ansible Variables**:
   ```yaml
   medusa_service_dir: "{{ app_root }}/services/medusa"
   ```

3. **Restart Old Process**:
   ```bash
   ssh hetzner-node
   pm2 restart medusa-dev
   ```

**Risk Level**: Medium (fresh database, but only 7 products to re-import)

---

## Next Steps

### Immediate
1. Sync secrets from Infisical
2. Execute `ansible-playbook playbooks/medusa-provision.yml`
3. Verify deployment health
4. Re-import product catalog

### Follow-Up (Optional)
1. Resolve admin frontend build issue (dependency resolution)
2. Update `CLAUDE.md` and `README.md` to reflect new structure
3. Update `docs/DEPLOYMENT_GUIDE.md` with new paths
4. Archive `services/medusa/` → `services/medusa-legacy/`
5. Add Resend custom notification module (replace local provider)
6. Migrate file storage from local to Cloudflare R2

### Phase 3 (Per PHASE3_PLAN.md)
Continue with Medusa e-commerce migration tasks (cart/checkout, regions, etc.)

---

## Success Metrics (Updated Dec 2, 2025)

### Phase 1: Build & Infrastructure (✅ COMPLETE)
1. ✅ `pnpm exec medusa build` completes without errors (backend + admin)
2. ✅ Medusa CLI binary created in `node_modules/.bin/`
3. ✅ `pnpm start` script configured with dotenv-cli
4. ✅ Database migrations complete (100+ migrations successful)
5. ✅ PostgreSQL permissions configured correctly
6. ✅ Redis connections operational (cache, events, workflow)

### Phase 2: Deployment Architecture (🔄 IN PROGRESS)
1. ⏳ Ansible updated to deploy backend-only (Option 1 implementation)
2. ⏳ Module resolution working (no workspace conflicts)
3. ⏳ Health endpoint accessible
4. ⏳ Admin dashboard accessible
5. ⏳ API endpoints functional
6. ⏳ PM2 running stably without crashes

### Phase 3: Validation (⏸️ BLOCKED)
1. ⏳ E2E validation tests passing
2. ⏳ Product catalog imported (7 products)
3. ⏳ Product API returns all products
4. ⏳ Admin login functional with Infisical credentials
5. ⏳ Store API endpoints responding

**Estimated Effort**: 4-6 hours
**Actual Time Spent**: ~8 hours (including debugging workspace conflicts)
**Status**: 🔄 IN PROGRESS - Deployment architecture fix required (Option 1)
**Blocker**: Monorepo workspace conflict - requires Ansible refactoring to deploy backend-only

---

## References

- **RFD-001**: Original proposal for standard Medusa structure
- **Medusa Docs**: https://docs.medusajs.com/
- **Module Docs**: https://docs.medusajs.com/resources/architectural-modules
- **Deployment Guide**: `docs/DEPLOYMENT_GUIDE.md`
- **Key Management**: `docs/KEY_MANAGEMENT.md`

---

**Implementation by**: Claude Code
**Approval**: Pending deployment verification
