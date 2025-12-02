# Documentation Reorganization Plan

**Created**: 2025-12-02
**Status**: 🔄 IN PROGRESS
**Goal**: Streamline documentation to improve developer onboarding, capture workarounds, and reduce technical debt

---

## Current State Assessment

### Documentation Stats
- **Total markdown files**: 80+
- **Active docs/**: 23 files (~12,373 lines)
- **Archived docs/**: 20 files (~9,183 lines)
- **Root docs**: 5 files
- **Total lines**: ~23,838

### Critical Issues Found

| Issue | Severity | File(s) | Action |
|-------|----------|---------|--------|
| CLAUDE.md/AGENTS.md not synced | 🔴 HIGH | Root | Hard-link or consolidate |
| Build workarounds undocumented in one place | 🔴 HIGH | Scattered | Create DEVELOPMENT.md |
| Phase 3 status not updated | 🟡 MEDIUM | PHASE3_PLAN.md | Update with Track 1-4 status |
| RFD-009 active blocker not linked | 🟡 MEDIUM | docs/ | Link from main docs |
| CI.md is a stub (15 lines) | 🟢 LOW | docs/CI.md | Expand or remove |
| Duplicate migration docs in archived/ | 🟢 LOW | archived/ | Delete lowercase variant |

### Known Kludges/Workarounds (Currently Undocumented)

1. **`unset NODE_ENV && pnpm run build`** - Required for production builds (NODE_ENV conflict)
2. **Email system stubbed** - @react-email removed due to Next.js 15 SSG conflict (RFD-009)
3. **`export const dynamic = 'force-dynamic'`** - Required on product pages to avoid SSG
4. **Lazy Stripe initialization** - Required in API routes to avoid build-time errors
5. **Medusa API fallback** - Static products used when API key unavailable at build time

---

## Proposed Structure

### Tier 1: Entry Points (Root)

```
/
├── README.md           # Quick start, architecture overview, phase status
├── CLAUDE.md           # AI agent context (hard-linked to AGENTS.md)
├── AGENTS.md           # Hard-link to CLAUDE.md
└── LICENSE.md          # License (unchanged)
```

**Changes**:
- Delete RFD-001-IMPLEMENTATION-SUMMARY.md from root (move to docs/rfds/)
- Hard-link AGENTS.md → CLAUDE.md

### Tier 2: Developer Guides (docs/)

```
docs/
├── GETTING_STARTED.md      # NEW: Quick onboarding (links to others)
├── DEVELOPMENT.md          # NEW: Build quirks, workarounds, kludges
├── ARCHITECTURE.md         # RENAME from CODEBASE_EXPLANATION.md
├── DEPLOYMENT.md           # RENAME from DEPLOYMENT_GUIDE.md
├── SECRETS.md              # RENAME from KEY_MANAGEMENT.md
├── STATE_MANAGEMENT.md     # Keep as-is
├── STRIPE_INTEGRATION.md   # Keep as-is
├── CONTRIBUTORS.md         # Keep as-is
└── BUILD_CONFIGURATION.md  # Keep, link from DEVELOPMENT.md
```

### Tier 3: Phase Documentation (docs/phases/)

```
docs/phases/
├── PHASE3_PLAN.md          # Move from docs/, update with status
├── PHASE3_STATUS.md        # NEW: Track completion status
├── PHASE2_SUMMARY.md       # Consolidate PHASE2_*.md files
└── archived/               # Old phase docs
    ├── PHASE2_INTEGRATION_SUMMARY.md
    ├── PHASE2_VALIDATION_REPORT.md
    └── PHASE2_RECREATION_GUIDE.md
```

### Tier 4: RFDs (docs/rfds/)

```
docs/rfds/
├── README.md               # RFD index and status
├── RFD-001-medusa-infrastructure-rebuild.md  # ✅ IMPLEMENTED
├── RFD-007-medusa-api-integration-mismatch.md
├── RFD-008-customer-authentication-architecture.md  # 📋 DRAFT
├── RFD-009-nextjs-build-ssg-error.md  # 🔴 ACTIVE
└── RFD-001-IMPLEMENTATION-SUMMARY.md  # Move from root
```

### Tier 5: API Reference (docs/api/)

```
docs/api/
├── README.md               # API overview
├── medusa-integration.md   # Medusa Store API usage
├── API_STUBS.md            # Endpoint reference (move from docs/)
└── API_ARCHITECTURE.md     # HTTP vs service layer (move from docs/)
```

### Tier 6: Archived (docs/archived/)

Keep as-is but add clear README:
```
docs/archived/
├── README.md               # NEW: Explain what's here and why
├── ... (existing archived files)
```

---

## New Files to Create

### 1. docs/GETTING_STARTED.md

Quick onboarding guide linking to detailed docs:
- Prerequisites
- Clone & install
- Pull secrets
- Run dev server
- Pre-commit checklist
- Links to DEVELOPMENT.md, ARCHITECTURE.md, etc.

### 2. docs/DEVELOPMENT.md

**Critical** - Single source of truth for development quirks:

```markdown
# Development Guide

## Build Commands

### Production Build (REQUIRED)
\`\`\`bash
unset NODE_ENV && pnpm run build
\`\`\`

**Why `unset NODE_ENV`?** GitHub Codespaces sets NODE_ENV=development, which
conflicts with Next.js build-time expectations. See BUILD_CONFIGURATION.md.

## Known Workarounds

### 1. Email System (Stubbed)
- **Status**: Stubbed in Phase 3
- **Reason**: @react-email/components causes Next.js 15 SSG conflict
- **Details**: RFD-009
- **Plan**: Migrate to Medusa notification system in Phase 4

### 2. Product Pages Force Dynamic
- **File**: src/app/products/[slug]/page.tsx
- **Code**: `export const dynamic = 'force-dynamic'`
- **Reason**: SSG fails when Medusa API unavailable at build time

### 3. Lazy Stripe Initialization
- **Files**: src/app/api/order-details/route.ts, webhook/route.ts
- **Reason**: Stripe SDK throws at build time if API key not set
- **Pattern**: Use `getStripe()` function instead of module-level `const`

### 4. Medusa API Fallback
- **File**: src/lib/api/medusa.ts
- **Behavior**: Falls back to static products if API returns 400
- **When**: Build time (no publishable key) or API unavailable

## Pre-Commit Checklist

\`\`\`bash
pnpm run lint              # Required
pnpm run test              # Required
unset NODE_ENV && pnpm run build  # Required (2-3 min)
\`\`\`

## Common Issues

### "non-standard NODE_ENV" warning
Run: `unset NODE_ENV`

### "Neither apiKey nor config.authenticator provided"
Stripe SDK initializing at build time. Use lazy initialization pattern.

### "<Html> should not be imported outside of pages/_document"
@react-email conflict. Email templates have been stubbed - see RFD-009.
```

### 3. docs/phases/PHASE3_STATUS.md

Track-by-track status:

```markdown
# Phase 3 Implementation Status

**Last Updated**: 2025-12-02

## Track Status

| Track | Status | Notes |
|-------|--------|-------|
| Track 1: US Region Setup | ✅ Complete | Stripe payment provider configured |
| Track 2: Products API | ✅ Complete | Dynamic loading with fallback |
| Track 3: Cart API | ✅ Complete | Hybrid local + Medusa sync |
| Track 4: Checkout Flow | ✅ Complete | Medusa payment sessions |
| Track 5: Hookdeck Docs | 📋 Pending | Hookdeck configured, needs docs |
| Track 6: Authentication | 📋 Pending | RFD-008 drafted |
| Track 7: E2E Testing | 📋 Pending | Blocked on auth |

## Completed Work (Tracks 1-4)

### Files Modified
- src/lib/api/medusa.ts - Cart & payment APIs
- src/hooks/useCart.ts - Hybrid cart implementation
- src/components/checkout/*.tsx - Medusa payment sessions
- src/app/api/order-details/route.ts - Lazy Stripe init

### Blockers Resolved
- RFD-009: Email templates stubbed (build conflict)
- Stripe build-time initialization (lazy init pattern)

## Remaining Work

### Track 5: Hookdeck Documentation
- Hookdeck is configured and routing webhooks
- Need to document setup and configuration

### Track 6: Customer Authentication
- RFD-008 drafted but not implemented
- Depends on Medusa customer module

### Track 7: E2E Testing
- Blocked on Track 6 completion
```

### 4. docs/rfds/README.md

RFD index:

```markdown
# Request for Discussion (RFD) Index

## Active

| RFD | Title | Status |
|-----|-------|--------|
| RFD-009 | Next.js Build SSG Error | 🔴 ACTIVE BLOCKER (workaround applied) |
| RFD-008 | Customer Authentication Architecture | 📋 DRAFT |

## Implemented

| RFD | Title | Status |
|-----|-------|--------|
| RFD-001 | Medusa Infrastructure Rebuild | ✅ IMPLEMENTED |
| RFD-007 | Medusa API Integration Mismatch | ✅ RESOLVED |

## Archived

See docs/archived/ for historical RFDs (RFD-004, RFD-005, RFD-006).
```

---

## Execution Plan

### Phase A: Critical Fixes (Do First)

1. [ ] Create `docs/DEVELOPMENT.md` with all workarounds
2. [ ] Fix CLAUDE.md/AGENTS.md (hard-link)
3. [ ] Create `docs/phases/PHASE3_STATUS.md`
4. [ ] Update README.md Phase 3 section

### Phase B: Reorganization

5. [ ] Create `docs/GETTING_STARTED.md`
6. [ ] Create `docs/rfds/` directory and move RFDs
7. [ ] Create `docs/phases/` directory and move phase docs
8. [ ] Rename files (DEPLOYMENT_GUIDE.md → DEPLOYMENT.md, etc.)

### Phase C: Cleanup

9. [ ] Add README to docs/archived/ explaining what's there
10. [ ] Delete duplicate migration-plan.md (lowercase)
11. [ ] Expand or remove CI.md stub
12. [ ] Update CLAUDE.md with new doc structure

---

## Success Criteria

- [ ] New developer can onboard in <30 minutes using GETTING_STARTED.md
- [ ] All build workarounds documented in one place (DEVELOPMENT.md)
- [ ] Phase 3 status accurately reflected
- [ ] No duplicate/conflicting documentation
- [ ] CLAUDE.md and AGENTS.md stay in sync automatically
