# Development Scorecard

**Last updated:** 2025-11-15  
**Maintainers:** Platform Engineering

## Current Snapshot

| Phase | Scope | Status | Notes |
| --- | --- | --- | --- |
| Phase 1 – Bootstrap & Validation | Hetzner Medusa deployment + single-product checkout (Milestones B1–B3) | 🟡 In Progress | Devcontainer now handles SSH + Git LFS; awaiting Hetzner Medusa bring-up, first product import, and E2E checkout. |
| Phase 2 – Catalog & Storefront Integration | Catalog import, storefront fetches, Medusa checkout (Milestones B4–B6) | ⚪ Not Started | Depends on Phase 1 health. Scripts + service layer exist but still rely on static catalog. |
| Phase 3 – Knowledge Systems & Hardening | Hugo docs, Discourse forum, CI/secrets/monitoring (Milestones B7–B9) | ⚪ Not Started | Scaffolds live under `platform/docs-site/` and `platform/forum/`; awaiting kickoff once Phase 2 is underway. |

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

### Phase 1 – Bootstrap & Validation
- [ ] Provision Hetzner VM (or confirm access), harden the host, and install Node/pm2 per `docs/IMPLEMENTATION_GUIDE.md`.
- [ ] Bring up `services/medusa/docker-compose.yml` on Hetzner and run the first Bed Presence Sensor import.
- [ ] Configure Cloudflare Tunnel or firewall rules so `MEDUSA_BASE_URL` points at Hetzner for dev/staging.
- [ ] Land the first Playwright checkout test that targets the Hetzner Medusa instance (B3 exit criteria).

### Phase 2 – Catalog & Storefront Integration
- [ ] Validate `scripts/import-products.ts` against Hetzner and document quirks before importing the full catalog.
- [ ] Flip `MEDUSA_ENABLED` in dev/staging once products exist, removing fallback catalog reads per `docs/MIGRATION_PLAN.md`.
- [ ] Replace `/api/stripe/*` routes with Medusa payment sessions and archive `src/lib/products.ts` when parity is confirmed.
- [ ] Add CI coverage for Medusa lint/build + storefront integration tests.

### Phase 3 – Knowledge Systems & Hardening
- [ ] Wire `platform/docs-site/` into a Hugo build + deploy pipeline, mirroring `/docs`.
- [ ] Finish the Discourse docker-compose + theme polish, then document SMTP/SSO assumptions in `/config/forum.env`.
- [ ] Extend `/config/` templates + CI/CD scripts to cover Hetzner secrets, docs deploy, and uptime/monitoring (B9).

## Risks & Blockers

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Hetzner provisioning not completed | Storefront cannot exercise Medusa carts/endpoints | Finalize tunnel + SSH access, document deployment steps. |
| Stripe keys still stored in storefront env | Security & compliance exposure | Move secrets into Medusa `.env` once backend is online; storefront should only load publishable key. |
| Long Next.js build time in Codespaces | Frequent timeout during `pnpm run build` | Continue running with higher timeout (≥240 s) or pre-build caches. |

## Action Items

1. **Owner: Platform Eng** – Finish Hetzner setup, share tunnel hostname + access instructions.  
2. **Owner: Commerce Services** – Deploy Medusa service via pm2/docker, load catalog, implement carts/payment session endpoints.  
3. **Owner: Storefront** – Flip `MEDUSA_ENABLED` once backend is stable; add tests covering Medusa failure fallback.  
4. **Owner: Knowledge Systems** – Kick off docs/forum work once Phase 2 is underway, report weekly status back into this scorecard.  

_Update cadence: weekly until the three migration phases ship._
