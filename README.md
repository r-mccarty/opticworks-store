# OpticWorks Sensing Platform

OpticWorks is now a smart home sensing company focused on reliable, privacy-first presence detection. This monorepo contains the marketing site, documentation, and deployment tooling for the bed presence sensor platform.

The frontend is a Next.js 15 application styled with Tailwind CSS and powered by React 19. The repo also includes deployment scripts for the Cloudflare Worker backend-for-frontend (BFF) and the Hetzner-hosted infrastructure that stores telemetry, configuration, and observability data.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [pnpm](https://pnpm.io/) (package manager used across the monorepo)

### Installation

```bash
pnpm install
```

### Local Development

```bash
pnpm run dev
```

Visit `http://localhost:3000` to explore the marketing site.

### Quality Checks

Run linting and a production build before committing:

```bash
pnpm run lint
pnpm run build
```

## Repository Structure

- `src/app` – Next.js App Router pages (marketing site, documentation hubs, comparison content)
- `src/components` – Reusable UI, home page sections, and shared layout helpers
- `src/lib` – Structured marketing content and utilities used across the site
- `docs/` – Platform documentation including architecture, deployment, and onboarding guides
- `aws/`, `cors.json`, `openapi.json` – Deployment assets for the Worker BFF and Hetzner backend

## Platform Overview

- **Device**: ESP32 + LD2410 mmWave radar with OTA firmware delivered via ESPHome
- **BFF**: Cloudflare Worker proxying configuration and telemetry between devices and Hetzner
- **Backend**: Single Hetzner node with PostgreSQL, MQTT, Grafana, and Prometheus
- **Integrations**: Native Home Assistant blueprint, REST + WebSocket APIs, and MQTT topics

## Documentation

Key documents live in the `docs/` directory:

- `getting-started-guide.md` – Complete build and calibration walkthrough
- `INFRASTRUCTURE_HETZNER_CF.md` – Deployment instructions for the Worker and Hetzner stack
- `CLOUDFLARE_WORKERS_DEPLOYMENT_PLAN.md` – Details on the BFF architecture and rollout plan
- `website-sitemap.md` – Updated information architecture for the sensing-focused site

## Deployment

The monorepo includes scripts to ship the frontend to Cloudflare Pages, deploy the Worker BFF, and provision the Hetzner backend. Follow the runbooks in `docs/` for end-to-end automation.

## License

Released under the Apache 2.0 license.
