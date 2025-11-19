# Phase 2 State Recreation Guide

**Last Updated**: 2025-11-19
**Status**: ✅ Phase 2 Complete and Validated
**Purpose**: Step-by-step guide to recreate the validated Phase 2 integration state

---

## Current Validated State

**Backend**: https://api.optic.works (Medusa v2.11.3 on Hetzner)
- ✅ Health endpoint operational
- ✅ Store API serving 7 products
- ✅ Admin dashboard accessible
- ✅ PostgreSQL 17 + Redis 7.x operational

**Storefront**: Next.js 15.5.0 (App Router)
- ✅ Production build: 46 pages generated
- ✅ Products loading from Medusa API
- ✅ Cart and checkout pages operational
- ✅ Type checking passes (run separately)

**Integration Points**:
- ✅ Medusa Store API ↔ Next.js storefront
- ✅ Stripe test mode configured
- ✅ Environment variables managed (ready for Infisical)
- ✅ Build process optimized

---

## Prerequisites

1. **Access**:
   - GitHub repository: `r-mccarty/opticworks-store`
   - Infisical project (for secret retrieval)
   - Hetzner node SSH access (via GitHub Codespaces)

2. **Tools** (pre-installed in Codespaces):
   - Node.js 22
   - pnpm 9.x
   - Git
   - curl, jq

3. **Secrets** (obtain from team/Infisical):
   - Medusa publishable key
   - Medusa admin credentials
   - Stripe test keys
   - Backend authentication secrets

---

## Step-by-Step Recreation

### 1. Clone Repository and Set Up Environment

```bash
# Clone the repository
git clone https://github.com/r-mccarty/opticworks-store.git
cd opticworks-store

# Checkout the validated Phase 2 commit
git checkout main
git log --oneline -5  # Verify you're on/after commit a4dcd5c

# Install dependencies
pnpm install
```

### 2. Configure Environment Variables

Create `.env.local` with the following structure. Get actual values from Infisical or team lead:

```bash
# Core Configuration
NEXT_PUBLIC_APP_URL='http://localhost:3000'

# Medusa Integration
NEXT_PUBLIC_MEDUSA_ENABLED='true'
NEXT_PUBLIC_MEDUSA_BASE_URL='https://api.optic.works'
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY='pk_REDACTED_GET_FROM_INFISICAL'
MEDUSA_ADMIN_EMAIL='admin@optic.works'
MEDUSA_ADMIN_PASSWORD='REDACTED_GET_FROM_INFISICAL'

# Stripe Integration (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY='pk_test_...'  # Get from Infisical
STRIPE_SECRET_KEY='sk_test_...'  # Get from Infisical
```

**Important**:
- Do NOT manually set `NODE_ENV` (Next.js manages this automatically)
- See `docs/PHASE2_INTEGRATION_SUMMARY.md` for complete variable list
- All secrets available in Infisical (path: `/`, environment: `development`)

### 3. Verify Backend Connectivity

```bash
# Test backend health
curl https://api.optic.works/health
# Expected: OK

# Test Store API (use your actual publishable key)
curl -H "x-publishable-api-key: pk_YOUR_KEY_HERE" \
  https://api.optic.works/store/products | jq '.products[0].title'
# Expected: "Bed Presence Sensor Kit" or similar
```

### 4. Run Development Server

```bash
# Ensure NODE_ENV is not set
unset NODE_ENV

# Start dev server
pnpm run dev
# Expected: Server starts on http://localhost:3000 in ~4s
```

**Verify in browser**:
- Homepage loads with product data
- Products page shows items from Medusa
- Cart page loads without errors

### 5. Run Pre-Commit Checks

```bash
# Type checking (should complete in ~2min)
pnpm exec tsc --noEmit --incremental false
# Expected: No errors

# Linting
pnpm run lint
# Expected: No errors

# Production build
unset NODE_ENV && pnpm run build
# Expected: 46 pages generated in ~2-3min
```

### 6. Test Production Build (Optional)

```bash
# Start production server
pnpm run start
# Expected: Server on http://localhost:3000

# Verify products load
curl http://localhost:3000 | grep "Bed Presence"
# Expected: Product data visible
```

---

## Validation Checklist

Use this checklist to confirm Phase 2 state is correctly recreated:

### Backend Validation
- [ ] Health endpoint returns "OK"
- [ ] Store API returns products (7 items)
- [ ] Publishable key authentication works
- [ ] Admin dashboard accessible at `https://api.optic.works/app`

### Storefront Validation
- [ ] Dev server starts without errors
- [ ] Homepage renders products from Medusa
- [ ] Products page shows dynamic catalog
- [ ] Cart page loads successfully
- [ ] Type checking passes independently
- [ ] Production build completes (46 pages)
- [ ] Production server serves content

### Integration Validation
- [ ] Products fetch from Medusa API (not static data)
- [ ] `NEXT_PUBLIC_MEDUSA_ENABLED='true'` in `.env.local`
- [ ] No Supabase errors during build
- [ ] No NODE_ENV conflicts

---

## Troubleshooting

### Issue: Build hangs at "Checking validity of types"

**Cause**: Next.js 15 build-time type checking issue

**Solution**: This is expected and handled by configuration
- Type checking is skipped during build (configured in `next.config.ts`)
- Run `pnpm exec tsc --noEmit` separately
- See `docs/BUILD_CONFIGURATION.md` for details

### Issue: "supabaseUrl is required" during build

**Cause**: Stripe webhook trying to initialize Supabase client

**Solution**: Already fixed in `src/app/api/stripe/webhook/route.ts`
- Supabase client is lazy-loaded and optional
- If error persists, pull latest code from main branch

### Issue: Products not loading from Medusa

**Check**:
1. Verify `NEXT_PUBLIC_MEDUSA_ENABLED='true'` in `.env.local`
2. Verify publishable key is correct
3. Test backend API directly with curl
4. Check browser console for CORS errors

**Fix**:
```bash
# Test API directly
curl -H "x-publishable-api-key: YOUR_KEY" \
  https://api.optic.works/store/products
```

### Issue: Build timeouts

**Cause**: Codespaces resource limits

**Solution**:
- Builds take 2-3min, increase timeout if needed
- Run `rm -rf .next` to clear cache
- Close other processes to free memory

---

## Files Modified in Phase 2

Reference these files if recreating from an earlier state:

1. **`.env.local`** (not in git - create from template above)
   - Removed manual NODE_ENV setting
   - Added comprehensive comments

2. **`next.config.ts`**
   - Added TypeScript/ESLint skip flags (documented workaround)
   - See lines 4-14 for explanation

3. **`tsconfig.json`**
   - Excluded `archive/`, `services/medusa/`, `.next/` directories
   - Improves type checking performance

4. **`src/app/api/stripe/webhook/route.ts`**
   - Made Supabase client lazy-loaded (lines 16-26)
   - Added null checks before Supabase usage

5. **Documentation**:
   - `docs/PHASE2_INTEGRATION_SUMMARY.md` - Integration guide
   - `docs/BUILD_CONFIGURATION.md` - Build troubleshooting
   - `docs/PHASE2_RECREATION_GUIDE.md` - This file

---

## Key Commits

Reference these commits for Phase 2 work:

```bash
# View Phase 2 commits
git log --oneline --grep="phase2\|medusa" -10

# Key commit
a4dcd5c - feat(phase2): complete Medusa v2 integration with build optimizations
```

---

## Next Steps After Recreation

Once Phase 2 state is validated:

1. **Push secrets to Infisical** (if not already done):
   - Use Infisical web UI
   - Path: `/`, Environment: `development`
   - See `docs/PHASE2_INTEGRATION_SUMMARY.md` for variable list

2. **Test E2E checkout flow**:
   - Add product to cart
   - Proceed through checkout
   - Test with Stripe test card: `4242 4242 4242 4242`

3. **Deploy to Vercel** (Phase 3):
   - Connect Infisical to Vercel
   - Set environment variables
   - Deploy and test

---

## Support

If you encounter issues recreating Phase 2 state:

1. Check `docs/BUILD_CONFIGURATION.md` for build issues
2. Check `docs/PHASE2_INTEGRATION_SUMMARY.md` for integration details
3. Verify all secrets are correct (test backend API directly)
4. Review commit `a4dcd5c` for exact changes made

**Last Validated**: 2025-11-19
**Validation Performed By**: Claude Code + OpticWorks Team
**Backend Version**: Medusa v2.11.3
**Frontend Version**: Next.js 15.5.0
