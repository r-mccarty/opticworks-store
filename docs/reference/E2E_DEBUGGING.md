# Debugging Failed E2E Tests

This document explains how to investigate and resolve E2E test failures using the tooling built into the OpticWorks test suite.

## Overview

When an E2E test fails, you need to understand what happened across multiple layers:

```
┌─────────────────────────────────────────────────────────────────┐
│                      E2E Test (Playwright)                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ Console Logs    │  │ Network Logs    │  │ Screenshots     │  │
│  │ (browser JS)    │  │ (API calls)     │  │ (visual state)  │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
└───────────┼────────────────────┼────────────────────┼───────────┘
            │                    │                    │
            ▼                    ▼                    ▼
     What the browser      What API calls       What the user
     reported              were made             would see
            │                    │
            │                    ▼
            │         ┌─────────────────────────────────────────┐
            │         │           Backend (Medusa)               │
            │         │  ┌───────────────┐  ┌───────────────┐   │
            │         │  │ Structured    │  │ Sentry        │   │
            │         │  │ Logs (Pino)   │  │ (errors)      │   │
            │         │  └───────┬───────┘  └───────┬───────┘   │
            │         └──────────┼──────────────────┼───────────┘
            │                    │                  │
            ▼                    ▼                  ▼
     JavaScript error?    Request failed?    Exception thrown?
```

The key to efficient debugging is **correlation IDs** - unique identifiers that link a test run to its backend activity.

## Quick Start: Debugging a Failed Test

### 1. Find the Correlation ID

When a test fails, look for the correlation ID in the test output:

```
╔══════════════════════════════════════════════════════════════╗
║                    TEST FAILED - DEBUG INFO                   ║
╠══════════════════════════════════════════════════════════════╣
║ Correlation ID: e2e-checkout-flow-m1abc123-x7f2               ║
╠══════════════════════════════════════════════════════════════╣
║ Find backend logs:                                           ║
║   grep "e2e-checkout-flow-m1abc123-x7f2" \                    ║
║     /opt/opticworks/medusa-backend/logs/medusa-app.log       ║
╠══════════════════════════════════════════════════════════════╣
║ In Sentry, filter by tag:                                    ║
║   correlation_id:e2e-checkout-flow-m1abc123-x7f2             ║
╚══════════════════════════════════════════════════════════════╝
```

### 2. Check Playwright Report

Open the HTML report for detailed artifacts:

```bash
pnpm exec playwright show-report e2e-report
```

The report includes:
- **Screenshots** - Visual state at failure
- **Traces** - Step-by-step replay (click "Traces" tab)
- **Console logs** - Browser JavaScript output
- **Network logs** - All API requests and responses
- **Correlation summary** - Backend log commands

### 3. Find Backend Logs

Use the correlation ID to find all related backend activity:

```bash
# SSH to server and grep logs
ssh hetzner-node "grep 'e2e-checkout-flow-m1abc123-x7f2' \
  /opt/opticworks/medusa-backend/logs/medusa-app.log" | pnpm pino-pretty

# Or download and search locally
scp hetzner-node:/opt/opticworks/medusa-backend/logs/medusa-app.log ./
grep "e2e-checkout-flow-m1abc123-x7f2" medusa-app.log | pnpm pino-pretty
```

### 4. Check Sentry

If an error was thrown, find it in Sentry:

1. Go to Sentry dashboard
2. Filter by tag: `correlation_id:e2e-checkout-flow-m1abc123-x7f2`
3. Review stack trace and request context

## Using Correlation IDs in Tests

### Basic Setup

Add correlation tracking to your test:

```typescript
import { test, expect } from '@playwright/test';
import {
  createTestCorrelation,
  setupCorrelationInterceptor,
  attachCorrelationToReport,
} from '../helpers/correlation-id';
import { captureDebugInfo } from '../helpers/debug-utils';

test('checkout completes successfully', async ({ page }, testInfo) => {
  // Create correlation context for this test
  const correlation = createTestCorrelation(testInfo);

  // Intercept API requests and add correlation header
  await setupCorrelationInterceptor(page, correlation);

  // ... run your test ...

  try {
    await page.goto('/checkout');
    await expect(page.locator('[data-testid="success"]')).toBeVisible();
  } catch (error) {
    // On failure, capture all debug info including correlation
    await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'checkout-failed', correlation);
    throw error;
  }
});
```

### For Direct API Calls

When making direct fetch calls (e.g., in admin utilities):

```typescript
import { createCorrelatedFetch, getCorrelationHeaders } from '../helpers/correlation-id';

// Option 1: Use correlated fetch wrapper
const correlatedFetch = createCorrelatedFetch(correlation);
const response = await correlatedFetch('https://api.optic.works/admin/orders');

// Option 2: Add headers manually
const response = await fetch('https://api.optic.works/admin/orders', {
  headers: {
    ...getCorrelationHeaders(correlation),
    'Content-Type': 'application/json',
  },
});
```

## Debug Artifacts

### What Gets Captured

When `captureDebugInfo()` is called, these artifacts are attached to the test report:

| Artifact | Content | Use For |
|----------|---------|---------|
| `*-screenshot.png` | Full-page screenshot | Visual state at failure |
| `*-console-logs.json` | Browser console output | JavaScript errors |
| `*-network-logs.json` | All API requests/responses | API failures, timing |
| `*-localStorage.json` | Browser storage state | Cart/auth state |
| `*-url.txt` | Current page URL | Navigation issues |
| `*-html.html` | Page HTML snapshot | DOM state |
| `*-correlation.txt` | Correlation summary | Backend log commands |

### Viewing Artifacts

```bash
# Open Playwright HTML report
pnpm exec playwright show-report e2e-report

# Artifacts are also in e2e-results/ directory
ls e2e-results/
```

## Common Failure Patterns

### 1. Cart/Checkout State Issues

**Symptoms:**
- Cart shows empty after adding product
- Checkout form resets unexpectedly
- Payment fails with "cart not found"

**Debug Steps:**
1. Check `localStorage.json` for cart state
2. Check `network-logs.json` for cart API calls
3. Look for `400` or `404` responses on cart endpoints

```bash
# Find cart-related errors in backend
grep "correlation-id" logs/medusa-app.log | grep -i "cart" | pnpm pino-pretty
```

### 2. Payment Failures

**Symptoms:**
- Payment button does nothing
- "Payment failed" with no details
- Redirect to error page

**Debug Steps:**
1. Check console logs for Stripe errors
2. Check network logs for `/store/payment-collections` calls
3. Check backend logs for Stripe API errors

```bash
# Find payment errors
grep "correlation-id" logs/medusa-app.log | grep -E "(stripe|payment)" | pnpm pino-pretty
```

### 3. Shipping Rate Issues

**Symptoms:**
- "No shipping options" message
- Shipping rates don't load
- Wrong rates displayed

**Debug Steps:**
1. Check network logs for shipping rate requests
2. Verify address was sent correctly
3. Check EasyPost errors in backend

```bash
# Find shipping/EasyPost errors
grep "correlation-id" logs/medusa-app.log | grep -E "(shipping|easypost)" | pnpm pino-pretty
```

### 4. Timing/Race Conditions

**Symptoms:**
- Test passes locally, fails in CI
- Intermittent failures
- Element not found after navigation

**Debug Steps:**
1. Check Playwright trace for timing
2. Look for missing `waitFor` calls
3. Check network timing in logs

```bash
# View full request timeline
grep "correlation-id" logs/medusa-app.log | jq -c '{time, path, durationMs}' | sort
```

## Backend Log Analysis

### Log Format

Backend logs are structured JSON (Pino format):

```json
{
  "level": 30,
  "time": "2024-01-15T10:30:00.000Z",
  "correlationId": "e2e-checkout-m1abc123",
  "method": "POST",
  "path": "/store/carts",
  "statusCode": 200,
  "durationMs": 45,
  "msg": "POST /store/carts 200 45ms"
}
```

### Useful Queries

```bash
# All requests for a test
grep "e2e-checkout-m1abc123" logs/medusa-app.log | pnpm pino-pretty

# Only errors
grep "e2e-checkout-m1abc123" logs/medusa-app.log | jq 'select(.level >= 50)'

# Slow requests (>1s)
grep "e2e-checkout-m1abc123" logs/medusa-app.log | jq 'select(.durationMs > 1000)'

# Request timeline
grep "e2e-checkout-m1abc123" logs/medusa-app.log | \
  jq -r '[.time, .method, .path, .statusCode, .durationMs] | @tsv' | \
  sort

# Specific endpoint
grep "e2e-checkout-m1abc123" logs/medusa-app.log | grep "/store/carts" | pnpm pino-pretty
```

## CI Debugging

### GitHub Actions

In CI, artifacts are uploaded automatically:

1. Go to the failed workflow run
2. Scroll to "Artifacts" section
3. Download `e2e-report` and `e2e-results`

### Capturing Backend Logs in CI

Add a step to capture backend logs on failure:

```yaml
- name: Capture backend logs on failure
  if: failure()
  run: |
    ssh hetzner-node "tail -1000 /opt/opticworks/medusa-backend/logs/medusa-app.log" \
      > backend-logs.json

- name: Upload backend logs
  if: failure()
  uses: actions/upload-artifact@v4
  with:
    name: backend-logs
    path: backend-logs.json
```

## Best Practices

### 1. Always Use Correlation IDs

```typescript
// At the start of every test
const correlation = createTestCorrelation(testInfo);
await setupCorrelationInterceptor(page, correlation);
```

### 2. Capture Debug Info on Failure

```typescript
try {
  // test code
} catch (error) {
  await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'step-failed', correlation);
  throw error;
}
```

### 3. Use Descriptive Labels

```typescript
// Good - specific about what failed
await captureDebugInfo(..., 'step3-shipping-rates-not-loaded', correlation);

// Bad - generic
await captureDebugInfo(..., 'failed', correlation);
```

### 4. Check Both Client and Server

A 500 error in network logs means check the backend:
```bash
grep "correlation-id" logs/medusa-app.log | grep "level\":50" | pnpm pino-pretty
```

A JavaScript error in console logs means check the frontend:
```typescript
const errors = consoleLogs.errors.filter(e => !e.includes('favicon'));
```

## Reference

### Correlation ID Format

```
e2e-{test-name}-{timestamp}-{random}
```

Example: `e2e-checkout-flow-m1abc123-x7f2`

- `e2e-` - Prefix for easy grep filtering
- `checkout-flow` - Sanitized test name (max 30 chars)
- `m1abc123` - Base36 timestamp
- `x7f2` - Random suffix for uniqueness

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `E2E_BASE_URL` | Target site URL (default: https://optic.works) |
| `MEDUSA_ADMIN_EMAIL` | Admin API authentication |
| `MEDUSA_ADMIN_PASSWORD` | Admin API authentication |
| `MAILOSAUR_API_KEY` | Email verification testing |
| `MAILOSAUR_SERVER_ID` | Email routing domain |
| `HOOKDECK_API_KEY` | Webhook event verification |

### Related Documentation

- [E2E Testing Guide](./E2E_TESTING.md) - Test setup and patterns
- [Structured Logging](./LOGGING.md) - Backend log format
- [Observability](./OBSERVABILITY.md) - Monitoring overview
