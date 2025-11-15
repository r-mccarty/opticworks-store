# Hybrid Deployment Architecture: Talos k3s on Hetzner + Cloudflare Workers

## Overview
This document captures the recommended approach for running stateful services on a Talos-managed k3s cluster in Hetzner while serving the Next.js storefront from Cloudflare Workers using the OpenNext adapter.

## Platform Split
- **Cloudflare Workers** hosts the stateless Next.js application via OpenNext, keeping the web tier close to end users.
- **Hetzner Cloud (HIL)** runs a six-node k3s cluster dedicated to stateful workloads and internal services.

## Hetzner Cluster Topology
- **Nodes**: Six shared vCPU instances split into:
  - Three-node, tainted control plane.
  - Three-node worker pool for workloads.
- **Placement**: Separate placement groups for control-plane and worker nodes to maximize failure domain separation.
- **Operating System**: Talos OS (preferred for immutable, API-driven ops). SUSE MicroOS is an alternative if SSH access is required.

### Bootstrap Steps
1. Provision Hetzner VLANs and IPv6 networking (IPv4 disabled).
2. Create three Talos control-plane nodes, bootstrap k3s with `talosctl`.
3. Join three worker nodes with taints/tolerations to keep stateful workloads off the control plane.
4. Install:
   - **Cilium** for IPv6 eBPF networking and NetworkPolicies.
   - **Hetzner Cloud Controller Manager** for load balancers.
   - **Hetzner CSI driver** for persistent volumes.

## Stateful Workloads
| Service | Deployment Pattern | Notes |
| --- | --- | --- |
| **Postgres (Patroni)** | StatefulSet, 3 replicas | Use Hetzner CSI NVMe volumes. Attach `wal-g` sidecars to stream WAL to Backblaze B2. Expose via Patroni-managed VIP + headless Service. |
| **NATS JetStream** | StatefulSet, 3 replicas | Configure anti-affinity, persistent volumes, and JetStream clustering with replication factor 3. |
| **Redis for Medusa** | StatefulSet, 3 replicas | Enable Redis Sentinel/Cluster. Schedule RDB snapshots to B2 or Hetzner storage boxes. |
| **Medusa V2 backend** | Deployment | Stateless pods consuming Postgres/NATS/Redis. Autoscale with KEDA on JetStream/Redis metrics. |

## Storage & Backups
- **Block Storage**: Hetzner CSI volumes sized at 2× working set per replica.
- **Snapshots**: CSI VolumeSnapshot classes with scheduled snapshots replicated to B2.
- **Continuous Archiving**: `wal-g`/`pgbackrest` for Postgres; CronJobs for Redis dumps; JetStream backup scripts.
- **Restore Procedures**: Document Talos-based node recovery and periodic restore drills in staging.

## Networking & Security
- **Ingress**: Ingress-NGINX or Traefik with Let’s Encrypt (DNS challenge via Cloudflare API).
- **Network Policies**: Enforce with Cilium to isolate databases and internal services.
- **Secrets Management**: Leverage Talos + SOPS/age, or deploy External Secrets with Vault/1Password.
- **Service Mesh (Optional)**: Linkerd/Istio for mTLS and traffic shaping between services.

## IPv6-Only, No-SSH Operations
- Provision Hetzner instances without IPv4; each receives a /64 IPv6 range.
- Talos omits SSH entirely; manage nodes via `talosctl` over a private management network or WireGuard tunnel.
- Expose the Talos API only internally; drop public traffic using Talos firewall rules.
- Use Cloudflare Tunnel (`cloudflared` DaemonSet) for secure ingress/egress so no public ports are opened.

## Observability & Operations
- Deploy kube-prometheus-stack for metrics and alerts.
- Centralize logs with Loki + Promtail or Vector, stored in B2/S3-compatible object storage.
- Configure Alertmanager routing for operational channels and define SLOs (e.g., query latency, queue lag).
- Use Talos machine configuration changes for rolling upgrades; honor PodDisruptionBudgets when draining nodes.

## GitOps Workflow
- Store Talos machine configs and Kubernetes manifests in Git.
- Reconcile cluster state with FluxCD or Argo CD over IPv6-only networking.
- Build and deploy Cloudflare Workers via `wrangler`, passing secrets sourced from the same GitOps pipeline.

## Disaster Recovery & Testing
- Schedule quarterly restore tests for Postgres and Redis into a staging namespace.
- Simulate node loss to validate JetStream replication and Talos auto-recovery.
- Maintain runbooks for Talos node replacement and data service restores.

## Integration Summary
This hybrid design keeps the storefront globally distributed on Cloudflare Workers while anchoring critical stateful services in a resilient, API-managed Talos k3s cluster on Hetzner—without exposing IPv4 or SSH attack surfaces.
