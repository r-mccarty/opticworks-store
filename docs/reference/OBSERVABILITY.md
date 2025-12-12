# Observability & Monitoring

This document describes the observability strategy for OpticWorks, covering error tracking, performance monitoring, and logging across both the Medusa backend and Next.js storefront.

## Architecture Overview

OpticWorks uses a **hybrid monitoring approach** that leverages the strengths of each platform:

| Layer | Tool | What It Captures |
|-------|------|------------------|
| Medusa Backend | **Sentry** | API errors, workflow failures, DB issues, distributed traces |
| Medusa Backend | **Pino (Structured Logging)** | JSON request logs, correlation IDs, performance metrics |
| Client-Side JS | **Sentry** | React errors, user sessions, source-mapped stack traces |
| Edge/Workers | **Cloudflare** | Request metrics, latency, CPU time, error rates |
| Infrastructure | **Cloudflare** | Cold starts, cache hits, bandwidth |

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Browser                              │
│                                                                  │
│  ┌──────────────────┐                                           │
│  │  Sentry Client   │ ← JavaScript errors, session replay       │
│  │  (client-side)   │                                           │
│  └────────┬─────────┘                                           │
└───────────┼─────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Cloudflare Edge Network                        │
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │ Workers Analytics │    │    Logpush       │                   │
│  │ (built-in)        │    │ (optional)       │                   │
│  └──────────────────┘    └──────────────────┘                   │
│                                                                  │
│  Captures: Request counts, latency, CPU time, error rates        │
└───────────┼─────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Medusa Backend (Hetzner)                      │
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │   Sentry Node    │    │  OpenTelemetry   │                   │
│  │   (server-side)  │    │  (tracing)       │                   │
│  └──────────────────┘    └──────────────────┘                   │
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │  Pino Logger     │    │  Correlation IDs │                   │
│  │  (JSON logs)     │    │  (x-correlation) │                   │
│  └──────────────────┘    └──────────────────┘                   │
│                                                                  │
│  Captures: API errors, workflow traces, DB queries, Redis ops    │
│  Logs: Structured JSON with request timing, context, correlation │
└─────────────────────────────────────────────────────────────────┘
```

## Sentry Integration

### Backend (Medusa v2)

Sentry is initialized in `backend/instrumentation.ts` which Medusa loads automatically at startup.

**Features enabled:**
- Error capturing with stack traces
- Performance monitoring (HTTP requests, DB queries)
- Workflow tracing via OpenTelemetry
- Express middleware auto-instrumentation
- PostgreSQL and Redis auto-instrumentation

**Key files:**
- `backend/instrumentation.ts` - Sentry initialization
- `backend/src/api/middlewares.ts` - Request context enrichment

**Environment variables:**
```bash
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_RELEASE=opticworks-backend@1.0.0  # Optional
```

**Sample rates:**
| Environment | Traces | Profiles |
|-------------|--------|----------|
| Development | 100% | 100% |
| Production | 20% | 20% |

### Frontend (Next.js)

The frontend uses Sentry for **client-side JavaScript errors only**. Server/edge monitoring is handled by Cloudflare's native tools.

**Features enabled:**
- Browser error tracking with source maps
- Session replay (10% of sessions, 100% on error)
- Performance monitoring (browser traces)
- Ad-blocker bypass via tunnel route

**Key files:**
- `sentry.client.config.ts` - Client-side configuration
- `sentry.server.config.ts` - Minimal server config (disabled)
- `src/app/global-error.tsx` - React error boundary
- `next.config.ts` - Sentry webpack configuration

**Environment variables:**
```bash
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=sntrys_xxx  # For source maps upload
SENTRY_ORG=opticworks
SENTRY_PROJECT=opticworks-storefront
```

**Why client-side only?**

The Next.js app runs on Cloudflare Workers which has limited Node.js API support. Rather than fight compatibility issues:
- Sentry handles client-side JS errors (where it excels)
- Cloudflare handles edge/server metrics (native, free, zero overhead)

## Cloudflare Monitoring

### Workers Analytics (Built-in)

Cloudflare automatically captures metrics for all Workers requests:

**Metrics available:**
- Request count and rate
- Error rate (4xx, 5xx responses)
- CPU time per request
- Request duration/latency
- Geographic distribution
- Cache hit ratio

**Access:** Cloudflare Dashboard → Workers & Pages → Your Worker → Analytics

### Web Analytics (Optional)

For Core Web Vitals and real-user monitoring:

1. Enable in Cloudflare Dashboard → Web Analytics
2. Add the auto-injected beacon (no code changes needed)

**Metrics:**
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
- Time to First Byte (TTFB)

### Logpush (Production)

For detailed request logging, enable Logpush to export to your preferred destination:

**Supported destinations:**
- Cloudflare R2
- AWS S3
- Google Cloud Storage
- Azure Blob Storage
- Datadog
- Splunk

**Setup:** Cloudflare Dashboard → Analytics → Logs → Add Logpush job

### Tail Workers (Development)

For real-time debugging during development:

```bash
wrangler tail opticworks-storefront
```

This streams live logs from your Worker, including:
- Request/response details
- Console.log output
- Uncaught exceptions

## Structured Logging (Backend)

The Medusa backend uses **Pino** for structured JSON logging with correlation ID support.

### Features

- **JSON format** in production for log aggregation tools
- **Pretty-printed** colored output in development
- **Correlation IDs** for request tracing across services
- **Automatic request/response logging** with timing
- **Sentry integration** - correlation IDs linked to Sentry errors
- **Sensitive data redaction** - passwords, tokens, API keys filtered

### Key Files

| File | Purpose |
|------|---------|
| `backend/src/lib/logger.ts` | Pino logger implementation |
| `backend/src/api/middlewares.ts` | Request logging middleware |
| `backend/medusa-config.ts` | Logger configuration |
| `backend/ecosystem.config.js` | PM2 log file configuration |

### Log Format

**Development (pretty-printed):**
```
[2024-01-15 10:30:00] INFO: POST /store/carts
    correlationId: "m1abc123"
    method: "POST"
    path: "/store/carts"
    type: "request"
    phase: "start"
```

**Production (JSON):**
```json
{"level":30,"time":"2024-01-15T10:30:00.000Z","service":"medusa-backend","env":"production","correlationId":"m1abc123","method":"POST","path":"/store/carts","type":"request","phase":"start","msg":"POST /store/carts"}
```

### Correlation IDs

Every request gets a unique correlation ID that:
- Is returned in the `x-correlation-id` response header
- Appears in all log entries for that request
- Is attached to Sentry errors for cross-referencing
- Can be passed from upstream (accepts `x-correlation-id` or `x-request-id` headers)

**Tracing a request:**
```bash
# Find all logs for a specific request
grep "m1abc123" /opt/opticworks/medusa-backend/logs/medusa-app.log

# In Sentry, filter by tag: correlation_id:m1abc123
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `LOG_LEVEL` | `debug` (dev) / `info` (prod) | Minimum log level |
| `LOG_FILE` | none (dev) / `./logs/medusa-app.log` (prod) | Write logs to file |
| `NODE_ENV` | `development` | Controls pretty vs JSON output |

### Log Levels

| Level | Value | Use Case |
|-------|-------|----------|
| `error` | 50 | Errors requiring attention |
| `warn` | 40 | Warnings, degraded functionality |
| `info` | 30 | Normal operations, requests |
| `debug` | 20 | Detailed debugging info |
| `trace` | 10 | Very verbose tracing |

### Using the Logger in Code

```typescript
// In API routes - use Medusa's injected logger
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve("logger")
  logger.info("Processing order")
  logger.error("Payment failed", new Error("Card declined"))
}

// In modules/services - inject via constructor
import { Logger } from "@medusajs/framework/types"

class MyService {
  constructor({ logger }: { logger: Logger }) {
    this.logger = logger
  }
}

// For structured context (advanced) - use createChildLogger
import { createChildLogger } from "../lib/logger"

const orderLogger = createChildLogger({ module: "orders" })
orderLogger.pino.info({ orderId: "123", total: 99.99 }, "Order created")
```

### PM2 Log Locations

The Medusa backend uses PM2 for process management:

**Log locations:**
```
/opt/opticworks/medusa-backend/logs/medusa-app.log  # Structured JSON logs
/opt/opticworks/medusa-backend/logs/pm2-prod-error.log  # PM2 errors
/opt/opticworks/medusa-backend/logs/pm2-prod-out.log    # PM2 stdout
```

**View logs:**
```bash
# Raw JSON logs
ssh hetzner-node "tail -f /opt/opticworks/medusa-backend/logs/medusa-app.log"

# Pretty-print JSON logs
ssh hetzner-node "tail -f /opt/opticworks/medusa-backend/logs/medusa-app.log" | pnpm pino-pretty

# Via PM2
ssh hetzner-node "pm2 logs medusa-prod"

# Filter by correlation ID
ssh hetzner-node "grep 'm1abc123' /opt/opticworks/medusa-backend/logs/medusa-app.log | pnpm pino-pretty"
```

**Log rotation:** Handled by PM2's built-in rotation (configured in `ecosystem.config.js`)

## Setting Up Sentry

### 1. Create Sentry Projects

1. Sign up at https://sentry.io
2. Create organization: `opticworks`
3. Create two projects:
   - `opticworks-backend` (Platform: Node.js)
   - `opticworks-storefront` (Platform: Browser JavaScript)

### 2. Get DSN Values

For each project:
1. Go to Settings → Projects → [Project] → Client Keys (DSN)
2. Copy the DSN value

### 3. Generate Auth Token

For source maps upload:
1. Go to Settings → Auth Tokens
2. Create new token with scopes: `project:releases`, `org:read`
3. Save as `SENTRY_AUTH_TOKEN`

### 4. Add to Infisical

Add these secrets to Infisical for each environment:

| Secret | Environment | Description |
|--------|-------------|-------------|
| `SENTRY_DSN` | prod | Backend Sentry DSN |
| `NEXT_PUBLIC_SENTRY_DSN` | prod | Frontend Sentry DSN |
| `SENTRY_AUTH_TOKEN` | prod | Source maps upload token |

### 5. Deploy

**Backend:**
```bash
cd infrastructure/ansible
bash scripts/generate-secrets-from-infisical.sh
ansible-playbook -i inventory/production.ini playbooks/medusa-deploy.yml
```

**Frontend:**
Push to `main` branch. Cloudflare Pages will pick up the env vars from the dashboard.

## Testing the Integration

### Backend

```bash
cd backend
SENTRY_DSN="your-dsn" pnpm dev

# In another terminal, trigger an error:
curl http://localhost:9000/store/products/invalid-id
```

Check Sentry dashboard for the captured error.

### Frontend

```bash
NEXT_PUBLIC_SENTRY_DSN="your-dsn" pnpm dev
```

Open browser console and run:
```javascript
throw new Error("Test Sentry integration")
```

Check Sentry dashboard for the captured error with source maps.

## Alerts & Notifications

### Sentry Alerts

Configure in Sentry Dashboard → Alerts:

**Recommended alerts:**
1. **Error spike** - When error count increases 200% in 5 minutes
2. **New issue** - When a new error type appears
3. **High-volume issue** - When an issue affects >100 users

**Notification channels:**
- Email (default)
- Slack integration
- PagerDuty integration

### Cloudflare Notifications

Configure in Cloudflare Dashboard → Notifications:

**Recommended alerts:**
- Workers error rate spike
- High CPU time warnings
- Origin server errors (5xx)

## Debugging Workflows

### Client-Side Error

1. Check Sentry → Issues for the error
2. Review stack trace with source maps
3. Check session replay (if available)
4. Review breadcrumbs for user actions leading to error

### Edge/Server Error

1. Check Cloudflare Analytics for error rate spike
2. Use `wrangler tail` for real-time logs
3. Check Cloudflare → Workers → Logs for request details
4. If error propagates to backend, check Sentry backend project

### Backend Error

1. Check Sentry → Issues for the error
2. Note the `correlation_id` tag in Sentry
3. Find related logs using correlation ID:
   ```bash
   # Find all logs for this request
   ssh hetzner-node "grep 'CORRELATION_ID' /opt/opticworks/medusa-backend/logs/medusa-app.log | pnpm pino-pretty"
   ```
4. Review stack trace and request context in Sentry
5. For workflow errors, check Sentry Performance → Traces
6. Check PM2 wrapper logs if needed:
   ```bash
   ssh hetzner-node "pm2 logs medusa-prod --lines 100"
   ```

## Cost Considerations

| Service | Free Tier | Notes |
|---------|-----------|-------|
| Sentry | 5K errors/month | Sufficient for low-traffic sites |
| Cloudflare Analytics | Unlimited | Built into Workers |
| Cloudflare Web Analytics | Unlimited | Free add-on |
| Cloudflare Logpush | Pay-as-you-go | Only if needed |

## Sensitive Data Filtering

### Sentry (Error Tracking)

Both Sentry configs filter sensitive data:

**Filtered headers:**
- `authorization`
- `cookie`
- `x-api-key`

**Filtered from session replay:**
- All text (masked)
- All media (blocked)

**Filtered from breadcrumbs:**
- Request bodies (may contain PII)

To add custom filtering, update `beforeSend` in the Sentry configs.

### Pino Logger (Structured Logs)

The Pino logger automatically redacts sensitive fields:

**Redacted fields (removed from logs):**
- `password`
- `token`
- `api_key` / `apiKey`
- `authorization`
- `cookie`
- `req.headers.authorization`
- `req.headers.cookie`
- `res.headers.set-cookie`

To add custom redaction, update the `redact` config in `backend/src/lib/logger.ts`.
