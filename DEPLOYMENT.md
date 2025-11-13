# OpticWorks Deployment Guide

This repository uses a monorepo structure with pnpm workspaces. The main Next.js application is located in `apps/storefront/`.

## Deployment Options

### Option 1: Vercel (Recommended for Next.js)

#### Using Vercel UI

1. **Import your repository** to Vercel
2. **Configure Build & Development Settings**:
   - **Root Directory**: `apps/storefront`
   - **Framework Preset**: Next.js
   - **Build Command**: Leave default (`next build`) or use `pnpm run build`
   - **Install Command**: `pnpm install` (at root level)
   - **Output Directory**: Leave default (`.next`)

3. **Environment Variables**: Add all required env vars from `apps/storefront/.env.local`

#### Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from root directory
vercel --cwd apps/storefront
```

### Option 2: Cloudflare Workers (Migration Target)

According to the migration plan (Phase 4), the final deployment target is Cloudflare Workers using OpenNext adapter. This is currently in development.

**Current Status**: Not yet configured
**See**: `docs/MIGRATION_PLAN.md` Phase 4 for implementation details

### Option 3: Docker Deployment

```dockerfile
# Example Dockerfile (create at root)
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm@8.15.0

WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/storefront/package.json apps/storefront/
COPY packages/design-system/package.json packages/design-system/
COPY packages/shared-types/package.json packages/shared-types/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY apps/storefront apps/storefront
COPY packages packages

# Build
RUN pnpm run build:storefront

# Production
FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=base /app/apps/storefront/.next ./apps/storefront/.next
COPY --from=base /app/apps/storefront/public ./apps/storefront/public
COPY --from=base /app/apps/storefront/package.json ./apps/storefront/
COPY --from=base /app/node_modules ./node_modules

WORKDIR /app/apps/storefront
EXPOSE 3000
CMD ["pnpm", "start"]
```

## Monorepo Build Configuration

The repository includes a `vercel.json` file at the root that attempts to configure monorepo builds automatically. However, **setting the Root Directory in your deployment platform's UI is the recommended approach**.

### Root Directory Settings by Platform

| Platform | Setting Name | Value |
|----------|-------------|-------|
| Vercel | Root Directory | `apps/storefront` |
| Netlify | Base directory | `apps/storefront` |
| Cloudflare Pages | Build directory | `apps/storefront` |
| Railway | Root Directory | `apps/storefront` |

## Environment Variables

Required environment variables are documented in `apps/storefront/.env.local.example` (if exists) or see `CLAUDE.md` for the full list.

### Critical Variables

```bash
# Stripe (Required)
STRIPE_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Email (Required)
RESEND_API_KEY=re_xxxxx
NEXT_PUBLIC_FROM_EMAIL=orders@opticworks.com

# Optional but Recommended
EASYPOST_API_KEY=EZTK_xxxxx
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

## Build Troubleshooting

### "No Next.js version detected"

**Cause**: Deployment platform is looking for Next.js in root `package.json`

**Solutions**:
1. **Set Root Directory** to `apps/storefront` (recommended)
2. **Use the vercel.json** configuration (already included)
3. **Deploy the storefront specifically**: `vercel apps/storefront`

### "Module not found" errors

**Cause**: Workspace dependencies not installed properly

**Solution**: Ensure `pnpm install` runs from the **repository root**, not from `apps/storefront/`

```bash
# Correct
cd /path/to/opticworks-store
pnpm install

# Then build
pnpm run build:storefront
```

### TypeScript errors

Run typecheck before deployment:
```bash
pnpm run typecheck
```

## Local Development

```bash
# Install all dependencies (from root)
pnpm install

# Run storefront in development mode
pnpm run dev

# Run all apps (when other apps are implemented)
pnpm run dev:all

# Build storefront
pnpm run build:storefront

# Build all apps
pnpm run build
```

## CI/CD Pipeline

GitHub Actions workflows are planned but not yet implemented. See `docs/MIGRATION_PLAN.md` Phase 7 for details.

## Migration Status

This is a transitional deployment configuration. The final architecture (per migration plan) will be:

- **Frontend**: Cloudflare Workers (OpenNext adapter)
- **Backend**: MedusaJS on Hetzner servers
- **Docs**: Hugo on Cloudflare Pages
- **Auth**: Ory Hydra on Hetzner

**Current Phase**: Phase 1 complete (Foundation)
**Next Phase**: Phase 2 (Design System & UI Refactoring)

See `IMPLEMENTATION_GUIDE.md` for current status and next steps.
