# QA Artifact System

Automated generation of human-readable, data-oriented test artifacts for QA verification and debugging.

---

## Overview

Every E2E test run generates structured artifacts that capture:

- **Checkpoints**: Step-by-step test progression with timestamps
- **API Calls**: All network requests with request/response bodies
- **Tax Calculation**: Detailed tax breakdown with Stripe calculation IDs
- **Order Summary**: Verification that totals are mathematically correct
- **Screenshots**: Key moments captured as PNG images
- **Errors**: Failures with context and stack traces

Artifacts are generated for **all test runs** (not just failures) and stored in `e2e/artifacts/` (gitignored).

---

## File Structure

```
e2e/
├── artifacts/                              # Gitignored
│   ├── {test-name}-{timestamp}.json        # Structured JSON data
│   ├── {test-name}-{timestamp}.txt         # Human-readable report
│   └── screenshots/
│       └── {test-name}-{step}-{timestamp}.png
└── helpers/
    └── qa-artifact-logger.ts               # Artifact generation system
```

### File Naming

- **JSON**: `tax-is-calculated-after-address-entry-2025-12-11T14-30-45-123Z.json`
- **Report**: `tax-is-calculated-after-address-entry-2025-12-11T14-30-45-123Z.txt`
- **Screenshot**: `tax-is-calculated-after-address-entry-after-address-1733929845123.png`

---

## Artifact Types

### JSON Artifact (`*.json`)

Structured data for programmatic analysis:

```json
{
  "testName": "tax is calculated after address entry",
  "testFile": "checkout-tax.spec.ts",
  "timestamp": "2025-12-11T14:30:45.123Z",
  "duration": 45200,
  "outcome": "pass",
  "checkpoints": [
    {
      "step": 1,
      "name": "Add product to cart",
      "timestamp": "2025-12-11T14:30:45.123Z",
      "elapsedMs": 0,
      "data": { "product": "Bed Presence Sensor Kit", "price": 239 }
    }
  ],
  "apiCalls": [
    {
      "timestamp": "2025-12-11T14:30:47.234Z",
      "elapsedMs": 2111,
      "method": "POST",
      "url": "/store/carts",
      "status": 200,
      "duration": 156,
      "category": "cart"
    }
  ],
  "taxCalculation": {
    "address": { "city": "San Francisco", "state": "CA", "postalCode": "94105", "country": "US" },
    "subtotal": 239.00,
    "shippingCost": 6.21,
    "taxAmount": 21.45,
    "taxRate": 8.75
  },
  "orderSummary": {
    "items": [{ "name": "Bed Presence Sensor Kit", "quantity": 1, "price": 239 }],
    "subtotal": 239.00,
    "shipping": 6.21,
    "tax": 21.45,
    "total": 266.66,
    "verificationPassed": true
  },
  "screenshots": [
    { "step": "after-address", "timestamp": "2025-12-11T14:30:53.456Z", "path": "e2e/artifacts/screenshots/..." }
  ],
  "errors": []
}
```

### Human-Readable Report (`*.txt`)

Formatted text for QA review:

```
================================================================================
QA ARTIFACT REPORT
================================================================================
Test: checkout-tax.spec.ts > tax is calculated after address entry
Date: 2025-12-11T14:30:45.123Z
Duration: 45.2 seconds
Outcome: PASS

================================================================================
CHECKPOINTS
================================================================================
[1] Add product to cart (+0.0s)
    product: "Bed Presence Sensor Kit"
    price: 239

[2] Navigate to checkout (+2.3s)

[3] Fill shipping address (+8.5s)
    Address: 1 Market Street, San Francisco, CA 94105
    Screenshot: tax-is-calculated-after-address-after-address-1733929845123.png

[4] Wait for shipping rates (+12.1s)

[5] Select shipping rate (+14.2s)
    rateId: "so_xxx"

[6] Verify tax calculation (+16.8s)
    Screenshot: tax-is-calculated-after-tax-calculation-1733929847456.png

================================================================================
TAX CALCULATION DETAILS
================================================================================
Address: San Francisco, CA 94105, US
Subtotal: $239.00
Shipping: $6.21
Tax Amount: $21.45
Tax Rate: 8.75%

================================================================================
ORDER SUMMARY VERIFICATION
================================================================================
Subtotal:  $239.00
Shipping:  $6.21
Tax:       $21.45
Total:     $266.66
Math Check: PASS (239.00 + 6.21 + 21.45 = 266.66)

================================================================================
API CALLS
================================================================================
[14:30:47] POST /store/carts -> 200 (156ms)
[14:30:49] POST /store/carts/.../line-items -> 200 (234ms)
[14:30:52] POST /store/carts/... (update address) -> 200 (189ms)
[14:30:53] GET /store/shipping-options -> 200 (312ms)
[14:30:54] POST /store/carts/.../shipping-methods -> 200 (445ms)
[14:30:55] GET /store/carts/... -> 200 (89ms)
           Response: { tax_total: 21.45, total: 266.66 }

================================================================================
ERRORS
================================================================================
(none)

================================================================================
END OF REPORT
================================================================================
```

---

## Usage

### Basic Usage

```typescript
import { createQAArtifactLogger } from '../helpers/qa-artifact-logger';

test('my test', async ({ page }, testInfo) => {
  const qaLogger = createQAArtifactLogger(testInfo.title, testInfo.file || 'unknown');

  try {
    // Log checkpoints at key moments
    qaLogger.checkpoint('Add product to cart', { product: 'Widget', price: 99 });

    // ... test steps ...

    qaLogger.checkpoint('Fill shipping address');
    await qaLogger.captureScreenshot(page, 'after-address');

    // ... more steps ...

    // Finalize on success
    qaLogger.finalize('pass');
  } catch (error) {
    qaLogger.logError('test step', error as Error);
    await qaLogger.captureScreenshot(page, 'error');
    qaLogger.finalize('fail');
    throw error;
  }
});
```

### Recording Tax Details

```typescript
// After tax is calculated
const orderMath = await checkoutPage.verifyOrderSummaryMath();

qaLogger.setTaxCalculation({
  address: {
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94105',
    country: 'US',
  },
  subtotal: orderMath.subtotal,
  shippingCost: orderMath.shipping,
  taxAmount: orderMath.tax,
  taxRate: (orderMath.tax / orderMath.subtotal) * 100,
});

qaLogger.setOrderSummary({
  items: [{ name: 'Sensor Kit', quantity: 1, price: 239 }],
  subtotal: orderMath.subtotal,
  shipping: orderMath.shipping,
  tax: orderMath.tax,
  total: orderMath.total,
  verificationPassed: orderMath.isCorrect,
});
```

### API Reference

```typescript
class QAArtifactLogger {
  // Log a test checkpoint
  checkpoint(name: string, data?: Record<string, unknown>): void;

  // Log an API call (typically called by network logger)
  logApiCall(call: {
    method: string;
    url: string;
    status?: number;
    requestBody?: unknown;
    responseBody?: unknown;
    duration?: number;
  }): void;

  // Capture a screenshot
  async captureScreenshot(page: Page, stepName: string): Promise<string | undefined>;

  // Set tax calculation details
  setTaxCalculation(tax: {
    address: { city?: string; state?: string; postalCode?: string; country?: string };
    subtotal: number;
    shippingCost: number;
    taxAmount: number;
    taxRate?: number;
    calculationId?: string;
  }): void;

  // Set order summary verification
  setOrderSummary(summary: {
    items: Array<{ name: string; quantity: number; price: number }>;
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    verificationPassed: boolean;
  }): void;

  // Log an error
  logError(step: string, error: Error, screenshotPath?: string): void;

  // Finalize and write artifact files
  finalize(outcome: 'pass' | 'fail' | 'skip'): QAArtifact;

  // Generate human-readable report (called by finalize)
  generateReport(): string;
}
```

---

## Network Logger Integration

The network logger (`e2e/helpers/network-logger.ts`) extracts tax data from cart/order API responses:

```typescript
// Network logs now include tax data
const networkLogs = createNetworkLogger(page);

// After test completes
const latestTaxData = getLatestTaxData(networkLogs);
// Returns: { taxTotal: 21.45, total: 266.66, subtotal: 239, shippingTotal: 6.21 }

const taxSummary = getTaxDataSummary(networkLogs);
// Returns formatted string of all tax data captured
```

---

## Viewing Artifacts

### Playwright Report

Artifacts are automatically attached to test results:

```bash
pnpm exec playwright show-report
```

Navigate to a test and view attached artifacts (JSON and TXT files).

### Direct Access

```bash
# View latest report
cat e2e/artifacts/$(ls -t e2e/artifacts/*.txt | head -1)

# View specific test artifacts
ls e2e/artifacts/*tax*.txt

# View JSON for programmatic analysis
cat e2e/artifacts/*tax*.json | jq '.orderSummary'
```

### Screenshots

Screenshots are captured at key moments:

- After address entry
- After tax calculation
- Before payment submission
- On success/error

```bash
# View latest screenshot
open e2e/artifacts/screenshots/$(ls -t e2e/artifacts/screenshots/*.png | head -1)
```

---

## CI/CD Integration

### GitHub Actions

Artifacts are uploaded as part of test results:

```yaml
- name: Upload artifacts
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: e2e-artifacts
    path: e2e/artifacts/
    retention-days: 30
```

### Artifact Retention

- Local: Artifacts are gitignored, deleted on clean
- CI: Retained for 30 days (configurable)
- Playwright Report: Attached to HTML report

---

## Debugging with Artifacts

### Test Failure Analysis

1. Open the Playwright report: `pnpm exec playwright show-report`
2. Find the failed test
3. View attached artifacts (JSON/TXT)
4. Check screenshots at error step
5. Review API calls for failed requests
6. Check tax calculation details

### Common Issues

| Issue | What to Check |
|-------|---------------|
| Tax not calculated | API calls for cart response with tax_total |
| Wrong total | Order summary verification (math check) |
| Timeout | Checkpoints for slow steps |
| Payment failed | API calls for payment-related errors |

---

## Related Documentation

- [E2E_TESTING.md](./E2E_TESTING.md) - E2E test documentation
- [E2E_TESTING.md#qa-artifacts](./E2E_TESTING.md#qa-artifacts) - Quick reference
- [STRIPE_TAX.md](./STRIPE_TAX.md) - Stripe Tax implementation
