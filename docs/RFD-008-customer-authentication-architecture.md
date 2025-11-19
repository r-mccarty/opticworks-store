# RFD-008: Customer Authentication Architecture

**Status**: Draft
**Author**: Platform Engineering
**Created**: 2025-11-19
**Updated**: 2025-11-19

---

## Executive Summary

This document proposes a phased approach to implementing customer authentication for the OpticWorks platform, enabling customers to view order history, manage subscriptions, track warranties, and participate in community forums. The architecture evolves from a simple Medusa-backed authentication system (Phase 3) to a distributed SSO infrastructure using Ory Hydra as an OAuth 2.0/OIDC provider (Phase 4+).

**Key Design Principles**:
- **Self-hosted**: No SaaS dependencies for authentication
- **Lightweight**: Minimal operational overhead (unlike Authentik, Keycloak)
- **Progressive enhancement**: Start simple, add complexity only when needed
- **Data sovereignty**: Customer data remains in Medusa database
- **Standards-based**: OAuth 2.0, OIDC, JWT - no proprietary protocols

**Philosophy**: Similar to GoTrue/Supabase Auth - Ory Hydra acts as a **token minting service** that delegates credential verification to Medusa, which serves as the **identity backend**.

---

## Problem Statement

### Current State (Phase 2)

OpticWorks currently operates with **guest-only checkout**:
- No customer accounts
- No login required for purchases
- Orders identified by email only
- No persistent customer identity

```
┌──────────┐
│  Guest   │──email/payment──▶ Stripe Checkout
│ Customer │                        │
└──────────┘                        ▼
                              ┌──────────┐
                              │  Order   │ (email-based, stateless)
                              └──────────┘
```

### Requirements (Phase 3+)

**Customer-facing features**:
1. **Order History** - View past purchases, track shipments
2. **Lab Subscription** - Manage recurring firmware subscription
3. **Warranty Portal** - File claims, track repairs
4. **Forum Access** - Community participation (Discourse integration)
5. **Saved Preferences** - Shipping addresses, payment methods

**Platform requirements**:
6. **Single Sign-On** - Login once, access all properties
7. **Developer API** - OAuth 2.0 for third-party integrations
8. **Mobile App** - Future iOS/Android authentication

**Non-functional requirements**:
- Self-hosted (no Auth0, Clerk, etc.)
- Lightweight (no Authentik/Keycloak overhead)
- Secure (industry-standard protocols)
- Scalable (100K+ customers)

---

## Architectural Approach

### Philosophy: Medusa as Identity Backend

Medusa v2 includes a complete **customer identity system** (`customers` table, authentication APIs). Rather than duplicate this in a separate identity service, we leverage Medusa as the **source of truth** for customer data and delegate **session coordination** to Ory Hydra.

**Analogy**:
```
Supabase Architecture:        OpticWorks Architecture:
┌────────────┐                ┌─────────────┐
│   GoTrue   │ ←──────────▶   │ Ory Hydra   │ (OAuth coordinator)
└──────┬─────┘                └──────┬──────┘
       │                             │
       ▼                             ▼
┌────────────┐                ┌─────────────┐
│ PostgreSQL │                │   Medusa    │ (Identity + commerce)
└────────────┘                └─────────────┘
```

**Key Insight**: Ory Hydra is a **token minting service** (OAuth server), not an identity database. It needs an external system to verify credentials - that's Medusa.

---

## Phase 3: Medusa as CIAM

**Timeline**: Q1 2025
**Scope**: Storefront-only authentication

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Storefront                      │
│                    (optic.works)                            │
└───────────────────┬─────────────────────────────────────────┘
                    │ HTTPS
                    ▼
┌─────────────────────────────────────────────────────────────┐
│               Medusa Store API                              │
│            (api.optic.works/store)                          │
│                                                             │
│  ┌──────────────────────────────────────────────┐          │
│  │  POST /store/auth/customer/emailpass         │          │
│  │  → Returns JWT token (httpOnly cookie)       │          │
│  └──────────────────────────────────────────────┘          │
│                                                             │
│  ┌──────────────────────────────────────────────┐          │
│  │  GET /store/customers/me                     │          │
│  │  → Returns customer profile, orders          │          │
│  └──────────────────────────────────────────────┘          │
│                                                             │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL (Hetzner)                           │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐      │
│  │  customers   │  │    orders    │  │ warranties  │      │
│  │  (email,pw)  │  │              │  │             │      │
│  └──────────────┘  └──────────────┘  └─────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow: Customer Login

```
1. User enters email/password on storefront
   ↓
2. POST /api/auth/login → Next.js API route
   ↓
3. Next.js → POST /store/auth/customer/emailpass (Medusa)
   ↓
4. Medusa verifies credentials against customers table
   ↓
5. Medusa returns JWT token
   ↓
6. Next.js sets httpOnly cookie: medusa_token
   ↓
7. Redirect to /account/orders
```

### Session Management

**Token Storage**:
- **Frontend**: httpOnly cookie (XSS protection)
- **Lifetime**: 7 days (configurable via `JWT_SECRET`)
- **Refresh**: Automatic via Medusa session middleware

**Protected Routes**:
```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get("medusa_token")

  // Redirect to login if accessing protected route without token
  if (!token && request.nextUrl.pathname.startsWith("/account")) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }
}
```

### Security Model

**Authentication**:
- Email/password (bcrypt hashed in Medusa)
- JWT tokens signed with `JWT_SECRET` (from Infisical)
- HTTPS-only (enforced by Cloudflare)

**Authorization**:
- Customer can only access their own orders
- Medusa middleware validates JWT → customer_id
- API enforces row-level security

**Threat Model**:
| Threat | Mitigation |
|--------|------------|
| XSS token theft | httpOnly cookies |
| CSRF | SameSite=Lax cookie attribute |
| Token replay | Short expiration (7d) + HTTPS only |
| Password leaks | bcrypt hashing, rate limiting |
| Enumeration | Generic error messages |

### Operational Characteristics

**Infrastructure**:
- **New services**: None (Medusa already running)
- **Database changes**: Use existing `customers` table
- **Secrets**: Reuse `JWT_SECRET`, `COOKIE_SECRET` (already in Infisical)

**Monitoring**:
- Failed login attempts → Medusa logs
- Session metrics → Existing Medusa telemetry
- No additional observability required

**Scaling**:
- Sessions are stateless (JWT)
- Medusa backend scales horizontally (already planned)
- No additional bottlenecks introduced

---

## Phase 4: Ory Hydra SSO

**Timeline**: Q2 2025 (when forum launches)
**Scope**: Multi-property single sign-on

### Architecture

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Storefront  │  │    Forum     │  │   Warranty   │  │     Docs     │
│ optic.works  │  │  community.* │  │  warranty.*  │  │   docs.*     │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │                 │
       └─────────────────┼─────────────────┼─────────────────┘
                         │ OAuth 2.0 / OIDC
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Ory Hydra                                    │
│                 (OAuth 2.0 / OIDC Provider)                         │
│                  auth.optic.works                                   │
│                                                                     │
│  ┌────────────────────────────────────────────────────┐            │
│  │  OAuth Endpoints:                                   │            │
│  │  • /oauth2/auth    (authorization code flow)       │            │
│  │  • /oauth2/token   (exchange code for token)       │            │
│  │  • /userinfo       (get customer identity)         │            │
│  └────────────────────────────────────────────────────┘            │
│                                                                     │
└──────────────────────┬──────────────────────────────────────────────┘
                       │ delegates credential verification
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   Login & Consent Provider                          │
│                 (Custom Node.js Service)                            │
│                  login.optic.works                                  │
│                                                                     │
│  ┌────────────────────────────────────────────────────┐            │
│  │  Hydra Callbacks:                                   │            │
│  │  • GET  /login    (render login form)              │            │
│  │  • POST /login    (verify credentials → Medusa)    │            │
│  │  • GET  /consent  (authorize app access)           │            │
│  └─────────────────────┬──────────────────────────────┘            │
└────────────────────────┼────────────────────────────────────────────┘
                         │ calls Medusa API
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Medusa Backend                                   │
│                (api.optic.works)                                    │
│                                                                     │
│  ┌────────────────────────────────────────────────────┐            │
│  │  POST /store/auth/customer/emailpass               │            │
│  │  GET  /store/customers/me                          │            │
│  │  GET  /store/customers/:id/orders                  │            │
│  └────────────────────────────────────────────────────┘            │
│                                                                     │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                               │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐              │
│  │  customers   │  │    orders    │  │ warranties  │              │
│  └──────────────┘  └──────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

### Components

#### 1. Ory Hydra (OAuth Server)

**Purpose**: Token coordination and session management
**Responsibilities**:
- Issue OAuth 2.0 access tokens
- Issue OIDC ID tokens
- Manage consent flows
- Handle token refresh

**Does NOT**:
- Store customer credentials
- Verify passwords
- Store customer profile data

**Deployment**:
- Docker container on Hetzner (alongside Medusa)
- PostgreSQL backend (shared with Medusa)
- Exposed via Cloudflare Tunnel (`auth.optic.works`)

#### 2. Login & Consent Provider (Custom Service)

**Purpose**: Bridge between Hydra and Medusa
**Responsibilities**:
- Render login UI (redirect from Hydra)
- Verify credentials via Medusa Store API
- Return customer identity to Hydra
- Handle consent screens (OAuth scopes)

**Implementation**:
```typescript
// login-provider/src/routes/login.ts

export async function POST(request: Request) {
  const { email, password, challenge } = await request.json()

  // 1. Verify credentials via Medusa
  const medusaResponse = await fetch(
    `${MEDUSA_URL}/store/auth/customer/emailpass`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    }
  )

  if (!medusaResponse.ok) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 })
  }

  const { token } = await medusaResponse.json()

  // 2. Fetch customer profile
  const customerResponse = await fetch(
    `${MEDUSA_URL}/store/customers/me`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  )

  const customer = await customerResponse.json()

  // 3. Accept Hydra login challenge
  const hydraResponse = await fetch(
    `${HYDRA_ADMIN_URL}/oauth2/auth/requests/login/accept?login_challenge=${challenge}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: customer.id,  // Hydra "user ID"
        remember: true,
        remember_for: 604800,  // 7 days
        acr: "1",  // Authentication Context Reference
        context: {
          medusa_customer_id: customer.id,
          email: customer.email,
          has_account: customer.has_account
        }
      })
    }
  )

  const { redirect_to } = await hydraResponse.json()

  // 4. Redirect user back to Hydra
  return Response.redirect(redirect_to)
}
```

**Deployment**:
- Lightweight Node.js/Bun service
- Deployed alongside Hydra on Hetzner
- Stateless (no database, pure proxy)

#### 3. OAuth Clients (Apps)

Each property registers as an OAuth client with Hydra:

| App | Client ID | Redirect URI | Scopes |
|-----|-----------|--------------|--------|
| Storefront | `opticworks-store` | `https://optic.works/auth/callback` | `openid profile email orders` |
| Forum | `opticworks-forum` | `https://community.optic.works/auth/callback` | `openid profile email` |
| Warranty | `opticworks-warranty` | `https://warranty.optic.works/auth/callback` | `openid profile email warranties` |
| Developer API | `third-party-app` | `https://app.example.com/callback` | `openid email orders.read` |

### Data Flow: SSO Login

```
1. User clicks "Login" on optic.works
   ↓
2. Redirect to Hydra: /oauth2/auth?client_id=opticworks-store&...
   ↓
3. Hydra checks for existing session
   • Session exists → skip to step 7
   • No session → continue to step 4
   ↓
4. Hydra redirects to Login Provider: /login?challenge=abc123
   ↓
5. User enters email/password on login.optic.works
   ↓
6. Login Provider:
   a. POST /store/auth/customer/emailpass (Medusa) → verify
   b. GET /store/customers/me (Medusa) → fetch profile
   c. PUT /oauth2/auth/requests/login/accept (Hydra) → return identity
   ↓
7. Hydra redirects to Consent Provider: /consent?challenge=def456
   ↓
8. Consent Provider accepts (for first-party apps) or shows consent UI
   ↓
9. Hydra redirects back to app with authorization code:
   https://optic.works/auth/callback?code=xyz789
   ↓
10. App exchanges code for tokens:
    POST /oauth2/token
    • access_token (opaque, for Medusa API)
    • id_token (JWT, customer identity)
    • refresh_token (for long-lived sessions)
   ↓
11. App stores tokens in httpOnly cookie
   ↓
12. App uses access_token to call Medusa Store API
```

### Token Structure

**ID Token (JWT)**:
```json
{
  "iss": "https://auth.optic.works",
  "sub": "cust_01KAAHM9V8RAGARR1P00VDSRRK",  // Medusa customer ID
  "aud": "opticworks-store",
  "exp": 1763524525,
  "iat": 1763438125,
  "email": "customer@example.com",
  "email_verified": true,
  "name": "John Smith"
}
```

**Access Token** (opaque):
```
at_opticworks_2025_abc123def456...
```

Apps exchange this with Medusa for customer data:
```bash
curl -H "Authorization: Bearer at_opticworks_2025_abc123..." \
  https://api.optic.works/store/customers/me
```

### Security Model

**Authentication**:
- Same as Phase 3 (Medusa verifies credentials)
- Additional layer: Hydra manages sessions

**Authorization**:
- **OAuth scopes** define what apps can access:
  - `openid` - Basic identity
  - `profile` - Name, avatar
  - `email` - Email address
  - `orders` - Order history
  - `orders.read` - Read-only orders (for analytics)
  - `orders.write` - Create orders (for mobile app)
  - `warranties` - Warranty management

**Threat Model Improvements**:
| Phase 3 Risk | Phase 4 Mitigation |
|--------------|-------------------|
| Token reuse across apps | Scoped access tokens per app |
| No third-party access control | OAuth consent screens |
| No token revocation | Hydra revocation endpoint |
| Long-lived sessions | Refresh token rotation |

### Operational Characteristics

**New Infrastructure**:
```yaml
# docker-compose.hydra.yml
services:
  hydra:
    image: oryd/hydra:v2.2
    environment:
      URLS_SELF_ISSUER: https://auth.optic.works
      URLS_LOGIN: https://login.optic.works/login
      URLS_CONSENT: https://login.optic.works/consent
      DSN: postgres://hydra:${HYDRA_DB_PASSWORD}@postgres/hydra

  login-provider:
    build: ./services/login-provider
    environment:
      MEDUSA_URL: https://api.optic.works
      HYDRA_ADMIN_URL: http://hydra:4445
```

**Resource Requirements**:
- Hydra: ~256MB RAM, minimal CPU
- Login Provider: ~128MB RAM, minimal CPU
- Total overhead: <500MB RAM (very lightweight)

**Secrets Management**:
- Hydra system secret → Infisical (`HYDRA_SYSTEM_SECRET`)
- Hydra DB password → Infisical (`HYDRA_DB_PASSWORD`)
- OAuth client secrets → Infisical (`OAUTH_CLIENT_*`)

---

## Phase 5: Developer API (OAuth for Third Parties)

**Timeline**: Q3 2025
**Scope**: Enable third-party integrations

### Use Cases

1. **IoT Device Provisioning**
   - Smart home apps need to link OpticWorks sensors
   - OAuth flow: User logs in → app gets access token → app calls `/store/customers/me/devices`

2. **Analytics Integrations**
   - Sleep tracking apps read sensor data
   - Scoped token: `sensors.read` (read-only)

3. **Marketplace Apps**
   - Third-party firmware providers
   - Scoped token: `firmware.install` (device control)

### Architecture Extension

```
┌──────────────────────────────────────────────────────┐
│         Third-Party Developer App                    │
│           (smart-home-app.com)                       │
└────────────────────┬─────────────────────────────────┘
                     │ OAuth 2.0 Authorization Code Flow
                     ▼
┌──────────────────────────────────────────────────────┐
│              Ory Hydra                               │
│         (auth.optic.works)                           │
│                                                      │
│  User grants consent:                                │
│  "smart-home-app wants to:"                          │
│  ☑ Read your sensor data                            │
│  ☐ Control your devices                             │
└────────────────────┬─────────────────────────────────┘
                     │ scoped access token
                     ▼
┌──────────────────────────────────────────────────────┐
│         Medusa API Gateway                           │
│      (validates scopes, enforces rate limits)        │
│                                                      │
│  if (token.scope.includes('sensors.read')) {         │
│    return customer.sensors                           │
│  }                                                   │
└──────────────────────────────────────────────────────┘
```

### OAuth Scope Definitions

| Scope | Description | Sensitive? | Approval |
|-------|-------------|------------|----------|
| `openid` | User identity (sub, email) | No | Auto |
| `profile` | Name, avatar | No | Auto |
| `email` | Email address | Low | Auto |
| `orders.read` | View order history | Medium | User consent |
| `orders.write` | Create orders | High | User consent |
| `sensors.read` | Read sensor data | Medium | User consent |
| `sensors.write` | Configure sensors | High | User consent + 2FA |
| `firmware.install` | Install firmware | Critical | User consent + 2FA |

**Developer Portal**:
- Developers register apps at `developers.optic.works`
- Generate OAuth client credentials
- Monitor API usage, rate limits
- Request scope elevation (reviewed by OpticWorks team)

---

## Migration Strategy

### Phase 2 → Phase 3 (Medusa Auth)

**Customer Impact**: None (feature addition)

**Implementation Steps**:
1. Add login/signup UI to storefront
2. Add protected routes (`/account/*`)
3. Implement session middleware
4. Test with existing Medusa customer API

**Rollout**: Feature flag (`NEXT_PUBLIC_CUSTOMER_AUTH_ENABLED`)

**Rollback**: Disable feature flag, customers fall back to guest checkout

### Phase 3 → Phase 4 (Hydra SSO)

**Customer Impact**: Requires re-login once

**Migration Path**:
```
Old flow:                      New flow:
┌──────────────┐              ┌──────────────┐
│  medusa_token│              │ hydra_session│
│  (JWT cookie)│    ────▶     │ (OAuth token)│
└──────────────┘              └──────────────┘
```

**Implementation Steps**:

1. **Deploy Hydra + Login Provider** (parallel to existing auth)
   ```bash
   # Add to infrastructure/ansible/playbooks/hydra-provision.yml
   docker-compose -f docker-compose.hydra.yml up -d
   ```

2. **Dual-mode authentication** in storefront:
   ```typescript
   // Support both old JWT and new OAuth tokens during migration
   const token = request.cookies.get("hydra_session")
                 ?? request.cookies.get("medusa_token")
   ```

3. **Migrate existing sessions**:
   - Option A: Force re-login (simple, clean break)
   - Option B: Background migration (preserve sessions)
     ```typescript
     // Convert Medusa JWT → Hydra OAuth token
     if (hasOldToken && !hasNewToken) {
       const customerId = verifyJWT(oldToken)
       const oauthToken = await hydra.createSessionForUser(customerId)
       setCookie("hydra_session", oauthToken)
     }
     ```

4. **Cutover**:
   - Week 1: Deploy Hydra, dual-mode enabled
   - Week 2: Monitor adoption (% of sessions using OAuth)
   - Week 3: Deprecation notice for old JWT sessions
   - Week 4: Disable Medusa JWT auth, OAuth only

**Rollback**: Revert to Medusa JWT, Hydra remains deployed but unused

---

## Technology Selection

### Why Ory Hydra vs. Alternatives

| Solution | Self-Hosted | Lightweight | OAuth 2.0 | SSO | Verdict |
|----------|-------------|-------------|-----------|-----|---------|
| **Ory Hydra** | ✅ | ✅ | ✅ | ✅ | **Selected** |
| Authentik | ✅ | ❌ (heavy) | ✅ | ✅ | Too complex |
| Keycloak | ✅ | ❌ (JVM) | ✅ | ✅ | Resource-intensive |
| Auth0 | ❌ (SaaS) | ✅ | ✅ | ✅ | Not self-hosted |
| Supabase Auth | ⚠️ | ✅ | ⚠️ | ❌ | Limited OAuth |
| GoTrue | ✅ | ✅ | ⚠️ | ❌ | Limited features |

**Ory Hydra Advantages**:
- **Minimal footprint**: ~256MB RAM vs. Keycloak (2GB+)
- **Standards-compliant**: Full OAuth 2.0 + OIDC implementation
- **Flexible**: Works with any identity backend (Medusa in our case)
- **Production-ready**: Used by Raspberry Pi, Arduino, ThoughtWorks
- **Open source**: Apache 2.0 license, active development

**Tradeoffs**:
- Requires custom login/consent provider (but gives full UI control)
- No built-in user management UI (we use Medusa admin instead)

### Why Not Build Custom OAuth Server?

**Considered**: Implement OAuth 2.0 spec directly in Medusa

**Rejected because**:
- OAuth 2.0 has 10+ RFCs with subtle security requirements
- Token management, rotation, revocation is complex
- OIDC adds additional complexity (JWKs, discovery, userinfo)
- Maintenance burden (security patches, spec updates)
- Not core competency (OpticWorks sells hardware, not auth)

**Decision**: Use battle-tested Ory Hydra, focus engineering on product features

---

## Security Considerations

### Credential Storage

**Passwords**:
- Hashed via bcrypt in Medusa (`customers` table)
- Never transmitted to Hydra (verified by Login Provider)
- Stored only in Medusa PostgreSQL

**Tokens**:
- OAuth tokens stored in Hydra PostgreSQL
- Encrypted at rest (PostgreSQL TDE)
- Transmitted only over HTTPS

### Attack Surface Analysis

| Component | Attack Vector | Mitigation |
|-----------|---------------|------------|
| Login Provider | SSRF to Medusa | Allowlist Medusa URL, no user input in URLs |
| Hydra | Token theft | httpOnly cookies, short expiration, HTTPS only |
| Medusa | Credential stuffing | Rate limiting, email verification, 2FA (future) |
| OAuth clients | Client secret leak | Secret rotation, scope restrictions |

### Compliance

**GDPR**:
- Customer data stored in EU (Hetzner Germany)
- Right to erasure: Delete customer → Hydra sessions invalidated
- Data portability: Export via Medusa API

**CCPA**:
- Similar to GDPR (California residents)

**PCI DSS**:
- No credit cards stored (Stripe handles payment)
- OAuth tokens scoped to prevent payment access

---

## Observability

### Metrics

**Phase 3** (Medusa Auth):
```
medusa_auth_login_total{status="success|failure"}
medusa_auth_session_duration_seconds
medusa_auth_active_sessions
```

**Phase 4** (Hydra SSO):
```
hydra_oauth_requests_total{flow="authorize|token|refresh"}
hydra_oauth_errors_total{error_code="..."}
hydra_active_sessions{client_id="..."}
login_provider_verification_duration_seconds
```

### Logging

**Audit Log** (stored in Medusa):
```json
{
  "event": "customer.login",
  "customer_id": "cust_01KAA...",
  "timestamp": "2025-11-19T12:00:00Z",
  "ip_address": "192.0.2.1",
  "user_agent": "Mozilla/5.0...",
  "method": "emailpass",
  "success": true
}
```

### Alerting

- Failed login attempts > 100/min → Potential credential stuffing
- Hydra error rate > 1% → Service degradation
- Token refresh failures → Session corruption
- Unusual OAuth scope requests → Potential malicious app

---

## Cost Analysis

### Infrastructure Costs

**Phase 3** (Medusa only):
- **Additional cost**: $0 (uses existing Medusa infrastructure)

**Phase 4** (Hydra + Login Provider):
| Component | Resources | Monthly Cost (Hetzner) |
|-----------|-----------|----------------------|
| Hydra container | 256MB RAM, 0.5 vCPU | ~$2 |
| Login Provider | 128MB RAM, 0.5 vCPU | ~$2 |
| PostgreSQL (shared) | 500MB additional | $0 (shared with Medusa) |
| **Total incremental** | | **~$4/month** |

**Phase 5** (Developer API):
- No additional infrastructure (uses existing Hydra)
- Potential revenue from API usage fees

### Engineering Cost

**Phase 3**: ~2 weeks (1 engineer)
- Login/signup UI: 3 days
- Session middleware: 2 days
- Protected routes: 3 days
- Testing: 2 days

**Phase 4**: ~4 weeks (1-2 engineers)
- Hydra deployment: 1 week
- Login Provider: 1 week
- Multi-app integration: 1 week
- Migration tooling: 1 week

**Phase 5**: ~6 weeks (2 engineers)
- Developer portal: 2 weeks
- Scope enforcement: 2 weeks
- API gateway: 1 week
- Documentation: 1 week

---

## Open Questions

1. **2FA Implementation**: Where should TOTP/SMS verification live?
   - Option A: Login Provider (before returning identity to Hydra)
   - Option B: Medusa (verify 2FA code via Store API)
   - **Recommendation**: Option B (keeps auth logic in Medusa)

2. **Session Lifetime**: How long should OAuth sessions last?
   - Short (7 days): More secure, frequent re-auth
   - Long (30 days): Better UX, higher risk if device stolen
   - **Recommendation**: 7 days with "Remember Me" option (30 days)

3. **Mobile App Strategy**: Native OAuth or webview?
   - Native: Better UX, requires PKCE flow
   - Webview: Simpler, reuses web login UI
   - **Recommendation**: Native (industry standard)

4. **Discourse SSO**: Use OAuth or custom integration?
   - OAuth: Standard, requires Discourse OAuth plugin
   - DiscourseConnect: Simpler, Discourse-specific
   - **Recommendation**: OAuth (consistent with other apps)

---

## Success Metrics

**Phase 3**:
- [ ] 60%+ of purchases use customer accounts (vs. guest checkout)
- [ ] <1% login failure rate (excluding bad passwords)
- [ ] <200ms median authentication latency

**Phase 4**:
- [ ] 100% SSO adoption across all properties
- [ ] <5s end-to-end OAuth flow (authorization → token)
- [ ] Zero security incidents related to authentication

**Phase 5**:
- [ ] 10+ third-party apps registered
- [ ] 99.9% OAuth token issuance success rate
- [ ] <100ms scope validation latency

---

## References

### Standards
- [RFC 6749: OAuth 2.0 Authorization Framework](https://datatracker.ietf.org/doc/html/rfc6749)
- [RFC 7636: PKCE (Proof Key for Code Exchange)](https://datatracker.ietf.org/doc/html/rfc7636)
- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html)

### Ory Documentation
- [Ory Hydra Quickstart](https://www.ory.sh/docs/hydra/5min-tutorial)
- [Hydra Login & Consent Flow](https://www.ory.sh/docs/hydra/concepts/login-consent-flow)
- [Hydra Integration Guide](https://www.ory.sh/docs/hydra/guides/integration)

### Similar Architectures
- [Supabase Auth Architecture](https://supabase.com/docs/guides/auth)
- [Firebase Auth + Custom Backend](https://firebase.google.com/docs/auth/admin)
- [AWS Cognito + User Pools](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html)

### OpticWorks Context
- [RFD-005: Admin API Authentication](./archived/RFD-005.md) (Medusa JWT implementation)
- [KEY_MANAGEMENT.md](./KEY_MANAGEMENT.md) (Infisical secrets strategy)
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) (Hetzner infrastructure)

---

## Decision

**Status**: **Draft** - Awaiting stakeholder review

**Recommendation**:
- ✅ **Approve Phase 3** (Medusa Auth) - Low risk, high value, immediate implementation
- ⏸️ **Table Phase 4** (Hydra SSO) until forum launch timeline confirmed
- 📋 **Defer Phase 5** (Developer API) until customer demand validated

**Next Steps**:
1. Review this RFD with platform team
2. Create implementation plan for Phase 3
3. Prototype Hydra + Login Provider integration
4. Validate Discourse OAuth compatibility

**Reviewers**: @platform-engineering, @security, @product

---

**Last Updated**: 2025-11-19
**Changelog**:
- 2025-11-19: Initial draft (Phase 3-5 architecture)
