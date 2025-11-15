# Development Scorecard

**Last updated:** 2025-11-15  
**Maintainers:** Platform Engineering

## Current Snapshot

| Track | Scope | Status | Notes |
| --- | --- | --- | --- |
| T1 – Storefront Hardening | Stripe checkout refactor, env gating, service-layer prep | 🟢 Completed for MVP | Custom Checkout flow live, new Stripe types added, `lib/api/medusa.ts` wiring verified. |
| T2 – MedusaJS Backend | Medusa service bootstrap, catalog import, checkout API | 🟡 In Progress | Workspace scaffolding done with `medusa-config.ts`, env template, docs. Awaiting Hetzner deployment + Stripe keys. |
| T3 – Hugo/Geekdoc Docs | Docs site synced from `/docs` | ⚪ Not Started | Workspace scaffold exists under `platform/docs-site/`, but no content sync/build scripts yet. |
| T4 – Discourse Forum | Community forum + theming | ⚪ Not Started | Docker scaffold lives at `platform/forum/`, no env wiring yet. |
| T5 – Platform Ops | Secrets, CI, health checks | 🟡 In Progress | Env cleanup guide exists; need remote env templates + CI integration for Medusa/docs. |

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

### Track T2 – MedusaJS Backend
- [ ] Provision Hetzner VM, apply Ubuntu hardening, and install Node/pm2 (per `docs/ubuntu-node-setup.md` workflow).
- [ ] Configure Cloudflare Tunnel to expose the Medusa service (`MEDUSA_BASE_URL`) for dev/staging.
- [ ] Seed catalog on Hetzner using `pnpm --filter @opticworks/medusa-service catalog:import`.
- [ ] Move Stripe secret/publishable keys to the Medusa env; storefront only needs publishable key via API.
- [ ] Build deployment scripts (pm2 profile or container) so `pnpm deploy:medusa` can target Hetzner.

### Track T3 – Hugo/Geekdoc Docs
- [ ] Sync `/docs` content into `platform/docs-site/`.  
- [ ] Wire `pnpm docs:dev` / `pnpm docs:build` into CI.  
- [ ] Publish preview (Cloudflare Pages or Vercel static export).  

### Track T4 – Discourse Forum
- [ ] Finalize docker-compose + theme install.  
- [ ] Configure SMTP + SSO placeholders.  
- [ ] Create seed content + moderation runbook.  

### Track T5 – Platform Ops
- [ ] Add `/config/medusa.env` template once Hetzner env settled.  
- [ ] Extend CI to run Medusa lint/build + docs build alongside storefront checks.  
- [ ] Document monitoring/rollback for Hetzner service.  

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
4. **Owner: Knowledge Systems** – Kick off docs/forum tracks per migration plan, report weekly status back into this scorecard.  

_Update cadence: weekly until all migration tracks (T2–T5) ship._
