# OpticWorks Sensing Website Architecture

## Overview

The optic.works site is the public entry point for the OpticWorks Sensing platform. It communicates the hardware, software, and deployment workflow for the bed presence sensor and links to documentation housed within this monorepo. The site runs on Next.js 15 with the App Router and is deployed to Cloudflare Pages.

Key goals:

- Present a transparent view of the sensing stack from device to automation
- Guide builders through setup, calibration, and deployment of the bed presence sensor
- Document the integration pattern for the Cloudflare Worker BFF and Hetzner backend

## Page-Level Architecture

| Route | Purpose | Key Content |
|-------|---------|-------------|
| `/` | Landing page | Hero, problem/solution breakdown, technology stack, feature pillars, workflow overview, CTA |
| `/how-it-works` | Technical deep dive | System overview, state machine, workflow timelines, latency metrics |
| `/features` | Platform capabilities | Pillar cards, hardware & software stacks, reliability/privacy/transparency breakdown |
| `/getting-started` | Onboarding | Phased setup checklist, calibration guidance, resource links |
| `/documentation` | Docs hub | Quick links into repo docs, API references, troubleshooting |
| `/comparison` | Competitive analysis | Table comparing OpticWorks to pressure mats, PIR sensors, other mmWave, and camera solutions |
| `/community` | Community + OSS | Contribution paths, community resources, code of conduct |
| `/about` | Company context | Philosophy, roadmap, team, contributor call-to-action |

All pages share the same layout (navigation + footer) defined in `src/app/layout.tsx` with a scroll-aware `MenuBar` and gradient footer.

## Component Strategy

- **Shared content module**: `src/lib/marketingContent.ts` exports data structures (feature highlights, technology layers, workflow steps, comparison rows) consumed across routes.
- **Home sections**: Components in `src/components/home/` provide reusable hero, problem/solution, technology, insight, workflow, and CTA sections.
- **Navigation**: `src/components/menu-bar.tsx` renders the top-level nav, using Framer Motion for subtle motion and referencing `siteConfig` for URLs.
- **Page headers**: `src/components/shared/PageHeader.tsx` standardises hero/eyebrow treatments across detail pages.

## Deployment Workflows

The monorepo captures the deployment story for both the marketing site and the supporting services:

1. **Frontend**: Built with `pnpm run build` and deployed to Cloudflare Pages.
2. **BFF (Cloudflare Worker)**: Scripts in the repo deploy the Worker that proxies configuration, telemetry, and OTA firmware updates between devices and the Hetzner backend.
3. **Backend (Hetzner)**: Provisioning scripts install PostgreSQL, MQTT, Grafana, and Prometheus on a single Hetzner node; Workers Durable Objects and KV maintain per-device context.

## Key Workflows

### Presence Decision Pipeline

1. **Sense** – LD2410 mmWave radar feeds still/motion energy at 40Hz into the ESP32.
2. **Normalize** – Firmware establishes a rolling baseline using Z-score and MAD analytics to absorb drift.
3. **Decide** – Four-state engine (IDLE → DEBOUNCING_ON → PRESENT → DEBOUNCING_OFF) enforces independent debounce timers and an absolute clear delay.
4. **Act** – Decisions stream through the Cloudflare Worker BFF to Home Assistant (webhooks/WebSocket), MQTT topics, and the Hetzner database for logging.

### Deployment Flow

1. **Hardware assembly** – Mount sensor, wire LD2410 to ESP32, confirm telemetry via ESPHome.
2. **Software setup** – Flash firmware, deploy Worker (`pnpm run deploy:worker`), provision Hetzner backend (`pnpm run deploy:hetzner`).
3. **Calibration** – Capture empty-bed baseline, apply preset, validate with the decision inspector.
4. **Automation** – Enable the Home Assistant blueprint or REST/MQTT integrations for downstream routines.

## Integration Touchpoints

- **Navigation** (`siteConfig.baseLinks`) drives both the MenuBar and Footer link groups.
- **Docs**: Marketing pages deep-link into markdown files within `docs/` and the published OpenAPI spec (`/openapi.json`).
- **External links**: `siteConfig.external` consolidates social links for navigation and footer usage.

## Future Enhancements

- Surface live telemetry snippets from the Hetzner backend via Edge runtime fetches.
- Introduce customer case studies and testimonials sourced from community submissions.
- Extend the documentation hub with interactive API explorers.
- Automate deployment status badges within the footer once CI/CD workflows are finalised.
