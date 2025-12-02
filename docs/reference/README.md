# Reference Documentation

**Updated**: 2025-12-02

Detailed documentation for deep dives. **Start with the main docs first** - only use these when you need specifics.

## Contents

| Document | When to Use |
|----------|-------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | System overview, data flows, integration points |
| [PHASE3_PLAN.md](PHASE3_PLAN.md) | Phase 3 tracks, implementation status |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Ansible playbook details, provisioning steps |
| [KEY_MANAGEMENT.md](KEY_MANAGEMENT.md) | Full Infisical variable inventory |
| [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) | Zustand patterns, store architecture |
| [STRIPE_INTEGRATION.md](STRIPE_INTEGRATION.md) | Payment flow (Medusa + legacy) |

## When to Reference

- **ARCHITECTURE.md** - Understanding overall system, debugging integration issues
- **PHASE3_PLAN.md** - Need to understand what's implemented vs pending
- **DEPLOYMENT_GUIDE.md** - First time deploying or debugging Ansible
- **KEY_MANAGEMENT.md** - Adding new secrets, understanding variable groups
- **STATE_MANAGEMENT.md** - Modifying cart/checkout stores
- **STRIPE_INTEGRATION.md** - Debugging payment flows

## Note

These are reference docs, not daily guides. The main README.md and CLAUDE.md have everything needed for normal development.
