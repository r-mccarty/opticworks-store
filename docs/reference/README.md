# Reference Documentation

Detailed documentation for deep dives. **Start with the main docs first** - only use these when you need specifics.

## Contents

| Document | When to Use |
|----------|-------------|
| [PHASE3_PLAN.md](PHASE3_PLAN.md) | Understanding Phase 3 tracks, implementation details |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Ansible playbook details, provisioning steps |
| [KEY_MANAGEMENT.md](KEY_MANAGEMENT.md) | Full Infisical variable inventory (~50 vars) |
| [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) | Zustand patterns, store architecture |
| [STRIPE_INTEGRATION.md](STRIPE_INTEGRATION.md) | Checkout flow, webhook handling |
| [RFD-009-build-workarounds.md](RFD-009-build-workarounds.md) | Build issue investigation, root cause |

## When to Reference

- **PHASE3_PLAN.md** - Need to understand what's implemented vs pending
- **DEPLOYMENT_GUIDE.md** - First time deploying or debugging Ansible
- **KEY_MANAGEMENT.md** - Adding new secrets, understanding variable groups
- **STATE_MANAGEMENT.md** - Modifying cart/checkout stores
- **STRIPE_INTEGRATION.md** - Debugging payment flows
- **RFD-009** - Build failures, understanding workarounds

## Note

These are reference docs, not daily guides. The main README.md and CLAUDE.md have everything needed for normal development.
