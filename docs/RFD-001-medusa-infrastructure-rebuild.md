# RFD-001: Medusa Infrastructure Rebuild & Standardization

**Status**: Draft
**Created**: 2025-12-01
**Author**: System Analysis
**Discussion**: https://github.com/r-mccarty/solar-saas-template/issues/XXX

---

## Summary

Following a complete infrastructure reprovision on 2025-12-01, multiple critical issues were discovered with the current Medusa backend deployment. This RFD proposes a rebuild following official Medusa v2 documentation and standard deployment practices.

---

## Problem Statement

### Infrastructure Drift Discovered

On 2025-12-01, the Medusa backend at `api.optic.works` was found in a degraded state:

1. **Service Instability**: Admin dashboard throwing 500 errors after sustained use
2. **Database Schema Issues**: PostgreSQL validation tests failing with inconsistent table counts
3. **Repeated Crashes**: PM2 logs showing continuous `ELIFECYCLE Command failed` errors
4. **Code Deployment Gap**: Latest code (e2e-validation.ts, updated scripts) not deployed to server
5. **Credential Mismatch**: Admin user password didn't match Infisical source of truth

### Critical Blocker: Medusa CLI Installation Failure

After full infrastructure teardown and reprovision, the Medusa CLI cannot be installed:

**Symptoms**:
- `@medusajs/medusa` package listed in `services/medusa/package.json`
- `pnpm install` completes without errors
- **Medusa binary NOT created** in `node_modules/.bin/`
- All Medusa commands fail: `sh: medusa: not found`
- Service unable to start in production mode (requires `medusa build`)

**Current Workaround**:
- Force development mode: `medusa develop` (which bypasses build requirement)
- This is not production-ready and masks the underlying issue

---

## Root Cause Analysis

### 1. **Non-Standard Medusa Installation**

**Issue**: The current setup uses a custom monorepo structure with Medusa as a workspace package under `services/medusa/`. This deviates from official Medusa documentation.

**Evidence**:
```
/workspaces/solar-saas-template/
├── services/medusa/          # Custom location
│   ├── package.json          # Workspace package
│   ├── src/                  # Empty (only .gitkeep)
│   └── scripts/              # Custom automation scripts
```

**Official Medusa Setup** (from docs):
```
/my-medusa-store/
├── medusa-config.js          # Root-level config
├── package.json              # Root-level dependencies
└── src/                      # Actual Medusa code
```

### 2. **pnpm Workspace Configuration Conflicts**

**Issue**: pnpm workspaces may be interfering with Medusa's binary installation.

**Evidence**:
- Warning during install: "Ignored build scripts: @medusajs/telemetry, @tailwindcss/oxide..."
- Medusa CLI requires build scripts to create binary symlinks
- pnpm workspace hoisting may prevent proper binary installation

### 3. **TypeScript Configuration Inheritance Issues**

**Issue**: Root `tsconfig.json` excludes `services/medusa` directory, causing build failures.

**Fixed in services/medusa/tsconfig.json** (2025-12-01):
```json
{
  "extends": "../../tsconfig.json",
  "exclude": ["node_modules", ".medusa"]  // Override parent exclude
}
```

**But**: This is a symptom of deeper architectural mismatch.

### 4. **Ansible Provisioning Gaps**

**Issue**: Provisioning playbook incomplete for custom setup.

**Problems**:
- No task to install Medusa service dependencies (added manually during debugging)
- Build task assumes `pnpm run build` works (it doesn't)
- Hardcoded assumption of `medusa-prod` process name
- No verification that Medusa CLI is available before building

---

## Historical Context

### Why Development Mode "Worked"

From PHASE2_INTEGRATION_SUMMARY.md and git history:

1. **Initial deployment** (Nov 18, 2025): Manual setup, likely used `medusa develop`
2. **Phase 2 completion** (Nov 20, 2025): E2E tests passing, but using dev mode
3. **Drift occurred** (Nov 20 - Dec 1): Manual changes, credentials rotated, service crashes
4. **Reprovision attempt** (Dec 1, 2025): Exposed fundamental architecture problems

**The "dev mode workaround" masked the fact that our custom setup never properly supported production builds.**

---

## Proposed Solution

### Option A: Migrate to Standard Medusa Structure (RECOMMENDED)

**Description**: Rebuild Medusa backend following official v2 documentation.

**Steps**:
1. Create new standalone Medusa project: `npx create-medusa-app@latest`
2. Configure as documented: https://docs.medusajs.com/learn/deployment
3. Migrate custom scripts to new structure
4. Update Ansible to deploy standard Medusa app (not monorepo workspace)
5. Preserve storefront as separate Next.js app (current structure is fine)

**Pros**:
- ✅ Follows official best practices
- ✅ Access to official deployment guides and support
- ✅ CLI tools work as expected
- ✅ Production builds function correctly
- ✅ Easier upgrades and maintenance

**Cons**:
- ⚠️ Requires restructuring repository
- ⚠️ Need to migrate existing database (or re-seed products)
- ⚠️ Ansible playbooks need rewrite
- ⚠️ ~4-8 hours of migration work

**Estimated Effort**: 1-2 sessions (6-12 hours)

### Option B: Debug Custom Workspace Setup

**Description**: Continue debugging pnpm workspace issues until Medusa CLI installs.

**Steps**:
1. Investigate pnpm build script approval: `pnpm approve-builds`
2. Research Medusa v2 + pnpm workspace compatibility
3. Potentially restructure workspace configuration
4. Add explicit Medusa CLI installation step

**Pros**:
- ✅ Preserves current monorepo structure
- ✅ No database migration needed

**Cons**:
- ❌ Fighting against official architecture
- ❌ Unknown time investment
- ❌ May break on Medusa updates
- ❌ No official support for this setup
- ❌ Development mode dependency remains a risk

**Estimated Effort**: Unknown (could be 2-20+ hours)

### Option C: Hybrid Approach

**Description**: Keep monorepo but isolate Medusa as git submodule.

**Structure**:
```
/workspaces/solar-saas-template/
├── src/                      # Next.js storefront (unchanged)
├── services/
│   └── medusa/               # Git submodule pointing to standalone Medusa repo
└── infrastructure/ansible/   # Deploy submodule as separate project
```

**Pros**:
- ✅ Medusa uses standard structure
- ✅ Storefront remains in monorepo
- ✅ Easier Medusa upgrades (just update submodule)

**Cons**:
- ⚠️ Adds git submodule complexity
- ⚠️ Two separate pnpm workspaces to manage

**Estimated Effort**: 1 session (4-6 hours)

---

## Recommendation

**Adopt Option A: Migrate to Standard Medusa Structure**

**Rationale**:
1. **Sustainability**: Fighting against official architecture is not maintainable long-term
2. **Production Readiness**: Current setup cannot run production builds
3. **Documentation**: Official guides assume standard structure
4. **Support**: Community/official support expects standard setup
5. **Time Investment**: Upfront migration cost < ongoing debugging cost

**The "dev mode workaround" is a red flag indicating architectural mismatch, not a feature.**

---

## Implementation Plan

### Phase 1: Create Standard Medusa Backend (4 hours)

1. **Scaffold new Medusa project** (separate from monorepo)
   ```bash
   npx create-medusa-app@latest opticworks-backend
   cd opticworks-backend
   ```

2. **Migrate configuration**
   - Copy `services/medusa/.env` → `opticworks-backend/.env`
   - Port `medusa-config.ts` settings
   - Copy custom scripts from `services/medusa/scripts/`

3. **Deploy to Hetzner**
   - Update Ansible `medusa` role to clone standalone repo
   - Remove workspace-specific configuration
   - Verify `medusa build` command works

4. **Database migration**
   - Option 1: Re-seed products (simpler, recommended for Phase 2)
   - Option 2: Export/import existing database

### Phase 2: Update Ansible Automation (2 hours)

1. **Rewrite medusa role** (`infrastructure/ansible/roles/medusa/tasks/main.yml`)
   ```yaml
   - name: Clone Medusa backend
     ansible.builtin.git:
       repo: "{{ medusa_repo_url }}"  # New standalone repo
       dest: /opt/opticworks/medusa

   - name: Install dependencies
     ansible.builtin.command:
       cmd: pnpm install
       chdir: /opt/opticworks/medusa

   - name: Build Medusa
     ansible.builtin.command:
       cmd: pnpm exec medusa build  # This will now work!
       chdir: /opt/opticworks/medusa

   - name: Start with PM2
     ansible.builtin.command:
       cmd: pnpm start:pm2
       chdir: /opt/opticworks/medusa
   ```

2. **Test full provision workflow**
   ```bash
   ansible-playbook playbooks/medusa-destroy.yml
   ansible-playbook playbooks/medusa-provision.yml
   ```

### Phase 3: Validation & Documentation (2 hours)

1. **Run Phase 2 E2E tests**
   ```bash
   cd opticworks-backend
   pnpm tsx scripts/e2e-validation.ts
   ```

2. **Verify production mode works**
   - Health endpoint: ✅
   - Admin dashboard: ✅
   - Store API: ✅
   - No 500 errors after sustained use: ✅

3. **Update documentation**
   - Update DEPLOYMENT_GUIDE.md with new structure
   - Update CLAUDE.md repository map
   - Document migration in CHANGELOG

---

## Migration Checklist

### Pre-Migration
- [ ] Backup current database: `pg_dump medusa_db > backup.sql`
- [ ] Document current product catalog (7 products)
- [ ] List all custom scripts in `services/medusa/scripts/`
- [ ] Export Medusa admin user credentials from Infisical

### Migration
- [ ] Create new Medusa project with `create-medusa-app`
- [ ] Configure database connection
- [ ] Migrate environment variables
- [ ] Port custom scripts
- [ ] Seed products or restore database
- [ ] Test build: `pnpm exec medusa build`
- [ ] Test start: `pnpm start`
- [ ] Verify health endpoint locally

### Deployment
- [ ] Update Ansible playbooks
- [ ] Run `medusa-destroy.yml` on Hetzner
- [ ] Run `medusa-provision.yml` with new setup
- [ ] Verify Cloudflare tunnel routing
- [ ] Run E2E validation tests
- [ ] Smoke test admin dashboard
- [ ] Smoke test storefront integration

### Post-Migration
- [ ] Update PHASE2_VALIDATION_REPORT.md
- [ ] Archive old services/medusa directory
- [ ] Update .gitignore for new structure
- [ ] Create git tag: `v2.1.0-medusa-migration`

---

## Open Questions

1. **Repository Structure**: Should the new Medusa backend be:
   - [ ] Separate repository (cleaner, recommended)
   - [ ] Git submodule in current repo
   - [ ] Subdirectory in current repo (but NOT a workspace package)

2. **Database Migration**: Should we:
   - [ ] Re-seed products (simpler, only 7 products)
   - [ ] Migrate existing database (preserves any test orders/customers)

3. **Storefront Impact**: Does the Next.js storefront need any changes?
   - Expected: **No** - it only talks to Medusa via Store API (same endpoints)

4. **Deployment Cadence**: After migration, should we:
   - [ ] Keep medusa-dev for now (staging environment)
   - [ ] Switch to medusa-prod only (true production setup)

---

## Success Criteria

Migration is complete when:

1. ✅ `pnpm exec medusa build` completes successfully
2. ✅ Backend starts in production mode (`pnpm start`)
3. ✅ E2E validation tests pass (15/15)
4. ✅ Admin dashboard accessible without errors
5. ✅ No 500 errors after 30 minutes of admin usage
6. ✅ Ansible provision workflow succeeds end-to-end
7. ✅ Health endpoint stable: `curl https://api.optic.works/health` → `OK`
8. ✅ Store API returns products: `curl https://api.optic.works/store/products`

---

## References

- **Medusa v2 Documentation**: https://docs.medusajs.com/learn
- **Deployment Guide**: https://docs.medusajs.com/learn/deployment
- **Create Medusa App**: https://docs.medusajs.com/learn/installation
- **Phase 2 Integration Summary**: `/docs/PHASE2_INTEGRATION_SUMMARY.md`
- **Phase 2 Validation Report**: `/docs/PHASE2_VALIDATION_REPORT.md`
- **Current Playbook**: `/infrastructure/ansible/playbooks/medusa-provision.yml`

---

## Decision

**Pending discussion and approval.**

Once approved, create tracking issue and begin Phase 1 implementation.
