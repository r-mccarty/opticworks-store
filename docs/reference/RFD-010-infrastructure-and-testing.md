# RFD-010: Infrastructure Drift Mitigation & E2E Email Testing

**Status**: Draft
**Created**: 2025-12-02
**Author**: Claude (AI Assistant)

---

## Summary

This document addresses two operational challenges:
1. **Infrastructure drift** - Ansible-managed servers accumulate state differences over time
2. **Email testing** - Need to validate Resend email delivery end-to-end

---

## Part 1: Infrastructure Drift Problem

### Current State

We use Ansible playbooks to provision and deploy Medusa backend to a Hetzner VPS:

```
infrastructure/ansible/
├── playbooks/
│   ├── medusa-provision.yml   # Full server setup
│   └── medusa-deploy.yml      # Code-only deployments
├── roles/medusa/              # Configuration templates
└── group_vars/                # Variables and secrets
```

### Observed Drift Issues

Recent deployment failures trace to drift between expected and actual server state:

| Issue | Root Cause | Impact |
|-------|-----------|--------|
| Git clone fails | Directory exists but not as git repo | Deploy blocked |
| rsync deletes critical dirs | `delete=yes` removes untracked files | Admin UI lost |
| DATABASE_URL encoding | Manual fixes not captured in templates | Connection failures |
| Public symlink missing | Created manually, not in playbook | 404 on admin routes |

The fundamental problem: **Ansible modifies systems in place**. Each playbook run assumes a starting state that may not match reality after manual debugging sessions or partial failures.

### Why Ansible Struggles

1. **Imperative mutations** - Changes files/packages on existing system
2. **No atomic rollback** - Failed runs leave undefined state
3. **State blindness** - Doesn't detect manual changes outside playbook scope
4. **Idempotency limits** - Many modules aren't truly idempotent (git clone, rsync)

---

## Part 2: Proposed Solutions

### Option A: Terraform + Immutable Deployments (Recommended)

Replace in-place updates with immutable infrastructure:

```
┌─────────────────────────────────────────────────────────────┐
│                    CI/CD Pipeline                            │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │  Build   │───▶│  Image   │───▶│  Deploy  │              │
│  │  Medusa  │    │  Upload  │    │  (swap)  │              │
│  └──────────┘    └──────────┘    └──────────┘              │
└─────────────────────────────────────────────────────────────┘
```

**Components:**

1. **[Hetzner Terraform Provider](https://registry.terraform.io/providers/hetznercloud/hcloud/latest/docs)** - Manage servers, networks, firewalls declaratively
2. **Packer or Docker** - Build immutable server images
3. **Blue-green deployment** - Spin up new server, swap DNS/load balancer, destroy old

**Advantages:**
- Complete rebuild eliminates drift
- Instant rollback (keep previous server image)
- Infrastructure as code, reviewable in PRs
- Hetzner API fully supported

**Disadvantages:**
- Migration effort from Ansible
- Slightly higher cost during deployments (2 servers briefly)
- Database migration requires careful handling

**Implementation Path:**

```bash
# Phase 1: Terraform for infrastructure
terraform/
├── main.tf           # Hetzner server, network, firewall
├── variables.tf      # Configurable values
├── outputs.tf        # Server IP, etc.
└── backend.tf        # State storage (S3 or Terraform Cloud)

# Phase 2: Immutable deployments
.github/workflows/
└── deploy.yml        # Build image → Upload → Create server → Swap → Destroy old
```

### Option B: NixOS (Maximum Reproducibility)

Replace Ubuntu with NixOS for fully declarative system configuration.

**How NixOS Differs:**
- Entire OS configuration in a single file (`configuration.nix`)
- Changes create new "generations" - old state remains
- Instant rollback: `nixos-rebuild switch --rollback`
- No drift possible - system rebuilds from declaration

**Example Configuration:**
```nix
# /etc/nixos/medusa.nix
{ pkgs, ... }:
{
  services.postgresql.enable = true;
  services.redis.enable = true;

  systemd.services.medusa = {
    description = "Medusa Backend";
    wantedBy = [ "multi-user.target" ];
    serviceConfig = {
      ExecStart = "${pkgs.nodejs}/bin/node dist/main.js";
      WorkingDirectory = "/opt/medusa";
      EnvironmentFile = "/run/secrets/medusa.env";
    };
  };
}
```

**Advantages:**
- [Atomic updates and rollbacks](https://www.gocodeo.com/post/using-nixos-for-immutable-infrastructure-and-declarative-configuration)
- [Zero drift by design](https://cloudcrafters.cloud/blog/nix-vs-ansible-declarative-devops/)
- Reproducible across environments
- [Companies like Shopify report significant reliability improvements](https://www.linuxjournal.com/content/how-devops-teams-are-redefining-reliability-nixos-and-ostree-powered-linux)

**Disadvantages:**
- [Steep learning curve](https://mtlynch.io/notes/nix-first-impressions/) - Nix language is functional, unfamiliar
- Smaller ecosystem than Ubuntu
- Debugging requires Nix expertise
- May complicate hiring/handoff

### Option C: Enhanced Ansible (Incremental)

Keep Ansible but add drift detection and recovery:

1. **Pre-flight checks** - Validate expected state before mutations
2. **Snapshot backups** - Hetzner snapshots before deploys
3. **Idempotent tasks only** - Avoid git clone, use fetch+reset
4. **State assertions** - Fail fast if drift detected

**Example improved deploy pattern:**
```yaml
- name: Ensure app directory is git repo
  ansible.builtin.stat:
    path: "{{ app_root }}/.git"
  register: git_check

- name: Reset existing repo or fresh clone
  ansible.builtin.git:
    repo: "{{ repo_url }}"
    dest: "{{ app_root }}"
    version: "{{ repo_branch }}"
    force: yes
    update: yes
  when: git_check.stat.exists

- name: Fresh clone if no git repo
  block:
    - name: Remove non-git directory
      ansible.builtin.file:
        path: "{{ app_root }}"
        state: absent
    - name: Clone fresh
      ansible.builtin.git:
        repo: "{{ repo_url }}"
        dest: "{{ app_root }}"
        version: "{{ repo_branch }}"
  when: not git_check.stat.exists
```

**Advantages:**
- Minimal migration effort
- Keeps existing knowledge
- Can implement incrementally

**Disadvantages:**
- Doesn't solve fundamental mutability problem
- Drift detection is reactive, not preventive
- Complexity grows over time

---

## Part 3: Recommendation

**Short-term**: Option C (Enhanced Ansible) - Fix immediate pain points
**Medium-term**: Option A (Terraform + Immutable) - Proper solution

### Migration Path

```
Phase 1 (Now):
├── Add pre-flight state checks to playbooks
├── Create Hetzner snapshot before deploys
└── Document all manual server changes

Phase 2 (Next Sprint):
├── Set up Terraform for Hetzner infrastructure
├── Create Docker image build pipeline
└── Implement blue-green deployment workflow

Phase 3 (Future):
├── Evaluate NixOS for dev environments
├── Consider k3s if scaling needs grow
└── Full immutable infrastructure
```

---

## Part 4: E2E Email Testing

### Requirements

Test that Resend emails are actually delivered when orders are placed:

1. **Automated** - Run in CI/CD, not manual verification
2. **Real delivery** - Test actual SMTP/API path, not mocks
3. **Content validation** - Verify email body, subject, links
4. **No production impact** - Don't spam real customers

### Option A: Mailosaur (Recommended)

[Mailosaur](https://mailosaur.com/docs/frameworks-and-tools/playwright) is purpose-built for automated email testing with excellent Playwright integration.

**How it works:**
1. Create test inbox (e.g., `abc123@mailosaur.net`)
2. Configure Resend to send to test addresses in test mode
3. Playwright test places order with test email
4. Mailosaur API retrieves delivered email
5. Assert on subject, body, links

**Integration:**

```typescript
// tests/e2e/order-email.spec.ts
import { test, expect } from '@playwright/test'
import Mailosaur from 'mailosaur'

const mailosaur = new Mailosaur(process.env.MAILOSAUR_API_KEY!)
const serverId = process.env.MAILOSAUR_SERVER_ID!

test('order confirmation email is sent', async ({ page }) => {
  // Generate unique email for this test
  const testEmail = `test.${Date.now()}@${serverId}.mailosaur.net`

  // Place order through UI
  await page.goto('/products/lens-frame-selection')
  await page.click('[data-testid="add-to-cart"]')
  await page.goto('/store/cart')
  await page.click('[data-testid="checkout"]')
  await page.fill('[name="email"]', testEmail)
  // ... complete checkout

  // Wait for email (Mailosaur polls automatically)
  const email = await mailosaur.messages.get(serverId, {
    sentTo: testEmail,
  }, {
    timeout: 30000, // 30s timeout
  })

  // Validate email content
  expect(email.subject).toContain('Order Confirmation')
  expect(email.html.body).toContain('OpticWorks')
  expect(email.html.links.length).toBeGreaterThan(0)
})
```

**Pricing:** ~$9/month for 50 tests/day (sufficient for CI)

**Advantages:**
- [Official Playwright SDK](https://mailosaur.com/docs/frameworks-and-tools/playwright/email-testing)
- Real email delivery testing
- Link/image validation built-in
- Works in CI/CD pipelines

### Option B: Mailtrap

[Mailtrap](https://mailtrap.io/) is more of a development sandbox than testing tool.

**Advantages:**
- Good for development email capture
- Free tier available

**Disadvantages:**
- [Not designed for automated testing](https://www.sender.net/blog/mailtrap-alternatives/)
- Limited Playwright integration
- [Pricing scales quickly](https://abigailarmijo.substack.com/p/send-and-test-mails-with-mailtrap) ($123/month for 10K emails)

### Option C: MailSlurp

[MailSlurp](https://www.mailslurp.com/examples/playwright-fake-email-test/) offers similar capabilities to Mailosaur.

**Comparison:**
- Slightly cheaper at high volumes
- Less polished documentation
- Good REST API

### Option D: Self-hosted (Not Recommended)

Run local SMTP server (Mailhog, Mailcatcher) and test against it.

**Why avoid:**
- Doesn't test actual Resend integration
- Can't run in Vercel/Cloudflare environments
- More infrastructure to maintain

---

## Part 5: Email Testing Recommendation

**Use Mailosaur** for the following reasons:

1. **Purpose-built for E2E testing** (not just sandboxing)
2. **First-class Playwright support** with official SDK
3. **Reasonable pricing** for CI workloads
4. **Tests real delivery path** through Resend

### Implementation Plan

```bash
# 1. Sign up for Mailosaur (14-day free trial)
# 2. Add secrets to Infisical
MAILOSAUR_API_KEY=xxx
MAILOSAUR_SERVER_ID=xxx

# 3. Create test helper
# tests/helpers/email.ts

# 4. Add email tests to existing Playwright suite
# tests/e2e/checkout-email.spec.ts

# 5. Configure CI to run email tests
# .github/workflows/e2e.yml
```

### Test Environment Setup

For email testing to work, we need a test mode in Medusa that:

1. Uses test Stripe keys (already have `STRIPE_SECRET_KEY` for test mode)
2. Routes emails to Mailosaur addresses
3. Doesn't affect production data

This can be achieved with environment-based configuration:

```typescript
// backend/medusa-config.ts
const isTestMode = process.env.NODE_ENV === 'test'

// In test mode, Resend sends to Mailosaur addresses
// In production, sends to real customer emails
```

---

## Appendix: References

### Infrastructure
- [Hetzner Terraform Provider](https://registry.terraform.io/providers/hetznercloud/hcloud/latest/docs)
- [Nix vs Ansible: A New DevOps Paradigm](https://cloudcrafters.cloud/blog/nix-vs-ansible-declarative-devops/)
- [Using NixOS for Immutable Infrastructure](https://www.gocodeo.com/post/using-nixos-for-immutable-infrastructure-and-declarative-configuration)
- [Terraform Workshop: Manage Hetzner Cloud Servers](https://dev.to/admantium/terraform-workshop-manage-hetzner-cloud-servers-3ih1)
- [Hcloud Kubernetes Terraform Module](https://github.com/hcloud-k8s/terraform-hcloud-kubernetes)

### Email Testing
- [Mailosaur Playwright Integration](https://mailosaur.com/docs/frameworks-and-tools/playwright)
- [Email Testing with Playwright](https://mailosaur.com/docs/email-testing/playwright)
- [Mailtrap Alternatives 2025](https://www.sender.net/blog/mailtrap-alternatives/)
- [MailSlurp Playwright Example](https://www.mailslurp.com/examples/playwright-fake-email-test/)

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-12-02 | RFD created | Document drift issues and solutions |
| TBD | Infrastructure approach selected | Pending team discussion |
| TBD | Email testing tool selected | Pending trial evaluation |
