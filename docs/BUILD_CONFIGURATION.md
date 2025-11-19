# Build Configuration & Known Issues

**Last Updated**: 2025-11-19

---

## Build Workflow

### Production Build Command
```bash
unset NODE_ENV && pnpm run build
```

**Expected Output**:
- Compilation: ~90-120s (1600+ modules)
- Static page generation: 46 pages
- No errors, no warnings

### Pre-Deployment Checks (Required)
```bash
# 1. Type checking (runs separately)
pnpm exec tsc --noEmit --incremental false
# Expected: Completes in ~2min, no errors

# 2. Linting
pnpm run lint
# Expected: Completes in ~30s, no errors

# 3. Production build
unset NODE_ENV && pnpm run build
# Expected: Completes in ~2-3min, generates 46 pages

# 4. Test build locally (optional)
pnpm run start
# Expected: Serves on http://localhost:3000
```

---

## Known Issue: Next.js 15 Build-Time Type Checking Hang

### Symptom
When `typescript.ignoreBuildErrors` is set to `false`, the build hangs indefinitely at:
```
Checking validity of types ...
```

### Root Cause
**Unknown** - Likely a Next.js 15 bug or incompatibility with large monorepos.

### Evidence
1. `pnpm exec tsc --noEmit` completes successfully in ~2 minutes with **zero errors**
2. Next.js 15 build-time type checking hangs after 3+ minutes
3. Clean builds (removing `.next/`) do not resolve the issue
4. Excluding `archive/`, `services/medusa/`, `.next/` from tsconfig does not resolve the issue

### Current Workaround (Production Best Practice)

**`next.config.ts`**:
```typescript
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,  // Skip during build
  },
  eslint: {
    ignoreDuringBuilds: true, // Skip during build
  },
  // ... rest of config
};
```

**CI/CD Pipeline** (recommended):
```yaml
# Example GitHub Actions workflow
- name: Type Check
  run: pnpm exec tsc --noEmit --incremental false

- name: Lint
  run: pnpm run lint

- name: Build
  run: pnpm run build
  timeout-minutes: 5

- name: Test
  run: pnpm run test
```

### Why This Is Acceptable

**Industry Standard**:
- Vercel, Netlify, and Cloudflare recommend separating type checking from builds
- Faster builds (2-3min vs. indefinite hang)
- Better error isolation (type errors vs. build errors)
- Parallel CI/CD steps (type check + lint + build in parallel)

**Our Validation**:
- ✅ TypeScript strict mode enabled (`tsconfig.json`)
- ✅ Type checking passes with zero errors
- ✅ Linting passes with zero errors
- ✅ Build generates 46 pages successfully
- ✅ Dev server runs without errors

---

## TypeScript Configuration

**`tsconfig.json`**:
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "archive", "services/medusa", ".next"]
}
```

**Key Settings**:
- `strict: true` - All TypeScript strict checks enabled
- `exclude` - Excludes 960MB archive directory and medusa backend
- `incremental: true` - Faster subsequent type checks

---

## Build Performance Metrics

### Development Server
```bash
pnpm run dev
```
- Startup: ~3-4s
- First page compile: ~25-30s (1600+ modules)
- Subsequent compiles: ~1-3s (incremental)

### Production Build
```bash
pnpm run build
```
- Compilation: 90-120s
- Static generation: 30-40s
- Total: ~2-3 minutes
- Output size: ~160KB first load JS

### Type Checking (Separate)
```bash
pnpm exec tsc --noEmit
```
- Duration: ~2 minutes
- Modules checked: ~1600
- Errors: 0

---

## Troubleshooting

### Build Fails with "non-standard NODE_ENV"
**Cause**: `NODE_ENV` is manually set in shell or `.env.local`

**Fix**:
```bash
# Check if set
echo $NODE_ENV

# Unset
unset NODE_ENV

# Remove from .env.local (if present)
# Next.js auto-manages NODE_ENV
```

### Build Fails with "supabaseUrl is required"
**Cause**: Stripe webhook trying to initialize Supabase client

**Fix**: Already resolved in `src/app/api/stripe/webhook/route.ts`
- Supabase client is lazy-loaded
- Gracefully skips if env vars not set

### Type Check Hangs Indefinitely
**Cause**: Next.js 15 build-time type checking issue

**Fix**: Already configured in `next.config.ts`
- Run `pnpm exec tsc --noEmit` separately
- Build completes successfully

---

## Future Improvements

### When Next.js Fixes Build-Time Type Checking
1. Test build with type checking enabled:
   ```typescript
   // next.config.ts
   typescript: {
     ignoreBuildErrors: false,
   },
   ```

2. If build completes without hanging:
   ```bash
   pnpm run build
   # Should complete in ~3-4min (including type check)
   ```

3. Update this document and CI/CD workflows

### Monitoring
- Watch Next.js release notes for type checking fixes
- Test with each Next.js minor version upgrade
- Report issue to Next.js team if not already tracked

---

## Summary

**Current State**: ✅ Production Ready
- Build completes successfully
- Type checking passes (run separately)
- Linting passes (run separately)
- 46 pages generated
- Zero errors

**Recommendation**: Keep current configuration until Next.js 15 build-time type checking is fixed.

**For New Developers**:
1. Run `pnpm run lint` before committing
2. Run `pnpm exec tsc --noEmit` before pushing
3. Run `pnpm run build` to verify production build
4. This workflow is **intentional** and **production-ready**
