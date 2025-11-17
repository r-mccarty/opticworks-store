# Development Scorecard

**Last updated:** 2025-11-17
**Maintainers:** Platform Engineering

## Current Snapshot

| Phase | Scope | Status | Notes |
| --- | --- | --- | --- |
| Phase 1 – Bootstrap & Validation | Hetzner Medusa + Cloudflare Tunnel + single-product checkout (Milestones B1–B3) | 🟡 In Progress | **Docs complete (v4.1)**, Hetzner repo cloned, dependencies installing. Cloudflare Tunnel now in Phase 1 for secure-by-default deployment. |
| Phase 2 – Catalog & Storefront Integration | Full catalog import, storefront integration via tunnel (Milestones B4–B6) | ⚪ Not Started | All 17 automation scripts ready (RFD-004 resolved). Awaiting Phase 1 deployment completion. |
| Phase 3 – Knowledge Systems & Hardening | Hugo docs, Discourse forum, CI/CD (Milestones B7–B9) | ⚪ Not Started | Scaffolds ready in `platform/docs-site/` and `platform/forum/`. |
| Phase 4 – Storefront Deployment & Webhooks | Cloudflare Pages, webhook buffer Workers (Milestones P1–P3) | ⚪ Not Started | Documented and ready. Tunnel already complete in Phase 1. |

## Highlights (Since Previous Update)

1. **Stripe Checkout Refactor**  
   - Added typed Custom Checkout surface (`src/types/stripe-checkout.ts`).  
   - `CheckoutWrapper` now calls `stripe.initCheckout` with Medusa-provided client secrets.  
   - `CheckoutForm` mounts address/payment elements from the checkout instance and uses `checkout.confirm`.  
   - Zustand checkout store now consumes shared shipping types.  

2. **Medusa Workspace Enablement**  
   - Created `services/medusa/medusa-config.ts` with DB/Redis defaults, Stripe provider config, and optional R2 upload support.  
   - Updated `.env.example`, package dependencies (`ts-node`, `tsx`), and README to document local workflow.  
   - Verified `pnpm --filter @opticworks/medusa-service dev` loads the config (requires local Postgres/Redis).  

3. **Process Documentation**  
   - `docs/stripe-refactor.md` now logs the completed Option B implementation status.  
   - AGENTS/CLAUDE call out the longer `pnpm run build` timeout requirement.  

## In Flight / Next Up

### Phase 1 – Bootstrap & Validation (In Progress)
- [x] Documentation v4.1 complete (tunnel-first approach)
- [x] Repository cloned to `/opt/opticworks/medusa-backend` on Hetzner
- [ ] Complete dependency installation (`pnpm install` in progress)
- [ ] Generate secure credentials via `pnpm run generate:secrets`
- [ ] Provision PostgreSQL + Redis via `scripts/hetzner-provision.sh`
- [ ] Run database migrations: `pnpm run migrate`
- [ ] Build admin dashboard: `pnpm run build`
- [ ] Setup publishable API key: `pnpm run setup:keys`
- [ ] **Install Cloudflare Tunnel** (cloudflared daemon, authenticate, configure for `api.optic.works`)
- [ ] **Configure DNS CNAME**: `api.optic.works` → tunnel
- [ ] Start Medusa with PM2: `pnpm run dev:pm2`
- [ ] Verify tunnel connectivity: `curl https://api.optic.works/health`
- [ ] Import first product (Bed Presence Sensor) via Admin UI at `https://api.optic.works/app`
- [ ] Complete E2E checkout test against tunnel endpoint

### Phase 2 – Catalog & Storefront Integration
- [ ] Run automated catalog import: `pnpm run catalog:import` (all products from `src/lib/products.ts`)
- [ ] Verify imported catalog: `pnpm run catalog:verify`
- [ ] Update storefront `.env.local`: `NEXT_PUBLIC_MEDUSA_ENABLED=true`, `NEXT_PUBLIC_MEDUSA_BASE_URL=https://api.optic.works`
- [ ] Test product listing, detail pages, cart operations via tunnel
- [ ] Implement full checkout integration (Medusa payment sessions, not legacy `/api/stripe/*`)
- [ ] Run E2E tests for all products (not just Bed Sensor)
- [ ] Archive `src/lib/products.ts` to `docs/archived/static-catalog.ts`
- [ ] Delete legacy Stripe routes (`/api/stripe/create-payment-intent`, `/create-checkout-session`, `/webhook`)

### Phase 3 – Knowledge Systems & Hardening
- [ ] Configure Hugo in `platform/docs-site/`, sync content from `/docs` markdown
- [ ] Deploy Hugo site to Cloudflare Pages (build command: `hugo --minify`)
- [ ] Set up Discourse forum via `platform/forum/docker-compose.yml`
- [ ] Apply OpticWorks theme, configure SMTP for notifications
- [ ] Create GitHub Actions CI workflow (`docs/CI.md` checklist)
- [ ] Add Medusa deployment script for Hetzner (systemd service)
- [ ] Document rollback procedures, monitoring setup (UptimeRobot, Sentry)

## Risks & Blockers

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Hetzner provisioning not completed | Storefront cannot exercise Medusa carts/endpoints | Finalize tunnel + SSH access, document deployment steps. |
| Stripe keys still stored in storefront env | Security & compliance exposure | Move secrets into Medusa `.env` once backend is online; storefront should only load publishable key. |
| Long Next.js build time in Codespaces | Frequent timeout during `pnpm run build` | Continue running with higher timeout (≥240 s) or pre-build caches. |

## Action Items

1. **Owner: Platform Eng** – Complete Hetzner deployment using deployment guide below, configure Cloudflare Tunnel DNS.
2. **Owner: Commerce Services** – Test Medusa Admin at `https://api.optic.works/app`, import first product, validate API.
3. **Owner: Storefront** – Update `.env.local` to point to `https://api.optic.works`, test integration.
4. **Owner: Knowledge Systems** – Begin Hugo docs site setup once Phase 2 nears completion.

_Update cadence: weekly until all four migration phases ship._

---

## Quick Deployment Guide (Resume Phase 1)

The Hetzner node has:
- ✅ Repository cloned to `/opt/opticworks/medusa-backend`
- 🟡 Dependencies partially installed (node_modules exists, ~80% complete)

**Next steps** (run via `ssh hetzner-node`):

```bash
# 1. Complete dependency installation (if needed)
cd /opt/opticworks/medusa-backend
pnpm install

# 2. Generate secure credentials
cd services/medusa
pnpm run generate:secrets > /tmp/medusa-secrets.env
cat /tmp/medusa-secrets.env  # Review credentials

# 3. Provision PostgreSQL + Redis (requires sudo)
source /tmp/medusa-secrets.env
POSTGRES_PASSWORD=$POSTGRES_PASSWORD REDIS_PASSWORD=$REDIS_PASSWORD \
  bash scripts/hetzner-provision.sh

# 4. Configure environment
cp .env.example .env
nano .env  # Paste credentials from /tmp/medusa-secrets.env

# 5. Run migrations and build
pnpm run migrate
pnpm run build

# 6. Setup API keys
pnpm run setup:keys  # Outputs publishable key for storefront

# 7. Install Cloudflare Tunnel
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb
cloudflared tunnel login  # Opens browser for authentication
cloudflared tunnel create opticworks-medusa
TUNNEL_ID=$(cloudflared tunnel list | grep opticworks-medusa | awk '{print $1}')

# 8. Configure tunnel
sudo mkdir -p /etc/cloudflared
sudo tee /etc/cloudflared/config.yml > /dev/null <<EOF
tunnel: $TUNNEL_ID
credentials-file: /root/.cloudflared/${TUNNEL_ID}.json
ingress:
  - hostname: api.optic.works
    service: http://localhost:9000
  - service: http_status:404
EOF
cloudflared tunnel ingress validate

# 9. Configure DNS (user action required)
# In Cloudflare dashboard for optic.works:
# Add CNAME: api -> <tunnel-id>.cfargotunnel.com (Proxied)

# 10. Start tunnel service
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared

# 11. Start Medusa with PM2
pnpm run dev:pm2

# 12. Verify
curl https://api.optic.works/health
# Open browser: https://api.optic.works/app
```

**See `docs/IMPLEMENTATION_GUIDE.md` for complete step-by-step instructions.**
