# E2E Testing

Playwright tests against https://optic.works.

---

## Running Tests

```bash
# All tests (chromium)
pnpm exec playwright test --project=chromium

# Specific file
pnpm exec playwright test e2e/tests/auth-flow.spec.ts --project=chromium

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
│   ├── test-data.ts        # Products, test cards, addresses
│   └── debug-utils.ts      # Screenshot/log capture
└── tests/
    ├── auth-flow.spec.ts
    ├── store-navigation.spec.ts
    ├── add-to-cart.spec.ts
    ├── checkout-flow.spec.ts
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
