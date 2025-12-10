# Reference Documentation

Deep-dive documentation for specific topics. Start with `CLAUDE.md` for daily development.

---

## Core Documentation

| Document | Purpose |
|----------|---------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | System overview, data flows, external services |
| [BACKEND_OPERATIONS.md](BACKEND_OPERATIONS.md) | SSH access, server logs, Medusa Admin API |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Ansible playbooks, backup & recovery |
| [CLOUDFLARE_API.md](CLOUDFLARE_API.md) | R2, Tunnels, DNS, WAF rate limiting |

---

## Checkout & Payments

| Document | Purpose |
|----------|---------|
| [CHECKOUT_FLOW.md](CHECKOUT_FLOW.md) | Full checkout process, Stripe deferred intent pattern |
| [STRIPE_INTEGRATION.md](STRIPE_INTEGRATION.md) | Payment flow with Medusa |
| [WEBHOOKS.md](WEBHOOKS.md) | Stripe + EasyPost webhooks via Hookdeck |

---

## Fulfillment

| Document | Purpose |
|----------|---------|
| [FULFILLMENT.md](FULFILLMENT.md) | Shipping rates, labels, EasyPost provider (outbound) |
| [FULFILLMENT_INBOUND.md](FULFILLMENT_INBOUND.md) | Tracker webhooks, status updates (inbound) |

---

## State & API

| Document | Purpose |
|----------|---------|
| [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) | Zustand stores (cart, auth, checkout) |
| [CUSTOMER_AUTH.md](CUSTOMER_AUTH.md) | Login, registration, sessions |
| [MEDUSA_API.md](MEDUSA_API.md) | Store API (products, carts, payments) |

---

## Testing

| Document | Purpose |
|----------|---------|
| [E2E_TESTING.md](E2E_TESTING.md) | Playwright, Mailosaur email, Hookdeck webhook testing |
| [MOBILE_E2E_TESTING_PLAN.md](MOBILE_E2E_TESTING_PLAN.md) | Mobile testing strategy |

---

## Planning

| Document | Purpose |
|----------|---------|
| [PHASE4_PLAN.md](PHASE4_PLAN.md) | Current phase tracks and status |
| [PLATFORM_ENGINEERING_PLAN.md](PLATFORM_ENGINEERING_PLAN.md) | Infrastructure improvements roadmap |

---

## RFDs (Request for Discussion)

| Document | Status |
|----------|--------|
| [RFD-010-infrastructure-and-testing.md](RFD-010-infrastructure-and-testing.md) | Draft |
| [RFD-012-easypost-hookdeck-verification.md](RFD-012-easypost-hookdeck-verification.md) | Deployed |

---

## Archived

Moved to `docs/archived/` - historical reference only.

| Document | Notes |
|----------|-------|
| [PHASE3_PLAN.md](../archived/PHASE3_PLAN.md) | Completed |
| [KEY_MANAGEMENT.md](../archived/KEY_MANAGEMENT.md) | Superseded by `docs/SECRETS.md` |
| [RFD-011-cloudflare-ssr-workaround.md](../archived/RFD-011-cloudflare-ssr-workaround.md) | Resolved |

---

## When to Use

| Task | Document |
|------|----------|
| SSH to server, view logs | [BACKEND_OPERATIONS.md](BACKEND_OPERATIONS.md) |
| Debug shipping rates or fulfillment | [FULFILLMENT.md](FULFILLMENT.md) |
| Understand webhook flow | [WEBHOOKS.md](WEBHOOKS.md) |
| Debug checkout/payment | [CHECKOUT_FLOW.md](CHECKOUT_FLOW.md) |
| Deploy backend changes | [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) |
| Manage Cloudflare resources | [CLOUDFLARE_API.md](CLOUDFLARE_API.md) |
| Write E2E tests | [E2E_TESTING.md](E2E_TESTING.md) |
| Modify Zustand stores | [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) |
| Add or rotate secrets | [../SECRETS.md](../SECRETS.md) |

For daily development, `CLAUDE.md` has everything you need.
