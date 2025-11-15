# OpticWorks Platform Migration Plan

**Document Version**: 1.0
**Date**: 2025-11-13
**Status**: Planning Phase

## Executive Summary

This document outlines the comprehensive migration of the OpticWorks e-commerce platform from a single Next.js application to a modern, distributed monorepo architecture deployed on Cloudflare Workers with MedusaJS v2 as the e-commerce backend, Ory Hydra for authentication, and integrated documentation/community platforms.

## Migration Goals

### Primary Objectives
1. **Deployment Architecture**: Migrate to OpenNext adapter on Cloudflare Workers (not Pages)
2. **E-commerce Backend**: Integrate MedusaJS v2 as the commerce engine
3. **Monorepo Structure**: Consolidate all services into a unified repository
4. **Design System**: Implement token-based design system for consistency
5. **Documentation**: Integrate Hugo docs with Geekdocs theme
6. **Community**: Include Discourse forum in monorepo
7. **Authentication**: Deploy Ory Hydra for JWT-based authentication
8. **Infrastructure**: Backend services (DB/Redis) on Hetzner servers

### Non-Goals
- High availability / Multi-region deployment
- Complex message queue systems (use Redis/CF Queues only)
- Migration of historical data (greenfield deployment)

## Architecture Overview

### Current State (Next.js Monolith)
```
opticworks-store/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   ├── hooks/              # Zustand state management
│   └── lib/                # Utilities and business logic
└── public/                 # Static assets
```

### Target State (Distributed Monorepo)
```
opticworks/
├── apps/
│   ├── storefront/         # Next.js frontend (OpenNext → CF Workers)
│   ├── medusa-backend/     # MedusaJS v2 (Hetzner deployment)
│   ├── docs/               # Hugo static site (CF Pages)
│   ├── forum/              # Discourse (Hetzner deployment)
│   └── auth/               # Ory Hydra (Hetzner deployment)
├── packages/
│   ├── design-system/      # Token-based design system
│   ├── shared-types/       # TypeScript shared types
│   ├── cms-sdk/            # GitOps CMS SDK
│   └── medusa-plugins/     # Custom MedusaJS plugins
├── infrastructure/
│   ├── cloudflare/         # CF Workers/Queues/R2 config
│   ├── hetzner/            # Server provisioning scripts
│   └── github-actions/     # CI/CD workflows
└── scripts/
    └── migration/          # Data migration utilities
```

## Technology Stack

### Frontend Layer (Cloudflare Workers)
- **Framework**: Next.js 15.5.0 with App Router
- **Deployment**: OpenNext adapter → Cloudflare Workers
- **CDN**: Cloudflare R2 for static assets
- **Edge Compute**: Cloudflare Workers for API routes
- **Queue System**: Cloudflare Queues for webhook buffering

### E-commerce Backend (Hetzner)
- **Platform**: MedusaJS v2.x
- **Database**: PostgreSQL (Hetzner Cloud)
- **Cache**: Redis (Hetzner Cloud)
- **Storage**: Cloudflare R2 for media/product images
- **Search**: Built-in MedusaJS search (or Meilisearch)

### Authentication Layer (Hetzner)
- **Identity Provider**: Ory Hydra
- **Token Type**: JWT with refresh tokens
- **Monorepo Integration**: Service in `apps/auth/`

### Documentation (Cloudflare Pages)
- **Static Site Generator**: Hugo
- **Theme**: Geekdocs
- **Deployment**: Cloudflare Pages (separate from Workers)
- **Source**: `apps/docs/` in monorepo

### Community Forum (Hetzner)
- **Platform**: Discourse
- **Deployment**: Docker on Hetzner
- **Integration**: SSO via Ory Hydra
- **Monorepo Status**: Configuration/theme in `apps/forum/`

### Design System
- **Approach**: Token-based design (inspired by TweakCN)
- **Styling**: Tailwind CSS v4 with design tokens
- **Components**: Shadcn/ui as base + custom components
- **Package**: `packages/design-system/`

## Implementation Phases

### Phase 1: Foundation & Planning (Current Phase)
**Timeline**: Week 1
**Status**: In Progress

#### Deliverables
- [x] Migration plan documentation
- [ ] Monorepo structure setup (pnpm workspaces)
- [ ] Design token system foundation
- [ ] Architecture decision records (ADRs)
- [ ] Environment variable mapping
- [ ] Dependency audit and updates

#### Technical Tasks
1. Initialize monorepo with pnpm workspaces
2. Create workspace package structure
3. Define design tokens (colors, typography, spacing)
4. Document API contracts between services
5. Set up shared TypeScript configuration

---

### Phase 2: Design System & UI Refactoring
**Timeline**: Week 2
**Dependencies**: Phase 1 complete

#### Deliverables
- [ ] Token-based design system package
- [ ] Lime green color palette implementation
- [ ] Updated typography system
- [ ] Grid layout system with visible gridlines
- [ ] Menu-style navigation component
- [ ] 404 page with ASCII art animation (Oxide-inspired)
- [ ] Lenis smooth scrolling integration

#### Technical Tasks
1. **Design Tokens** (`packages/design-system/tokens/`)
   - Color tokens: Lime green primary, Modal green accents
   - Typography tokens: Font families, sizes, weights
   - Spacing tokens: Grid system (8px baseline)
   - Animation tokens: Easing functions, durations

2. **Component Migration**
   - Refactor existing components to use tokens
   - Create menu navigation with hover expansion
   - Build 404 bitmask animation component
   - Integrate Lenis for smooth scrolling

3. **Visual Design**
   - Grid overlay system for development
   - Lime green gradient implementations
   - Dark mode token variants

#### Code Stub Locations
- `packages/design-system/src/tokens/colors.ts` - Color token definitions
- `packages/design-system/src/tokens/typography.ts` - Typography scales
- `apps/storefront/src/components/navigation/MenuNav.tsx` - Menu navigation
- `apps/storefront/src/app/not-found.tsx` - 404 with ASCII animation

---

### Phase 3: Monorepo & Workspace Setup
**Timeline**: Week 3
**Dependencies**: Phase 1 complete

#### Deliverables
- [ ] Hugo docs workspace with Geekdocs theme
- [ ] Discourse forum configuration workspace
- [ ] MedusaJS v2 backend workspace
- [ ] Ory Hydra authentication workspace
- [ ] Shared types package
- [ ] Turborepo or pnpm workspace configuration

#### Technical Tasks
1. **Hugo Documentation** (`apps/docs/`)
   - Hugo installation and configuration
   - Geekdocs theme integration
   - Content migration from `/docs` folder
   - Cloudflare Pages deployment config
   - Search functionality setup

2. **Discourse Forum** (`apps/forum/`)
   - Discourse Docker configuration
   - Custom theme matching OpticWorks brand
   - SSO plugin configuration (Ory Hydra)
   - Hetzner deployment scripts
   - Backup/restore procedures

3. **MedusaJS Backend** (`apps/medusa-backend/`)
   - MedusaJS v2 initialization
   - Database schema design (product catalog migration)
   - Redis cache configuration
   - Cloudflare R2 storage plugin
   - API route definitions

4. **Ory Hydra Auth** (`apps/auth/`)
   - Hydra Docker deployment config
   - JWT signing keys setup
   - OAuth2 flow configuration
   - User database schema
   - Integration SDK for storefront

#### Environment Variables (New)
```bash
# MedusaJS
MEDUSA_BACKEND_URL=https://api.opticworks.com
MEDUSA_ADMIN_URL=https://admin.opticworks.com
DATABASE_URL=postgresql://user:pass@hetzner-db:5432/medusa
REDIS_URL=redis://hetzner-redis:6379

# Ory Hydra
HYDRA_URL=https://auth.opticworks.com
HYDRA_ADMIN_URL=https://auth-admin.opticworks.com
JWT_SECRET=<generated-secret>

# Cloudflare
CF_ACCOUNT_ID=<account-id>
CF_QUEUE_ID=<webhook-queue-id>

# Hetzner
HETZNER_API_TOKEN=<api-token>
HETZNER_SERVER_IP=<server-ip>
```

---

### Phase 4: Cloudflare Workers Deployment
**Timeline**: Week 4
**Dependencies**: Phase 1, 2 complete

#### Deliverables
- [ ] OpenNext configuration for Cloudflare Workers
- [ ] Cloudflare Queue for webhook buffering
- [ ] R2 bucket configuration for assets
- [ ] Worker scripts for edge compute
- [ ] Deployment automation scripts

#### Technical Tasks
1. **OpenNext Setup**
   - Install `opennext-cloudflare` adapter
   - Configure `next.config.ts` for edge runtime
   - Build and deployment pipeline
   - Environment variable management
   - Route splitting (static vs. dynamic)

2. **Cloudflare Queue Integration**
   - Create queue for Stripe webhooks
   - Worker to consume webhook events
   - Dead letter queue for failed events
   - Monitoring and alerting setup

3. **Edge Functions**
   - Cart management on the edge
   - Session handling with Durable Objects
   - API route optimization
   - Cache strategy implementation

#### Configuration Files
- `apps/storefront/next.config.ts` - OpenNext configuration
- `infrastructure/cloudflare/wrangler.toml` - Worker configuration
- `infrastructure/cloudflare/queues.ts` - Queue definitions
- `scripts/deploy-workers.sh` - Deployment automation

---

### Phase 5: MedusaJS Integration
**Timeline**: Week 5-6
**Dependencies**: Phase 3 complete

#### Deliverables
- [ ] Product catalog migration to MedusaJS
- [ ] Custom MedusaJS plugins
- [ ] Storefront <-> MedusaJS integration
- [ ] Admin dashboard setup
- [ ] Inventory management system

#### Technical Tasks
1. **Data Migration**
   - Export current product data from `src/lib/products.ts`
   - Import to MedusaJS product model
   - Category and collection setup
   - Variant management (VLT percentages)

2. **Custom Plugins** (`packages/medusa-plugins/`)
   - Tesla compatibility checker plugin
   - State tinting law compliance plugin
   - Oops Protection warranty plugin
   - Installation guide association plugin

3. **Storefront Integration**
   - Replace static product data with MedusaJS API
   - Implement cart with MedusaJS cart API
   - Checkout flow integration
   - Order management integration

4. **Admin Features**
   - Custom admin routes for Tesla-specific data
   - Inventory alerts and management
   - Order fulfillment workflow
   - Customer support ticket integration

#### API Contracts
```typescript
// Product API (MedusaJS)
GET    /store/products
GET    /store/products/:id
POST   /store/carts
POST   /store/carts/:id/line-items
POST   /store/carts/:id/complete

// Custom APIs
GET    /store/compatibility/check/:vehicleId
GET    /store/legal/tinting-laws/:state
POST   /store/warranty/claim
```

---

### Phase 6: Authentication & Authorization
**Timeline**: Week 6-7
**Dependencies**: Phase 3 complete

#### Deliverables
- [ ] Ory Hydra deployment on Hetzner
- [ ] JWT authentication flow
- [ ] User registration and login UI
- [ ] SSO integration with Discourse
- [ ] Protected routes and API authorization

#### Technical Tasks
1. **Ory Hydra Setup**
   - Deploy Hydra using Docker on Hetzner
   - Configure OAuth2 clients (storefront, admin, forum)
   - Set up consent and login UI
   - Database for OAuth2 data

2. **Storefront Auth**
   - Login/register components
   - JWT token management (httpOnly cookies)
   - Protected route middleware
   - User profile pages

3. **API Authorization**
   - JWT verification middleware
   - Role-based access control (customer, admin)
   - API key management for services
   - Rate limiting per user

4. **Forum SSO**
   - Discourse SSO plugin configuration
   - User profile sync
   - Single sign-on flow

#### Security Considerations
- JWT rotation policy (15min access, 7day refresh)
- Secure cookie attributes (httpOnly, secure, sameSite)
- CORS configuration for cross-origin requests
- API rate limiting per authenticated user

---

### Phase 7: Infrastructure & DevOps
**Timeline**: Week 7-8
**Dependencies**: Phase 3, 4 complete

#### Deliverables
- [ ] Hetzner server provisioning scripts
- [ ] Docker Compose for backend services
- [ ] Cloudflare deployment automation
- [ ] GitHub Actions CI/CD pipelines
- [ ] Monitoring and logging setup
- [ ] Backup and disaster recovery procedures

#### Technical Tasks
1. **Hetzner Provisioning** (`infrastructure/hetzner/`)
   - Terraform or Ansible scripts
   - PostgreSQL setup with replication
   - Redis configuration
   - Discourse deployment
   - Ory Hydra deployment
   - MedusaJS deployment
   - Nginx reverse proxy configuration
   - SSL/TLS certificate management (Let's Encrypt)

2. **GitHub Actions** (`infrastructure/github-actions/`)
   - Lint and type-check workflow
   - Unit test workflow
   - E2E test workflow (Playwright)
   - Build and deploy storefront (CF Workers)
   - Build and deploy docs (CF Pages)
   - Deploy backend services (SSH to Hetzner)
   - Dependency security scanning

3. **Monitoring**
   - Cloudflare Analytics for Workers
   - PostgreSQL monitoring (pgAdmin or similar)
   - Redis monitoring (RedisInsight)
   - Application logs (Loki or similar)
   - Uptime monitoring (UptimeRobot or similar)
   - Error tracking (Sentry integration)

4. **Backup Strategy**
   - Daily PostgreSQL backups to Hetzner Storage Box
   - Redis persistence configuration
   - R2 versioning for static assets
   - Configuration backups (git repository)

#### Workflow Files
```yaml
# .github/workflows/deploy-storefront.yml
# .github/workflows/deploy-backend.yml
# .github/workflows/deploy-docs.yml
# .github/workflows/test.yml
# .github/workflows/security.yml
```

---

### Phase 8: CMS & Content Management
**Timeline**: Week 8-9
**Dependencies**: Phase 4, 7 complete

#### Deliverables
- [ ] GitOps CMS workflow implementation
- [ ] Content schema definitions
- [ ] Admin UI for content editing
- [ ] Git-based content versioning
- [ ] Content preview system

#### Technical Tasks
1. **GitOps CMS SDK** (`packages/cms-sdk/`)
   - Content schema definitions (TypeScript)
   - Git operations SDK (create, update, delete content)
   - GitHub API integration for PR creation
   - Markdown frontmatter parsing
   - Content validation and linting

2. **Content Types**
   - Product content (supplementary to MedusaJS)
   - Blog posts and articles
   - Installation guides
   - Support articles (FAQ)
   - Legal documents (privacy, terms)

3. **Admin Interface**
   - Content editor UI (MDX support)
   - Content preview before publish
   - Git commit message generation
   - PR review workflow
   - Publish automation

4. **Content Storage**
   - Content files in `content/` directory
   - Git-tracked for version history
   - Automatic deployment on merge to main
   - Rollback capability via git revert

---

### Phase 9: Integration & Polish
**Timeline**: Week 9-10
**Dependencies**: All previous phases

#### Deliverables
- [ ] Turnstile integration on support form
- [ ] Gmail/PubSub for support notifications
- [ ] Social media links (GitHub, Discord, X, Forums, YouTube)
- [ ] Updated footer with all links
- [ ] Analytics integration
- [ ] SEO optimization
- [ ] Performance optimization

#### Technical Tasks
1. **Turnstile Setup**
   - Cloudflare Turnstile site key
   - Client-side widget integration
   - Server-side verification
   - Fallback for blocked users

2. **Gmail/PubSub Notifications**
   - Google Cloud Pub/Sub setup
   - Gmail API integration
   - Notification worker (CF Worker)
   - Email template system
   - Replace Resend for support emails (keep for orders)

3. **Social Integration**
   - Add social links to navigation
   - Add social links to footer
   - Social sharing buttons on products
   - Open Graph meta tags
   - Twitter Card meta tags

4. **Analytics**
   - Google Analytics 4 integration
   - Cloudflare Web Analytics
   - Custom event tracking
   - Conversion tracking
   - Privacy-compliant cookie consent

#### Environment Variables
```bash
# Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<site-key>
TURNSTILE_SECRET_KEY=<secret-key>

# Gmail/PubSub
GOOGLE_CLOUD_PROJECT=<project-id>
PUBSUB_TOPIC_ID=support-notifications
GMAIL_SERVICE_ACCOUNT_KEY=<base64-encoded-key>
SUPPORT_EMAIL=support@opticworks.com
```

---

### Phase 10: Testing & Launch
**Timeline**: Week 10-11
**Dependencies**: All previous phases

#### Deliverables
- [ ] Comprehensive test suite
- [ ] Load testing results
- [ ] Security audit
- [ ] User acceptance testing
- [ ] Launch checklist
- [ ] Rollback procedures

#### Technical Tasks
1. **Testing**
   - Unit tests for all business logic
   - Integration tests for API routes
   - E2E tests for critical user flows
   - Visual regression testing
   - Accessibility testing (WCAG 2.1 AA)
   - Cross-browser testing

2. **Performance**
   - Lighthouse audit (target: 90+ all categories)
   - Core Web Vitals optimization
   - Load testing with realistic traffic
   - Database query optimization
   - CDN cache configuration

3. **Security**
   - OWASP Top 10 vulnerability scan
   - Dependency security audit
   - Penetration testing
   - SSL/TLS configuration
   - CSP header configuration
   - Rate limiting verification

4. **Launch Preparation**
   - DNS configuration
   - SSL certificate provisioning
   - Monitoring alerts configuration
   - Incident response procedures
   - Communication plan
   - Feature flag system for gradual rollout

---

## Key Technical Decisions

### Decision 1: Monorepo Structure
**Choice**: pnpm workspaces
**Rationale**: Native support, fast, efficient, no additional tooling
**Alternative Considered**: Turborepo (adds caching but more complexity)

### Decision 2: Deployment Strategy
**Choice**: OpenNext on Cloudflare Workers
**Rationale**: Edge performance, cost-effective, unified platform
**Alternative Considered**: Vercel (vendor lock-in, higher cost)

### Decision 3: E-commerce Backend
**Choice**: MedusaJS v2
**Rationale**: Headless, customizable, active community, Node.js
**Alternative Considered**: WooCommerce (PHP), Saleor (Python)

### Decision 4: Authentication
**Choice**: Ory Hydra
**Rationale**: Standards-compliant OAuth2/OIDC, self-hosted
**Alternative Considered**: Auth0 (SaaS, higher cost), Keycloak (Java, heavier)

### Decision 5: Design System
**Choice**: Token-based Tailwind with TweakCN approach
**Rationale**: Type-safe, theme-able, familiar developer experience
**Alternative Considered**: CSS-in-JS (runtime overhead), vanilla CSS (maintenance burden)

### Decision 6: Infrastructure
**Choice**: Hetzner for backend, Cloudflare for frontend
**Rationale**: Cost-effective, good performance, not HA requirement
**Alternative Considered**: AWS (more expensive), all-Cloudflare (DB limitations)

---

## Migration Risks & Mitigation

### Risk 1: Data Migration Complexity
**Impact**: High
**Probability**: Medium
**Mitigation**:
- Start with clean MedusaJS installation (greenfield)
- Manual product import with validation
- Thorough testing before launch
- Keep old system as reference

### Risk 2: Authentication Integration Complexity
**Impact**: High
**Probability**: High
**Mitigation**:
- Implement auth late in migration (Phase 6)
- Start with basic email/password flow
- Add SSO incrementally
- Comprehensive testing of auth flows

### Risk 3: Performance Degradation
**Impact**: Medium
**Probability**: Low
**Mitigation**:
- Extensive load testing before launch
- Cloudflare caching strategy
- Database query optimization
- Redis caching layer

### Risk 4: Deployment Pipeline Complexity
**Impact**: Medium
**Probability**: Medium
**Mitigation**:
- Automate deployments with GitHub Actions
- Staging environment for testing
- Rollback procedures documented
- Feature flags for gradual rollout

### Risk 5: Third-party Service Integration
**Impact**: Medium
**Probability**: Medium
**Mitigation**:
- Keep Stripe and Resend (already working)
- Test new integrations (Turnstile, Gmail/PubSub) in isolation
- Fallback mechanisms for failed integrations
- Monitoring and alerting

---

## Success Metrics

### Performance Targets
- Lighthouse Score: 90+ in all categories
- Time to First Byte (TTFB): < 200ms (p95)
- Largest Contentful Paint (LCP): < 2.5s (p75)
- First Input Delay (FID): < 100ms (p95)
- Cumulative Layout Shift (CLS): < 0.1 (p75)

### Business Metrics
- Checkout conversion rate: Maintain or improve current rate
- Cart abandonment rate: < 70%
- Support ticket resolution time: < 24 hours
- System uptime: 99.5% (not HA, but reliable)

### Developer Experience
- Build time: < 60s for full build
- Local dev startup: < 10s
- PR review turnaround: < 24 hours
- Deployment time: < 5 minutes per service

---

## Resource Requirements

### Development Team
- **Frontend Developer**: 1 FTE (storefront, design system)
- **Backend Developer**: 1 FTE (MedusaJS, Ory Hydra)
- **DevOps Engineer**: 0.5 FTE (infrastructure, CI/CD)
- **Designer**: 0.25 FTE (design tokens, UI review)

### Infrastructure Costs (Estimated Monthly)
- **Cloudflare Workers**: $25-50 (based on requests)
- **Cloudflare R2**: $15-30 (based on storage/bandwidth)
- **Hetzner Server**: €40-80 (CPX31 or CCX23)
- **Hetzner Storage Box**: €5-10 (100GB backups)
- **Domain & SSL**: €5 (CloudflareSSL free)
- **Total**: ~$90-170/month

### External Services (Current + New)
- **Stripe**: Transaction fees only (existing)
- **Resend**: $20/month (existing, order emails)
- **Google Cloud**: $10-20/month (Pub/Sub, Gmail API)
- **Cloudflare Turnstile**: Free
- **Total New**: ~$30-40/month

---

## Timeline Summary

| Phase | Duration | Start | End | Status |
|-------|----------|-------|-----|--------|
| 1. Foundation & Planning | 1 week | Week 1 | Week 1 | In Progress |
| 2. Design System & UI | 1 week | Week 2 | Week 2 | Pending |
| 3. Monorepo Setup | 1 week | Week 3 | Week 3 | Pending |
| 4. CF Workers Deployment | 1 week | Week 4 | Week 4 | Pending |
| 5. MedusaJS Integration | 2 weeks | Week 5 | Week 6 | Pending |
| 6. Authentication | 2 weeks | Week 6 | Week 7 | Pending |
| 7. Infrastructure & DevOps | 2 weeks | Week 7 | Week 8 | Pending |
| 8. CMS & Content | 2 weeks | Week 8 | Week 9 | Pending |
| 9. Integration & Polish | 2 weeks | Week 9 | Week 10 | Pending |
| 10. Testing & Launch | 2 weeks | Week 10 | Week 11 | Pending |
| **Total** | **11 weeks** | | | |

---

## Next Steps

### Immediate Actions (This Week)
1. ✅ Complete this migration plan document
2. ⬜ Set up monorepo structure with pnpm workspaces
3. ⬜ Create design token foundation
4. ⬜ Document API contracts between services
5. ⬜ Set up development environment for all services

### Short-term (Next 2 Weeks)
1. Implement token-based design system
2. Refactor UI components to use design tokens
3. Set up Hugo docs workspace
4. Set up MedusaJS backend workspace
5. Configure OpenNext for Cloudflare Workers

### Medium-term (Weeks 3-6)
1. Complete monorepo workspace setup
2. Deploy MedusaJS and migrate product catalog
3. Implement Ory Hydra authentication
4. Set up Cloudflare infrastructure
5. Build custom MedusaJS plugins

### Long-term (Weeks 7-11)
1. Complete infrastructure automation
2. Implement GitOps CMS
3. Integration testing
4. Performance optimization
5. Security audit and launch

---

## Appendices

### Appendix A: Environment Variables Complete List
See `infrastructure/env.example` for complete list

### Appendix B: Service Port Mapping
- **Storefront**: :3000 (dev), :443 (prod via CF Workers)
- **MedusaJS Backend**: :9000 (internal), :443 (prod via nginx)
- **MedusaJS Admin**: :7001 (internal), :443 (prod via nginx)
- **Ory Hydra Public**: :4444 (internal), :443 (prod via nginx)
- **Ory Hydra Admin**: :4445 (internal, no external access)
- **Discourse**: :3000 (internal), :443 (prod via nginx)
- **PostgreSQL**: :5432 (internal only)
- **Redis**: :6379 (internal only)

### Appendix C: Repository Structure
See section "Architecture Overview - Target State"

### Appendix D: Design Token Schema
See `packages/design-system/docs/TOKEN_SCHEMA.md` (to be created)

### Appendix E: API Documentation
See `apps/docs/content/api/` (to be created in Hugo docs)

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-13 | Claude | Initial migration plan |

---

**End of Migration Plan**
