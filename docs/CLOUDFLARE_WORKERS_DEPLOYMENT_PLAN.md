# Cloudflare Workers Deployment Plan

## Overview

This plan describes how to deploy the OpticWorks Worker backend-for-frontend (BFF). The Worker brokers requests between the marketing site, Home Assistant devices, and the Hetzner backend. We target the Workers runtime with the `nodejs_compat` flag to support MQTT, crypto, and streaming APIs.

## Why Workers

- Keep the API edge-close to end users while delegating stateful work to Hetzner
- Terminate device connections (REST/WebSocket/MQTT) without exposing the Hetzner node
- Persist per-device context in Durable Objects and low-latency metadata in Workers KV

## Prerequisites

- Cloudflare account with Workers, KV, Durable Objects, and R2 (optional for OTA bundles)
- `wrangler` CLI installed locally
- Secrets provisioned:
  - `HETZNER_API_URL`
  - `HETZNER_API_TOKEN`
  - `MQTT_USERNAME` / `MQTT_PASSWORD`
  - `POSTGRES_URL`
  - `R2_BUCKET` (optional)

## Build & Deployment Steps

1. **Install dependencies**
   ```bash
   pnpm install
   pnpm add -D @cloudflare/workers-types
   ```
2. **Configure wrangler** (`wrangler.toml`)
   ```toml
   name = "opticworks-bff"
   main = "dist/worker.js"
   compatibility_date = "2025-01-01"
   compatibility_flags = ["nodejs_compat"]

   [durable_objects]
   bindings = [{ name = "DEVICE_STATE", class_name = "DeviceState" }]

   [[kv_namespaces]]
   binding = "CONFIG_CACHE"
   id = "<kv-namespace-id>"
   ```
3. **Build Worker**
   ```bash
   pnpm run build:worker
   ```
4. **Publish**
   ```bash
   pnpm run deploy:worker
   ```

## Runtime Responsibilities

- Accept telemetry payloads from devices and forward to the Hetzner MQTT broker
- Serve REST endpoints for configuration snapshots and OTA manifests
- Stream presence decisions to Home Assistant via WebSocket/Webhook integrations
- Expose `/api/health` for marketing-site status badges

## Local Development

Use `pnpm run dev:worker` to spin up the Worker with Miniflare. Provide `.dev.vars` containing stub secrets and run against the Hetzner staging node or local Docker containers.

## Observability

- Emit structured logs to Loki via HTTP push endpoint
- Expose Prometheus metrics via `/metrics`
- Forward error traces to Cloudflare Logpush for long-term retention

## Release Strategy

- Stage changes in a preview Worker bound to a staging Hetzner node
- Run smoke tests (telemetry ingest, configuration update, OTA manifest fetch)
- Promote to production Worker using `wrangler deploy --env production`

## Future Work

- Automate Worker deployments via GitHub Actions
- Add background cron triggers for OTA rollout reminders
- Integrate with Cloudflare Queues for high-volume telemetry buffering
