# Structured Logging

This document explains how logging works in the OpticWorks Medusa backend, including the Medusa Logger interface, our Pino-based implementation, and best practices.

## How Medusa Logging Works

Medusa v2 uses a **dependency-injected logger** pattern. The logger is:

1. **Configured** in `medusa-config.ts` via the `logger` property
2. **Registered** in Medusa's dependency injection container at startup
3. **Resolved** by services, API routes, and subscribers via `container.resolve("logger")`

```
┌─────────────────────────────────────────────────────────────────┐
│                     medusa-config.ts                             │
│                                                                  │
│   import { logger } from './src/lib/logger'                     │
│   defineConfig({ logger, ... })                                  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Medusa Container                                │
│                                                                  │
│   container.register("logger", logger)                          │
└─────────────────────┬───────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
┌───────────┐  ┌───────────┐  ┌───────────┐
│ API Route │  │  Service  │  │Subscriber │
│           │  │           │  │           │
│ req.scope │  │ container │  │ container │
│ .resolve  │  │ .resolve  │  │ .resolve  │
│ ("logger")│  │ ("logger")│  │ ("logger")│
└───────────┘  └───────────┘  └───────────┘
```

## The Logger Interface

Medusa's `Logger` interface (from `@medusajs/framework/types`) defines 16 required methods:

### Core Logging Methods

| Method | Purpose | Example |
|--------|---------|---------|
| `info(message)` | Normal operations | `logger.info("Order created")` |
| `warn(message)` | Warnings | `logger.warn("Stock running low")` |
| `error(message, error?)` | Errors | `logger.error("Payment failed", err)` |
| `debug(message)` | Debug info | `logger.debug("Cache hit")` |

### Extended Logging Methods

| Method | Purpose | Pino Mapping |
|--------|---------|--------------|
| `silly(message)` | Very verbose | `trace` |
| `verbose(message)` | Verbose | `debug` with `{verbose: true}` |
| `http(message)` | HTTP-specific | `debug` with `{type: "http"}` |
| `log(...args)` | Generic (like console.log) | `info` |

### Activity Tracking Methods

These methods support long-running operations with progress tracking:

```typescript
// Start an activity
const activityId = logger.activity("Importing products")

// Update progress
logger.progress(activityId, "Processed 50 of 100 items")

// Complete with success or failure
logger.success(activityId, "Import complete")
// or
logger.failure(activityId, "Import failed")
```

### Control Methods

| Method | Purpose |
|--------|---------|
| `panic(data)` | Log fatal error and exit process |
| `shouldLog(level)` | Check if a level would be logged |
| `setLogLevel(level)` | Change log level at runtime |
| `unsetLogLevel()` | Reset to default log level |

## Our Pino Implementation

We use [Pino](https://getpino.io/) for structured JSON logging. Key features:

### File Structure

```
backend/
├── src/lib/logger.ts       # Pino logger implementation
├── src/api/middlewares.ts  # Request logging middleware
├── medusa-config.ts        # Logger configuration
└── ecosystem.config.js     # PM2 log file settings
```

### Classes

```typescript
// MedusaLogger - Implements all 16 Logger interface methods
class MedusaLogger implements Logger {
  panic(data): void
  shouldLog(level): boolean
  setLogLevel(level): void
  unsetLogLevel(): void
  activity(message, config?): string
  progress(activityId, message): void
  error(messageOrError, error?): void
  failure(activityId, message): unknown
  success(activityId, message): Record<string, unknown>
  silly(message): void
  debug(message): void
  verbose(message): void
  http(message): void
  info(message): void
  warn(message): void
  log(...args): void
}

// StructuredLogger - Extends with Pino-specific features
class StructuredLogger extends MedusaLogger {
  get pino(): PinoLogger              // Access underlying Pino
  infoWithContext(ctx, msg): void     // Log with structured context
  warnWithContext(ctx, msg): void
  errorWithContext(ctx, msg, err?): void
  debugWithContext(ctx, msg): void
  child(bindings): StructuredLogger   // Create child logger
}
```

### Log Levels

| Level | Pino Value | When to Use |
|-------|------------|-------------|
| `fatal` | 60 | Unrecoverable errors (triggers shutdown) |
| `error` | 50 | Errors requiring attention |
| `warn` | 40 | Warnings, degraded functionality |
| `info` | 30 | Normal operations, requests |
| `debug` | 20 | Detailed debugging info |
| `trace` | 10 | Very verbose tracing |

### Output Formats

**Development** (pretty-printed):
```
[2024-01-15 10:30:00] INFO (medusa-backend): POST /store/carts
    correlationId: "m1abc123"
    method: "POST"
    path: "/store/carts"
    type: "request"
    phase: "start"
```

**Production** (JSON):
```json
{
  "level": 30,
  "time": "2024-01-15T10:30:00.000Z",
  "service": "medusa-backend",
  "env": "production",
  "correlationId": "m1abc123",
  "method": "POST",
  "path": "/store/carts",
  "type": "request",
  "phase": "start",
  "msg": "POST /store/carts"
}
```

## Usage Examples

### In API Routes

```typescript
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve("logger")

  logger.info("Creating order")

  try {
    // ... create order
    logger.info("Order created successfully")
  } catch (error) {
    logger.error("Failed to create order", error)
    throw error
  }
}
```

### In Services/Modules

```typescript
import { Logger } from "@medusajs/framework/types"

type InjectedDependencies = {
  logger: Logger
}

class MyService {
  private logger: Logger

  constructor({ logger }: InjectedDependencies) {
    this.logger = logger
  }

  async processOrder(orderId: string) {
    this.logger.info(`Processing order ${orderId}`)
  }
}
```

### In Subscribers

```typescript
import { SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function orderCreatedHandler({ container }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  logger.info("Order created event received")
}

export const config: SubscriberConfig = {
  event: "order.created",
}
```

### With Structured Context (Advanced)

```typescript
import { createChildLogger } from "../lib/logger"

// Create a child logger with bound context
const orderLogger = createChildLogger({
  module: "orders",
  orderId: "ord_123"
})

// All logs include the bound context
orderLogger.pino.info({ total: 99.99 }, "Order processed")
// Output: {"module":"orders","orderId":"ord_123","total":99.99,"msg":"Order processed"}
```

### Activity Tracking

```typescript
export default async function importProductsJob({ container }) {
  const logger = container.resolve("logger")

  const activityId = logger.activity("Importing products from CSV")

  try {
    for (let i = 0; i < products.length; i++) {
      await importProduct(products[i])
      logger.progress(activityId, `Imported ${i + 1} of ${products.length}`)
    }
    logger.success(activityId, `Imported ${products.length} products`)
  } catch (error) {
    logger.failure(activityId, `Import failed: ${error.message}`)
    throw error
  }
}
```

## Correlation IDs

Every HTTP request gets a unique correlation ID for tracing:

### How It Works

1. **Middleware** generates or accepts correlation ID from headers
2. **ID attached** to request object and response header
3. **All logs** for that request include the correlation ID
4. **Sentry errors** tagged with correlation ID for cross-referencing

### Headers

| Header | Purpose |
|--------|---------|
| `x-correlation-id` | Primary correlation ID header |
| `x-request-id` | Alternative (accepted on incoming requests) |

### Tracing a Request

```bash
# 1. Make a request and note the correlation ID
curl -i https://api.optic.works/store/products
# Response includes: x-correlation-id: m1abc123

# 2. Find all logs for that request
ssh hetzner-node "grep 'm1abc123' /opt/opticworks/medusa-backend/logs/medusa-app.log"

# 3. In Sentry, filter by tag
# correlation_id:m1abc123
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `LOG_LEVEL` | `debug` (dev) / `info` (prod) | Minimum log level |
| `LOG_FILE` | none (dev) / `./logs/medusa-app.log` (prod) | Write logs to file |
| `NODE_ENV` | `development` | Controls pretty vs JSON output |

### Changing Log Level at Runtime

```typescript
const logger = container.resolve("logger")

// Temporarily enable debug logging
logger.setLogLevel("debug")

// ... do something

// Reset to default
logger.unsetLogLevel()
```

## Sensitive Data Handling

The logger automatically redacts sensitive fields:

| Field | Action |
|-------|--------|
| `password` | Removed |
| `token` | Removed |
| `api_key` / `apiKey` | Removed |
| `authorization` | Removed |
| `cookie` | Removed |
| `req.headers.authorization` | Removed |
| `req.headers.cookie` | Removed |
| `res.headers.set-cookie` | Removed |

To add custom redaction, edit the `redact` config in `backend/src/lib/logger.ts`.

## Viewing Logs

### Development

Logs are pretty-printed to stdout:
```bash
cd backend && pnpm dev
```

### Production

```bash
# Raw JSON logs
ssh hetzner-node "tail -f /opt/opticworks/medusa-backend/logs/medusa-app.log"

# Pretty-print JSON logs
ssh hetzner-node "tail -f /opt/opticworks/medusa-backend/logs/medusa-app.log" | pnpm pino-pretty

# Filter by level (errors only)
ssh hetzner-node "cat /opt/opticworks/medusa-backend/logs/medusa-app.log" | jq 'select(.level >= 50)'

# Filter by correlation ID
ssh hetzner-node "grep 'm1abc123' /opt/opticworks/medusa-backend/logs/medusa-app.log" | pnpm pino-pretty

# PM2 wrapper logs
ssh hetzner-node "pm2 logs medusa-prod"
```

## Integration with Sentry

The logger integrates with Sentry for error correlation:

1. **Correlation ID** added to Sentry context on each request
2. **Tagged** with `correlation_id` for filtering
3. **Errors** can be traced back to specific request logs

```typescript
// In middlewares.ts
Sentry.setContext("request", {
  url: req.url,
  method: req.method,
  correlationId: req.correlationId,
})
Sentry.setTag("correlation_id", req.correlationId)
```

## Best Practices

### Do

- Use structured context for searchability: `logger.info({ orderId, customerId }, "Order created")`
- Include relevant IDs in error logs
- Use appropriate log levels (don't log debug info at info level)
- Let errors propagate to Sentry (don't swallow them)

### Don't

- Log sensitive data (passwords, tokens, full credit card numbers)
- Log at inappropriate levels (e.g., `info` for every cache hit)
- Use `console.log` - always use the injected logger
- Create new logger instances - use `container.resolve("logger")`

## Troubleshooting

### Logs Not Appearing

1. Check `LOG_LEVEL` - might be set too high
2. Check `NODE_ENV` - affects output format
3. Check `LOG_FILE` path and permissions

### JSON Parse Errors in Log File

The log file may have been corrupted. Check for:
- Multiple processes writing to the same file
- Disk full conditions
- Process crashes mid-write

### Correlation IDs Not Matching

Ensure the request logging middleware runs before your route handlers. Check middleware order in `src/api/middlewares.ts`.
