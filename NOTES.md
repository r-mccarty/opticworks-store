# Project Notes & Tasks

## Recent Updates

- ✅ Completed pivot of optic.works marketing site to the OpticWorks Sensing platform
- ✅ Removed legacy tinting store, support, and checkout flows
- ✅ Added new navigation, footer, and content for How It Works, Features, Getting Started, Documentation, Comparison, Community, and About
- ✅ Centralised marketing copy in `src/lib/marketingContent.ts`
- ✅ Refreshed README and docs references to align with the smart home sensing focus

## Next Sprint Candidates

- [ ] Build dynamic content sourced from the Hetzner backend (telemetry snapshots, deployment status)
- [ ] Add case studies for multi-bed deployments
- [ ] Instrument analytics for CTA performance post-rebrand
- [ ] Expand documentation section with live API examples and schema diagrams

## Architecture Snapshot

- Frontend: Next.js 15 + React 19 + Tailwind 4
- Deployment: Cloudflare Pages for the site, Worker BFF orchestrating telemetry, Hetzner node running MQTT/Postgres/Grafana
- Content strategy: Static marketing copy with shared data module powering multiple routes

## Outstanding Questions

- Should we expose live device health metrics on the marketing site via Edge runtime?
- How should we package the Worker + Hetzner provisioning scripts for self-hosted users (single CLI vs. separate commands)?

## References

- `docs/getting-started-guide.md`
- `docs/INFRASTRUCTURE_HETZNER_CF.md`
- `docs/website-sitemap.md`
