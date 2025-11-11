# Cloudflare + Hetzner Deployment Blueprint

## Overview

The OpticWorks sensing platform runs as a hybrid between a globally distributed frontend and a single, self-managed backend node. Cloudflare provides global reach for the marketing site and Worker BFF, while Hetzner hosts the stateful services that power telemetry, configuration, and observability.

This document captures the reference implementation with Talos and k3s intentionally deferred. The current deployment relies on a single Hetzner server with Docker Compose to keep operations lightweight.

## Platform Split

- **Cloudflare Pages** – Hosts the static Next.js marketing site (`pnpm run build` + `pnpm run deploy:pages`).
- **Cloudflare Workers (BFF)** – Acts as the backend-for-frontend, proxying device telemetry, configuration updates, and OTA bundles.
- **Hetzner Cloud server** – Runs MQTT, PostgreSQL, Grafana, and supporting services on a single instance.

## Hetzner Node Specification

- **Instance**: CPX31 (4 vCPU, 8 GB RAM, 160 GB SSD)
- **Operating system**: Ubuntu 22.04 LTS
- **Networking**: Public IPv4 + IPv6; WireGuard tunnel to Cloudflare Worker for secure traffic
- **Provisioning**: Automated via `pnpm run deploy:hetzner` which installs Docker, docker-compose, and required services

### Services

| Service | Purpose | Notes |
| ------- | ------- | ----- |
| PostgreSQL | Store configuration snapshots, telemetry, and audit logs | Daily `pg_dump` snapshots pushed to Backblaze B2 |
| MQTT (Mosquitto) | Bidirectional messaging between Worker and devices | Enforce TLS and client certificates |
| Grafana + Prometheus | Observability dashboards and metrics collection | Ships with default dashboards for presence decision latency |
| Loki (optional) | Structured logs from Worker webhooks and device telemetry | Enabled via `.env` flag |

## Deployment Workflow

1. **Provision Hetzner server**
   - Create the instance via console or API.
   - Add SSH key and note the public IP.
2. **Bootstrap backend**
   - Run `pnpm run deploy:hetzner` from the monorepo.
   - Script installs Docker, applies security hardening (UFW, fail2ban), and launches the docker-compose stack.
3. **Configure Cloudflare Worker**
   - Populate secrets (`HETZNER_API_URL`, `MQTT_USERNAME`, etc.).
   - Deploy with `pnpm run deploy:worker`.
4. **Link Worker to backend**
   - Worker uses fetch/WebSocket/MQTT clients to communicate with the Hetzner node over WireGuard.
   - Durable Objects maintain per-device state and access tokens.
5. **Deploy marketing site**
   - `pnpm run build` + `pnpm run deploy:pages` to push to Cloudflare Pages.

## Operational Considerations

- **Backups** – `pg_dump` and Prometheus snapshots stored in Backblaze B2; daily cron handles rotation.
- **Monitoring** – Prometheus scrapes MQTT broker, Worker metrics endpoint, and system stats via node exporter.
- **Security** – WireGuard between Worker and Hetzner, UFW restricting public ports to HTTPS/SSH. Fail2ban monitors SSH.
- **Scaling** – When demand increases, migrate services to k3s/Talos using the future plan (see `migration-plan.md`).

## Future Enhancements

- Automate Hetzner provisioning with Terraform once multi-node support is required.
- Introduce read replicas for PostgreSQL and split telemetry storage from configuration data.
- Evaluate Workers Durable Objects storage for lightweight telemetry history to reduce backend load.

## Reference Scripts

- `pnpm run deploy:hetzner` – Bootstraps the Hetzner node
- `pnpm run deploy:worker` – Deploys the Cloudflare Worker BFF
- `pnpm run deploy:pages` – Publishes the marketing site to Cloudflare Pages
