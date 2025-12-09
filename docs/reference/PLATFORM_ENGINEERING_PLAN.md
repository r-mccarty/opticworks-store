# Platform Engineering Plan

**Status**: Planning
**Target**: Reliable, automated infrastructure with minimal manual intervention

---

## Overview

This plan consolidates platform-level improvements focused on automation, observability, and developer experience. It extends Track 6 (CI/CD Hardening + Monitoring) from the Phase 4 plan with deeper platform engineering initiatives.

---

## Quick Status

| Track | Status | Description |
|-------|--------|-------------|
| 1 | **Pending** | Automated Backend Deployment (GitHub Actions + Ansible) |
| 2 | Pending | Staging Environment (workers.dev + separate Medusa instance) |
| 3 | Pending | Observability Stack (Sentry, alerting, dashboards) |
| 4 | Pending | Infrastructure as Code (Terraform for Hetzner) |
| 5 | Pending | Log Aggregation + Retention |

---

## Track 1: Automated Backend Deployment

**Goal**: Automatically deploy Medusa backend when changes are pushed to `main` that affect `backend/`.

**Current State**:
- Storefront: Auto-deploys via Cloudflare Workers on push to `main`
- Backend: Manual `ansible-playbook` from Codespace

**Target State**:
- Backend auto-deploys via GitHub Actions when `backend/` files change
- Manual deployment still available for emergency rollbacks

### Architecture

```
Push to main
     │
     ├─── backend/** changed?
     │         │
     │         ▼
     │    GitHub Actions
     │         │
     │         ├── SSH to hetzner-node
     │         │
     │         ▼
     │    Run Ansible playbook
     │         │
     │         ▼
     │    Verify health check
     │
     └─── storefront changed?
               │
               ▼
          Cloudflare Workers Build
          (already automated)
```

### Implementation

**GitHub Actions Workflow** (`.github/workflows/backend-deploy.yml`):

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'
      - 'infrastructure/ansible/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production

    steps:
      - uses: actions/checkout@v4

      - name: Install Ansible
        run: |
          sudo apt-get update
          sudo apt-get install -y ansible

      - name: Setup SSH key
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.HETZNER_SSH_KEY }}" > ~/.ssh/hetzner_key
          chmod 600 ~/.ssh/hetzner_key
          cat >> ~/.ssh/config << EOF
          Host hetzner-node
            HostName ${{ secrets.HETZNER_HOST }}
            User ryan
            IdentityFile ~/.ssh/hetzner_key
            StrictHostKeyChecking no
          EOF

      - name: Generate secrets from Infisical
        run: |
          cd infrastructure/ansible
          curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
          sudo apt-get install -y infisical
          bash scripts/generate-secrets-from-infisical.sh
        env:
          INFISICAL_SERVICE_TOKEN: ${{ secrets.INFISICAL_SERVICE_TOKEN }}

      - name: Run Ansible deployment
        run: |
          cd infrastructure/ansible
          ansible-playbook -i inventory/production.ini playbooks/medusa-deploy.yml

      - name: Verify deployment
        run: |
          sleep 10
          curl -f https://api.optic.works/health || exit 1

      - name: Notify on failure
        if: failure()
        run: |
          echo "Deployment failed - manual intervention required"
          # TODO: Add Slack/email notification
```

### Required Secrets

Add to GitHub repository secrets (Settings → Secrets and variables → Actions):

| Secret | Description | Source |
|--------|-------------|--------|
| `HETZNER_SSH_KEY` | Private SSH key for hetzner-node | `~/.ssh/hetzner_key` in Codespace |
| `HETZNER_HOST` | Hetzner server IP address | Hetzner Cloud dashboard |
| `INFISICAL_SERVICE_TOKEN` | Infisical service token | Infisical dashboard |

### Tasks

- [ ] Create `.github/workflows/backend-deploy.yml`
- [ ] Add `HETZNER_SSH_KEY` to GitHub secrets
- [ ] Add `HETZNER_HOST` to GitHub secrets
- [ ] Add `INFISICAL_SERVICE_TOKEN` to GitHub secrets
- [ ] Test workflow with a backend change
- [ ] Add deployment notification (Slack/email)
- [ ] Document rollback procedure

### Rollback Procedure

If automated deployment fails:

```bash
# Manual rollback from Codespace
cd infrastructure/ansible

# 1. Check what went wrong
ssh hetzner-node "pm2 logs medusa-prod --lines 50"
ssh hetzner-node "tail -50 /opt/opticworks/medusa-backend/logs/medusa-app.log"

# 2. Revert to previous commit
git revert HEAD
git push

# 3. Or manually deploy specific commit
git checkout <commit>
ansible-playbook -i inventory/production.ini playbooks/medusa-deploy.yml
```

---

## Track 2: Staging Environment

**Goal**: Preview backend changes before production deployment.

### Architecture

```
Feature Branch
     │
     ▼
GitHub Actions (staging deploy)
     │
     ├── Deploy to staging.api.optic.works
     │
     ▼
Preview + test
     │
     ▼
Merge to main → Production deploy
```

### Components

| Component | Production | Staging |
|-----------|------------|---------|
| Backend URL | api.optic.works | staging.api.optic.works |
| Database | medusa_db | medusa_staging_db |
| Storefront | optic.works | staging.optic.works (workers.dev) |

### Tasks

- [ ] Create staging PostgreSQL database on Hetzner
- [ ] Create staging Cloudflare Tunnel
- [ ] Create staging Ansible inventory
- [ ] Set up GitHub Actions for staging deploys (on PR)
- [ ] Configure workers.dev staging subdomain
- [ ] Document staging workflow

---

## Track 3: Observability Stack

**Goal**: Proactive monitoring with error tracking and alerting.

### Components

| Layer | Tool | Purpose |
|-------|------|---------|
| Errors | Sentry | Frontend + backend error tracking |
| Uptime | Cloudflare Health Checks | Availability monitoring |
| Logs | Medusa LOG_FILE + logrotate | Application logging |
| Metrics | Cloudflare Workers Analytics | Request metrics |
| Alerts | Sentry + Cloudflare Notifications | Incident notification |

### Tasks

- [ ] Set up Sentry project for opticworks-store
- [ ] Add `@sentry/nextjs` to storefront
- [ ] Configure Sentry in Medusa backend
- [ ] Set up Cloudflare Health Checks for api.optic.works
- [ ] Configure alerting (Slack/email) for:
  - Health check failures
  - Error rate spikes
  - Rate limit triggers
- [ ] Create incident runbooks

---

## Track 4: Infrastructure as Code (Terraform)

**Goal**: Reproducible Hetzner infrastructure provisioning.

**Reference**: RFD-010-infrastructure-and-testing.md

### Scope

| Resource | Current | Target |
|----------|---------|--------|
| Hetzner VPS | Manual via console | Terraform |
| Cloudflare DNS | Manual + API scripts | Terraform |
| Cloudflare Tunnels | Ansible | Terraform + Ansible |
| R2 Buckets | Manual | Terraform |

### Tasks

- [ ] Create `infrastructure/terraform/` directory
- [ ] Define Hetzner VPS resource
- [ ] Define Cloudflare DNS records
- [ ] Define R2 buckets
- [ ] Import existing resources
- [ ] Document Terraform workflow
- [ ] Integrate with GitHub Actions

---

## Track 5: Log Aggregation + Retention

**Goal**: Centralized, searchable logs with appropriate retention.

### Current State

| Log | Location | Retention |
|-----|----------|-----------|
| Medusa app | `/opt/opticworks/medusa-backend/logs/medusa-app.log` | Unbounded |
| PM2 wrapper | `/opt/opticworks/medusa-backend/logs/pm2-*.log` | Unbounded |
| System | journald | 1 week |

### Target State

- Logs rotated daily, retained 30 days
- Optionally shipped to cloud logging (Grafana Cloud, Datadog, etc.)

### Tasks

- [ ] Configure logrotate for Medusa logs
- [ ] Set up log rotation for PM2 logs
- [ ] Evaluate cloud logging options (cost vs. benefit)
- [ ] Document log access procedures

### Logrotate Configuration

```bash
# /etc/logrotate.d/medusa
/opt/opticworks/medusa-backend/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 ryan ryan
    postrotate
        pm2 reloadLogs
    endscript
}
```

---

## Success Criteria

### Track 1: Automated Backend Deployment
- [ ] Backend deploys automatically on push to `main`
- [ ] Health check verification after deploy
- [ ] Rollback procedure documented and tested

### Track 2: Staging Environment
- [ ] staging.api.optic.works accessible
- [ ] PR previews working
- [ ] Data isolation from production

### Track 3: Observability
- [ ] Sentry capturing errors
- [ ] Health check alerts configured
- [ ] <5 min incident detection time

### Track 4: IaC
- [ ] All infrastructure defined in Terraform
- [ ] Can recreate from scratch with `terraform apply`

### Track 5: Logging
- [ ] Logs rotated, 30-day retention
- [ ] Easy access for debugging

---

## Priority Order

1. **Track 1** (Automated Backend Deployment) - Highest impact, enables faster iteration
2. **Track 3** (Observability) - Critical for production reliability
3. **Track 5** (Log Retention) - Prevents disk space issues
4. **Track 2** (Staging) - Reduces production risk
5. **Track 4** (Terraform) - Long-term maintainability

---

## Related Documentation

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Current deployment procedures
- [PHASE4_PLAN.md](./PHASE4_PLAN.md) - Track 6 (CI/CD Hardening)
- [RFD-010-infrastructure-and-testing.md](./RFD-010-infrastructure-and-testing.md) - Infrastructure decisions
- [Postmortem: PM2 Logging](../postmortems/2025-12-09-shipping-rates-nan.md) - LOG_FILE solution
