# API Architecture – Worker BFF & Hetzner Services

## Overview

The OpticWorks sensing platform splits responsibility between a Cloudflare Worker backend-for-frontend (BFF) and a single Hetzner node that hosts stateful services. This document explains how the public marketing site interacts with the Worker, and how the Worker communicates with the backend services.

## BFF Responsibilities

The Worker exposes authenticated APIs that front the Hetzner services. Key surfaces include:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/telemetry` | `POST` | Ingest telemetry from devices, persist to PostgreSQL, and fan out to MQTT |
| `/api/configuration` | `GET/PUT` | Fetch or update device configuration snapshots |
| `/api/ota` | `POST` | Upload new firmware bundles and schedule OTA rollouts |
| `/api/health` | `GET` | Expose system health for marketing-site status badges |

The Worker stores per-device session data in Durable Objects and mirrors long-term state to Workers KV for quick lookups.

## Hetzner Services

The Worker communicates with the following services on the Hetzner node:

- **PostgreSQL** – Configuration snapshots, telemetry history, audit logs
- **MQTT (Mosquitto)** – Command/control plane between Worker and devices
- **Prometheus/Grafana** – Metrics and dashboards; Worker pushes metrics via remote_write
- **Loki (optional)** – Structured logs from Worker webhooks

## Marketing Site Integration

The marketing site is static and does not expose serverless API routes. Instead it:

- Links directly to documentation (`/docs/*.md`) and the published OpenAPI spec (`/openapi.json`)
- Encourages developers to self-host using the deployment scripts
- Surfaces API capabilities through copy and diagrams on `/how-it-works` and `/documentation`

## BFF Implementation Notes

- Worker code lives in `workers/` within the monorepo (see deployment scripts).
- Secrets such as MQTT credentials and Hetzner API tokens are stored via `wrangler secret put`.
- Durable Objects maintain per-device state, including last heartbeat and firmware version.
- Worker functions can be exercised locally using `pnpm run dev:worker`.

## Future Enhancements

- Publish a dedicated API explorer in the documentation section.
- Add streaming SSE/WebSocket endpoints for live telemetry previews.
- Provide signed URLs for OTA bundles stored in R2.
