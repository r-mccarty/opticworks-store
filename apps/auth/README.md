# OpticWorks Authentication Service (Ory Hydra)

Ory Hydra OAuth2/OIDC server for JWT-based authentication across OpticWorks platform.

## Overview

This workspace contains the Ory Hydra deployment configuration and custom login/consent UI for the OpticWorks platform. Hydra provides centralized authentication for the storefront, admin dashboard, and Discourse forum.

## Why Ory Hydra?

- **Standards-Compliant**: OAuth2 and OpenID Connect certified
- **Self-Hosted**: Full control over user data and authentication
- **Lightweight**: Minimal resource usage
- **Production-Ready**: Battle-tested in enterprise environments
- **JWT Support**: Issues signed JWTs for stateless authentication

## Technology Stack

- **Auth Server**: Ory Hydra v2.x
- **Login/Consent UI**: Next.js application (custom)
- **Database**: PostgreSQL (shared with MedusaJS)
- **Deployment**: Docker on Hetzner VPS
- **TLS**: Let's Encrypt via nginx reverse proxy

## Architecture

```
┌─────────────┐
│  Storefront │
│  (Browser)  │
└──────┬──────┘
       │ 1. Login request
       ▼
┌─────────────────┐
│  Ory Hydra      │  OAuth2/OIDC Server
│  (Public API)   │  Port: 4444
└────────┬────────┘
         │ 2. Redirect to login
         ▼
┌─────────────────┐
│  Login UI       │  Custom Next.js app
│  (Port 3001)    │  Username/password form
└────────┬────────┘
         │ 3. Accept login
         ▼
┌─────────────────┐
│  Consent UI     │  Custom Next.js app
│  (Port 3001)    │  Permission approval
└────────┬────────┘
         │ 4. Accept consent
         ▼
┌─────────────────┐
│  Ory Hydra      │  Issue JWT
│  (Admin API)    │  Port: 4445
└────────┬────────┘
         │ 5. Return to client
         ▼
┌─────────────────┐
│  Storefront     │  Authenticated session
│  (with JWT)     │  HttpOnly cookies
└─────────────────┘
```

## Directory Structure

```
apps/auth/
├── hydra/
│   ├── config.yaml         # Hydra configuration
│   └── Dockerfile          # Hydra Docker image
├── login-consent-ui/
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/      # Login page
│   │   │   ├── consent/    # Consent page
│   │   │   └── error/      # Error handling
│   │   └── lib/
│   │       ├── hydra.ts    # Hydra SDK client
│   │       └── db.ts       # User database
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml      # Local development
├── deploy/
│   └── nginx.conf          # Nginx reverse proxy config
└── README.md
```

## Installation

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for login/consent UI development)
- PostgreSQL (or Docker)

### Local Setup

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Run Hydra migrations
docker-compose run hydra migrate sql -e --yes

# Start Hydra
docker-compose up -d hydra

# Start login/consent UI
cd login-consent-ui
pnpm install
pnpm run dev
```

## Environment Variables

### Ory Hydra

```bash
# Database
DSN=postgres://hydra:hydra@postgres:5432/hydra?sslmode=disable

# URLs
URLS_SELF_ISSUER=https://auth.opticworks.com
URLS_CONSENT=https://auth.opticworks.com/consent
URLS_LOGIN=https://auth.opticworks.com/login
URLS_ERROR=https://auth.opticworks.com/error

# Secrets (MUST change in production)
SECRETS_SYSTEM=change-this-to-a-secure-random-string-32-chars-minimum
SECRETS_COOKIE=change-this-to-a-secure-random-string-32-chars-minimum

# TTL
TTL_ACCESS_TOKEN=15m
TTL_REFRESH_TOKEN=720h  # 30 days
TTL_ID_TOKEN=1h
```

### Login/Consent UI

```bash
# Hydra Admin API
HYDRA_ADMIN_URL=http://localhost:4445

# Database (for user storage)
DATABASE_URL=postgresql://hydra:hydra@localhost:5432/hydra

# Session
SESSION_SECRET=change-this-to-a-secure-random-string

# Next.js
PORT=3001
```

## OAuth2 Clients

### Storefront Client

```bash
docker exec hydra \
  hydra clients create \
    --endpoint http://localhost:4445 \
    --id opticworks-storefront \
    --secret storefront-secret-change-me \
    --grant-types authorization_code,refresh_token \
    --response-types code \
    --scope openid,offline_access,profile,email \
    --callbacks https://opticworks.com/auth/callback
```

### Admin Dashboard Client

```bash
docker exec hydra \
  hydra clients create \
    --endpoint http://localhost:4445 \
    --id opticworks-admin \
    --secret admin-secret-change-me \
    --grant-types authorization_code,refresh_token \
    --response-types code \
    --scope openid,offline_access,admin \
    --callbacks https://admin.opticworks.com/auth/callback
```

### Discourse Forum Client

```bash
docker exec hydra \
  hydra clients create \
    --endpoint http://localhost:4445 \
    --id opticworks-forum \
    --secret forum-secret-change-me \
    --grant-types authorization_code,refresh_token \
    --response-types code \
    --scope openid,offline_access,profile,email \
    --callbacks https://forum.opticworks.com/auth/callback
```

## Login/Consent UI Implementation

### Login Flow

**1. User initiates login** → Redirected to `/login?login_challenge=xxx`

**2. Fetch login challenge**:
```typescript
import { HydraAdmin } from '@ory/hydra-client'

const hydra = new HydraAdmin({
  basePath: process.env.HYDRA_ADMIN_URL
})

const loginRequest = await hydra.getLoginRequest({
  loginChallenge: challenge
})
```

**3. Show login form** (username/password)

**4. Verify credentials**:
```typescript
import { verifyPassword } from '@/lib/auth'

const user = await getUserByEmail(email)
if (!user || !verifyPassword(password, user.passwordHash)) {
  return { error: 'Invalid credentials' }
}
```

**5. Accept login**:
```typescript
const acceptLogin = await hydra.acceptLoginRequest({
  loginChallenge: challenge,
  body: {
    subject: user.id,
    remember: true,
    rememberFor: 3600,
  }
})

// Redirect to consent
redirect(acceptLogin.redirect_to)
```

### Consent Flow

**1. User grants permissions** → Redirected to `/consent?consent_challenge=xxx`

**2. Fetch consent challenge**:
```typescript
const consentRequest = await hydra.getConsentRequest({
  consentChallenge: challenge
})
```

**3. Show consent form** (list of requested scopes)

**4. Accept consent**:
```typescript
const acceptConsent = await hydra.acceptConsentRequest({
  consentChallenge: challenge,
  body: {
    grantScope: consentRequest.requested_scope,
    grantAccessTokenAudience: consentRequest.requested_access_token_audience,
    session: {
      id_token: {
        email: user.email,
        name: user.name,
      }
    }
  }
})

// Redirect back to client
redirect(acceptConsent.redirect_to)
```

## User Database Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,  -- Hydra subject
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_subject ON user_sessions(subject);
```

## JWT Token Format

### Access Token Claims

```json
{
  "iss": "https://auth.opticworks.com",
  "sub": "user-uuid-here",
  "aud": ["opticworks-storefront"],
  "exp": 1672531200,
  "iat": 1672530300,
  "scope": "openid profile email",
  "client_id": "opticworks-storefront"
}
```

### ID Token Claims

```json
{
  "iss": "https://auth.opticworks.com",
  "sub": "user-uuid-here",
  "aud": ["opticworks-storefront"],
  "exp": 1672531200,
  "iat": 1672530300,
  "email": "user@example.com",
  "name": "John Doe",
  "email_verified": true
}
```

## Storefront Integration

### Authentication Flow

**1. Install OAuth2 client**:
```bash
pnpm add @ory/hydra-client
```

**2. Login route** (`/app/api/auth/login/route.ts`):
```typescript
import { redirect } from 'next/navigation'

export async function GET() {
  const params = new URLSearchParams({
    client_id: 'opticworks-storefront',
    response_type: 'code',
    scope: 'openid offline_access profile email',
    redirect_uri: 'https://opticworks.com/auth/callback',
    state: generateRandomState(),
  })

  redirect(`https://auth.opticworks.com/oauth2/auth?${params}`)
}
```

**3. Callback route** (`/app/api/auth/callback/route.ts`):
```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  // Exchange code for tokens
  const tokens = await fetch('https://auth.opticworks.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: 'opticworks-storefront',
      client_secret: process.env.OAUTH_CLIENT_SECRET,
      redirect_uri: 'https://opticworks.com/auth/callback',
    })
  }).then(r => r.json())

  // Store tokens in httpOnly cookies
  cookies().set('access_token', tokens.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 900, // 15 minutes
  })

  cookies().set('refresh_token', tokens.refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 2592000, // 30 days
  })

  redirect('/dashboard')
}
```

**4. Protected route middleware**:
```typescript
import { NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth'

export async function middleware(request: Request) {
  const accessToken = request.cookies.get('access_token')?.value

  if (!accessToken) {
    return NextResponse.redirect('/api/auth/login')
  }

  try {
    await verifyJWT(accessToken)
    return NextResponse.next()
  } catch (error) {
    // Try to refresh token
    return NextResponse.redirect('/api/auth/refresh')
  }
}
```

## Discourse SSO Integration

### Discourse Plugin Configuration

```ruby
# plugins/discourse-opticworks-sso/plugin.rb

enable_sso = true
enable_sso_provider = true
sso_url = https://auth.opticworks.com/oauth2/auth
sso_secret = shared-secret-between-discourse-and-hydra

sso_overrides_email = true
sso_overrides_username = true
sso_overrides_name = true
```

## Security Considerations

### Production Checklist

- [ ] Generate strong `SECRETS_SYSTEM` (32+ chars)
- [ ] Generate strong `SECRETS_COOKIE` (32+ chars)
- [ ] Use HTTPS for all endpoints
- [ ] Enable CSRF protection
- [ ] Set secure cookie flags (httpOnly, secure, sameSite)
- [ ] Implement rate limiting on login
- [ ] Enable account lockout after failed attempts
- [ ] Use bcrypt for password hashing (cost factor 12+)
- [ ] Implement password requirements
- [ ] Add 2FA/MFA support (TODO)
- [ ] Enable login audit logs
- [ ] Set up monitoring and alerts

### Token Security

- Short access token lifetime (15 minutes)
- Long refresh token lifetime (30 days)
- Refresh token rotation
- Token revocation on logout
- HttpOnly cookies for token storage

## Deployment

### Docker Compose (Production)

```yaml
version: '3.8'

services:
  hydra:
    image: oryd/hydra:v2.2
    ports:
      - "4444:4444"  # Public API
      - "4445:4445"  # Admin API
    environment:
      - DSN=postgres://hydra:${DB_PASSWORD}@postgres:5432/hydra
      - URLS_SELF_ISSUER=https://auth.opticworks.com
      - SECRETS_SYSTEM=${HYDRA_SYSTEM_SECRET}
      - SECRETS_COOKIE=${HYDRA_COOKIE_SECRET}
    command: serve all --dev
    depends_on:
      - postgres

  login-consent-ui:
    build: ./login-consent-ui
    ports:
      - "3001:3001"
    environment:
      - HYDRA_ADMIN_URL=http://hydra:4445
      - DATABASE_URL=postgres://hydra:${DB_PASSWORD}@postgres:5432/hydra
    depends_on:
      - hydra
```

### Nginx Reverse Proxy

```nginx
# auth.opticworks.com
server {
  listen 443 ssl http2;
  server_name auth.opticworks.com;

  ssl_certificate /etc/letsencrypt/live/auth.opticworks.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/auth.opticworks.com/privkey.pem;

  # Hydra Public API
  location /oauth2 {
    proxy_pass http://localhost:4444;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  # Login/Consent UI
  location / {
    proxy_pass http://localhost:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

## TODO: Implementation Checklist

### Phase 1: Hydra Setup
- [ ] Install Ory Hydra via Docker
- [ ] Configure PostgreSQL database
- [ ] Run Hydra migrations
- [ ] Test Hydra admin API
- [ ] Create OAuth2 clients (storefront, admin, forum)

### Phase 2: Login/Consent UI
- [ ] Create Next.js project for login/consent
- [ ] Implement login page
- [ ] Implement consent page
- [ ] Implement error page
- [ ] Set up user database schema
- [ ] Implement password hashing (bcrypt)
- [ ] Test login flow end-to-end

### Phase 3: Storefront Integration
- [ ] Add OAuth2 client to storefront
- [ ] Implement login route
- [ ] Implement callback route
- [ ] Implement refresh token route
- [ ] Implement logout route
- [ ] Add protected route middleware
- [ ] Test authentication flow

### Phase 4: Discourse Integration
- [ ] Configure Discourse SSO plugin
- [ ] Set up OAuth2 client for Discourse
- [ ] Test forum login via Hydra
- [ ] Verify user profile sync

### Phase 5: Security Hardening
- [ ] Generate production secrets
- [ ] Enable HTTPS
- [ ] Set secure cookie flags
- [ ] Implement rate limiting
- [ ] Add account lockout
- [ ] Set up audit logging
- [ ] Test token revocation

### Phase 6: Deployment
- [ ] Create production Docker Compose
- [ ] Set up nginx reverse proxy
- [ ] Configure SSL/TLS certificates
- [ ] Deploy to Hetzner VPS
- [ ] Set up monitoring
- [ ] Test production deployment

## Resources

- [Ory Hydra Documentation](https://www.ory.sh/docs/hydra/)
- [OAuth2 RFC 6749](https://tools.ietf.org/html/rfc6749)
- [OpenID Connect Spec](https://openid.net/specs/openid-connect-core-1_0.html)
- [JWT.io](https://jwt.io/)
- [Discourse SSO](https://meta.discourse.org/t/setup-discourseconnect-official-single-sign-on-for-discourse-sso/13045)

## Support

For authentication questions:
1. Check Ory Hydra documentation
2. Review OAuth2/OIDC specifications
3. See migration plan at `/docs/MIGRATION_PLAN.md`
