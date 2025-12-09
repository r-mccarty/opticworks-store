# E2E Testing

Playwright tests against https://optic.works.

---

## Running Tests

```bash
# All tests (chromium)
pnpm exec playwright test --project=chromium

# Specific file
pnpm exec playwright test e2e/tests/auth-flow.spec.ts --project=chromium

# Email tests (requires Mailosaur credentials)
source .env.local && pnpm exec playwright test email-flow.spec.ts

# UI mode (debugging)
pnpm exec playwright test --ui

# View report
pnpm exec playwright show-report
```

---

## Structure

```
e2e/
├── fixtures/
│   ├── page-objects/       # AuthPage, CartPage, CheckoutPage, etc.
│   ├── test-data.ts        # Products, test cards, addresses, mailosaurConfig
│   ├── email-utils.ts      # Mailosaur client and email verification helpers
│   └── debug-utils.ts      # Screenshot/log capture
├── helpers/
│   ├── console-capture.ts  # Console log capture for debugging
│   ├── network-logger.ts   # Network request/response logging
│   ├── storage-inspector.ts # LocalStorage inspection and clearing
│   └── debug-utils.ts      # Screenshot and debug info capture
└── tests/
    ├── auth-flow.spec.ts
    ├── store-navigation.spec.ts
    ├── add-to-cart.spec.ts
    ├── checkout-flow.spec.ts
    ├── checkout-shipping.spec.ts  # Shipping rate selection tests
    ├── email-flow.spec.ts   # Email verification tests (Mailosaur)
    └── full-journey.spec.ts
```

---

## Test Data

```typescript
// Products
testProducts.flagship  // Bed Presence Sensor Kit - $239

// Test cards
testCards.success      // 4242424242424242
testCards.decline      // 4000000000000002

// Unique email
generateTestEmail()    // e2e-test-{timestamp}@optic.works
```

---

## Page Objects

```typescript
// Auth
loginPage.login(email, password)
registerPage.register(email, password, firstName, lastName)

// Store
storePage.clickProduct(name)
productPage.addToCart()

// Cart
cartPage.proceedToPayment()

// Checkout
checkoutPage.fillShippingAddress(address)
checkoutPage.fillCardDetails(card)
checkoutPage.submitPayment()
checkoutPage.waitForSuccess()
```

---

## Configuration

- Base URL: `https://optic.works`
- Retries: 1
- Timeout: 60s
- Video/Trace: on-first-retry

---

## Common Issues

**Google Places autocomplete**: Dismiss with `Escape` key

**Stripe iframes**: Use `CheckoutPage` helpers for frame handling

**Cart hydration**: Wait for Zustand to load from localStorage

---

## Shipping Rate Tests

The `checkout-shipping.spec.ts` file contains tests for shipping rate selection:

### Running Shipping Tests

```bash
# All shipping tests
pnpm exec playwright test checkout-shipping.spec.ts --project=chromium

# Specific test
pnpm exec playwright test checkout-shipping.spec.ts --grep "calculated shipping" --project=chromium
```

### Available Shipping Tests

| Test | Description |
|------|-------------|
| `shipping rates load after entering address` | Verifies rates appear after address is entered |
| `user can select different shipping rates` | Verifies rate selection updates the cart |
| `complete checkout with shipping rate selection` | Full checkout flow including shipping |
| `shows error when shipping address is incomplete` | Verifies no rates without complete address |
| `calculated shipping prices are fetched correctly` | **Regression test** for NaN rates bug |

### Calculated Pricing Regression Test

The `calculated shipping prices are fetched correctly` test verifies the fix for a bug where shipping rates displayed as "NaN" instead of actual prices.

**What it verifies**:
1. Frontend calls `/store/shipping-options/{id}/calculate` for each option
2. API returns valid `calculated_amount` (number, not null/NaN)
3. UI displays the correct price (cents → dollars conversion)
4. Price in UI matches API response

**Background**: Medusa v2 calculated pricing requires a two-step API flow:
1. `GET /store/shipping-options` - Returns options with `calculated_price: null`
2. `POST /store/shipping-options/{id}/calculate` - Returns actual price from provider

See `docs/postmortems/2025-12-09-shipping-rates-nan.md` for full details.

### CheckoutPage Shipping Methods

```typescript
// Wait for rates to load
await checkoutPage.waitForShippingRates();

// Get available rate IDs
const rates = await checkoutPage.getAvailableShippingRates();

// Select a rate (waits for API call)
await checkoutPage.selectShippingRate(rates[0]);

// Get shipping cost from order summary
const cost = await checkoutPage.getShippingCost();

// Select and wait for payment session refresh
await checkoutPage.selectShippingAndWait(rateId);
```

---

## Email Testing with Mailosaur

E2E tests can verify that transactional emails (order confirmations, welcome emails) are actually sent and contain the expected content using [Mailosaur](https://mailosaur.com/).

### How It Works

1. **Mailosaur provides test email addresses**: Each test generates a unique email like `e2e-{timestamp}@{server-id}.mailosaur.net`
2. **Emails route to Mailosaur inbox**: Resend delivers to Mailosaur's servers
3. **Tests poll for email arrival**: Using the Mailosaur API with configurable timeout
4. **Content verification**: Tests verify subject, body content, and links

### Configuration

Required environment variables (stored in Infisical, pulled via `pnpm run secrets:pull`):

| Variable | Purpose |
|----------|---------|
| `MAILOSAUR_API_KEY` | Mailosaur API authentication |
| `MAILOSAUR_SERVER_ID` | Target server for test emails (e.g., `cgbbp7hh`) |

### Running Email Tests

```bash
# Pull secrets first (includes Mailosaur credentials)
pnpm run secrets:pull

# Run email tests
source .env.local && pnpm exec playwright test email-flow.spec.ts

# Run specific email test
source .env.local && pnpm exec playwright test email-flow.spec.ts --grep "order confirmation"
```

### Email Test Fixtures

```typescript
// Generate unique Mailosaur email
import { mailosaurConfig } from '../fixtures/test-data';
const testEmail = mailosaurConfig.generateEmail();
// Result: e2e-1765303536841-mqlo4l@cgbbp7hh.mailosaur.net

// Wait for email to arrive
import { waitForEmail, emailContainsText } from '../fixtures/email-utils';
const email = await waitForEmail(testEmail, {
  subject: 'Order Confirmation',
  timeout: 60000,  // 60 seconds
});

// Verify email content
expect(emailContainsText(email, 'Order Confirmed')).toBe(true);
expect(emailContainsText(email, productName)).toBe(true);

// Extract links from email
import { extractLinkFromEmail } from '../fixtures/email-utils';
const trackingLink = extractLinkFromEmail(email, 'Track Order');
```

### Available Email Tests

| Test | Description |
|------|-------------|
| `order confirmation email is sent after checkout` | Verifies order confirmation email arrives with correct content |
| `welcome email is sent after registration` | Verifies welcome email for new customers |
| `order confirmation email contains correct product details` | Detailed verification of email content (products, address, totals) |

### Email Utilities (`e2e/fixtures/email-utils.ts`)

| Function | Purpose |
|----------|---------|
| `waitForEmail(sentTo, options)` | Wait for email to arrive at address |
| `emailContainsText(email, text)` | Check if email body contains text |
| `extractLinkFromEmail(email, linkText)` | Extract URL from email by link text |
| `extractAllLinks(email)` | Get all links from email |
| `deleteAllMessages()` | Clear Mailosaur inbox between tests |
| `isMailosaurConfigured()` | Check if credentials are set |

### Graceful Degradation

When Mailosaur is not configured:
- Email tests are automatically skipped
- Fallback tests verify checkout completes without email verification
- No test failures due to missing credentials

### Debugging Email Issues

```bash
# Check Mailosaur inbox via API
source .env.local && curl -s "https://mailosaur.com/api/messages?server=$MAILOSAUR_SERVER_ID" \
  -u "$MAILOSAUR_API_KEY:" | jq '.items[] | {subject, from: .from[0].email, to: .to[0].email}'

# View full email content
source .env.local && curl -s "https://mailosaur.com/api/messages/{message-id}" \
  -u "$MAILOSAUR_API_KEY:" | jq '.'

# Delete all messages (useful before test runs)
source .env.local && curl -X DELETE "https://mailosaur.com/api/messages?server=$MAILOSAUR_SERVER_ID" \
  -u "$MAILOSAUR_API_KEY:"
```

### Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   E2E Test      │     │   Medusa        │     │   Resend        │
│   (Playwright)  │────▶│   Backend       │────▶│   Email API     │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
        │                                                 │
        │ Poll for email                                  │ Deliver
        ▼                                                 ▼
┌─────────────────┐                              ┌─────────────────┐
│   Mailosaur     │◀─────────────────────────────│   Mailosaur     │
│   API           │                              │   SMTP Server   │
└─────────────────┘                              └─────────────────┘
```

1. E2E test triggers checkout with Mailosaur email address
2. Medusa backend processes order and sends email via Resend
3. Resend delivers email to Mailosaur's SMTP servers
4. E2E test polls Mailosaur API until email arrives
5. Test verifies email content and passes/fails
