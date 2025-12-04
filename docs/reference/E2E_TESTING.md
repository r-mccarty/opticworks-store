# E2E Testing Reference

This document describes the end-to-end testing setup for the OpticWorks storefront.

## Overview

E2E tests run against the production site (optic.works) using Playwright. Tests verify critical user flows including authentication, store navigation, cart management, and checkout.

## Running Tests

```bash
# Run all tests (chromium only for speed)
pnpm exec playwright test --project=chromium

# Run specific test file
pnpm exec playwright test e2e/tests/auth-flow.spec.ts --project=chromium

# Run with UI mode for debugging
pnpm exec playwright test --ui

# View test report
pnpm exec playwright show-report
```

## Test Structure

```
e2e/
├── fixtures/
│   ├── page-objects/       # Page Object Model classes
│   │   ├── auth-page.ts    # LoginPage, RegisterPage, ForgotPasswordPage, AccountPage
│   │   ├── cart-page.ts    # CartPage
│   │   ├── checkout-page.ts # CheckoutPage (Stripe integration)
│   │   ├── product-page.ts # ProductPage
│   │   └── store-page.ts   # StorePage
│   ├── test-data.ts        # Test products, credentials, addresses, cards
│   └── debug-utils.ts      # Screenshot/log capture utilities
└── tests/
    ├── auth-flow.spec.ts       # Authentication tests
    ├── store-navigation.spec.ts # Store/product navigation
    ├── add-to-cart.spec.ts     # Cart functionality
    ├── checkout-flow.spec.ts   # Payment flow
    └── full-journey.spec.ts    # Complete user journeys
```

## Test Coverage

### Authentication (`auth-flow.spec.ts`) - 9 tests

| Test | Description |
|------|-------------|
| user can register a new account | Creates account with unique email |
| registration shows error for weak password | Validates password requirements |
| user can login with valid credentials | Login flow with redirect |
| login shows error for invalid credentials | Error handling for bad login |
| unauthenticated user is redirected from account page | Auth guard verification |
| forgot password page loads and accepts email | Password reset request |
| forgot password link from login page works | Navigation verification |
| login page links to register page | Navigation verification |
| register page links to login page | Navigation verification |

### Store Navigation (`store-navigation.spec.ts`) - 7 tests

| Test | Description |
|------|-------------|
| store page displays products | Products load on /store |
| product links use correct slug format | URLs use handles not UUIDs |
| clicking product navigates to product detail page | Store → product navigation |
| flagship product page loads correctly | Product page content |
| product detail page shows add to cart button | Add to cart availability |
| navigate store -> product -> cart flow | Multi-step navigation |
| all store products are accessible (no 404s) | Validates all product pages |

### Add to Cart (`add-to-cart.spec.ts`) - 5 tests

| Test | Description |
|------|-------------|
| can add flagship product to cart | Basic add to cart |
| cart shows correct item count after adding product | Cart counter updates |
| can view cart after adding product | Cart page displays items |
| should display correct product info on cart page | Product details in cart |
| debug: capture full page state | Debug utility test |

### Checkout Flow (`checkout-flow.spec.ts`) - 3 tests

| Test | Description |
|------|-------------|
| complete checkout with test card | Full payment flow with Stripe |
| checkout page loads with cart items | Checkout initialization |
| debug: capture full checkout initialization | Debug utility test |

### Full Journey (`full-journey.spec.ts`) - 3 tests

| Test | Description |
|------|-------------|
| complete journey: browse -> cart -> checkout (guest) | Guest checkout flow |
| complete journey: register -> browse -> cart -> checkout | Registered user flow (skipped - flaky) |
| verify store navigation doesn't cause 404s | Product page accessibility |
| cart persists across navigation | Cart state persistence |

## Page Objects

### AuthPage Classes

```typescript
// LoginPage
loginPage.goto()
loginPage.fillEmail(email)
loginPage.fillPassword(password)
loginPage.submit()
loginPage.login(email, password)
loginPage.getErrorMessage()
loginPage.waitForRedirect(path)

// RegisterPage
registerPage.goto()
registerPage.fillForm(email, password, firstName, lastName, confirmPassword?)
registerPage.submit()
registerPage.register(email, password, firstName, lastName)
registerPage.getErrorMessage()

// ForgotPasswordPage
forgotPasswordPage.goto()
forgotPasswordPage.fillEmail(email)
forgotPasswordPage.submit()
forgotPasswordPage.requestReset(email)
forgotPasswordPage.waitForSuccess()
forgotPasswordPage.isSuccessVisible()

// AccountPage
accountPage.goto()
accountPage.waitForLoaded()
accountPage.isAuthenticated()
accountPage.logout()
```

### StorePage

```typescript
storePage.goto()
storePage.waitForProducts()
storePage.getProductCount()
storePage.clickProduct(name)
storePage.clickProductByIndex(index)
storePage.getAllProductHrefs()
```

### ProductPage

```typescript
productPage.goto(slug)
productPage.waitForProduct()
productPage.addToCart()
productPage.getProductName()
productPage.getProductPrice()
```

### CartPage

```typescript
cartPage.goto()
cartPage.waitForCartHydration()
cartPage.hasItems()
cartPage.getItemCount()
cartPage.proceedToPayment()
```

### CheckoutPage

```typescript
checkoutPage.waitForCheckoutReady()
checkoutPage.waitForStripeElements()
checkoutPage.fillEmail(email)
checkoutPage.fillShippingAddress(address)
checkoutPage.fillCardDetails(card)
checkoutPage.submitPayment()
checkoutPage.waitForSuccess(timeout?)
```

## Test Data

```typescript
// Products (from test-data.ts)
testProducts.flagship  // Bed Presence Sensor Kit - $239
testProducts.duo       // Presence Sensor Duo Pack - $449
testProducts.prism     // Optic 1x Prism - $149

// Stripe test cards
testCards.success      // 4242424242424242 - succeeds
testCards.decline      // 4000000000000002 - declines
testCards.requires3DS  // 4000002500003155 - requires auth
testCards.insufficientFunds // 4000000000009995 - fails

// Generate unique test email
generateTestEmail() // e2e-test-{timestamp}-{random}@optic.works
```

## Debug Utilities

When tests fail, debug info is captured automatically:

```typescript
import { captureDebugInfo, createConsoleCapture, createNetworkLogger } from '../fixtures/debug-utils'

// In test
const consoleLogs = createConsoleCapture(page)
const networkLogs = createNetworkLogger(page)

// On failure
await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'failure-name')
```

This captures:
- Screenshot
- Console logs
- Network requests/responses
- localStorage state
- HTML snapshot
- Current URL

Output goes to `e2e-results/` directory.

## Configuration

### playwright.config.ts

Key settings:
- Base URL: `https://optic.works`
- Retries: 1 (for flaky network tests)
- Timeout: 60s per test
- Video: on-first-retry
- Trace: on-first-retry
- Projects: chromium, firefox, webkit (chromium default)

### Test Cleanup

Test users created during registration tests need manual cleanup in Medusa admin. Test emails follow the pattern `e2e-test-*@optic.works` for easy identification.

## Common Issues

### Google Places Autocomplete

The Stripe Address Element uses Google Places autocomplete. Tests dismiss the dropdown with `Escape` key before proceeding to avoid interference.

### Stripe Iframe Handling

Payment and address forms use Stripe Elements in iframes. The CheckoutPage uses multiple strategies to locate and fill these inputs:
1. Direct iframe locator by title
2. Keyboard navigation fallback
3. Frame-by-frame search

### Multiple h1 Elements

Some pages have multiple h1 elements (product title + hero). Tests use `.first()` to avoid strict mode violations.

### Cart Hydration

The cart uses Zustand with localStorage persistence. Tests wait for hydration to complete before interacting with cart state.

## Adding New Tests

1. Create page object if needed in `e2e/fixtures/page-objects/`
2. Add test data to `e2e/fixtures/test-data.ts`
3. Create test file in `e2e/tests/`
4. Follow existing patterns for:
   - Console logging (`[PageName] action...`)
   - Error handling with debug capture
   - Waiting for elements/navigation
