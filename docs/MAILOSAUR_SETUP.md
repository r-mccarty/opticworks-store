# Mailosaur Setup Guide - E2E Email Testing

**Purpose**: Configure Mailosaur for end-to-end email delivery testing in OpticWorks Phase 3
**Updated**: 2025-12-01
**Phase**: Phase 3, Track 7.3

---

## Overview

**Mailosaur** is an email testing service that allows you to:
- Test real email delivery in E2E tests
- Verify email content, links, attachments
- Validate template rendering
- Catch production issues before launch
- No need for real email addresses in tests

### Use Cases in OpticWorks

1. **Order Confirmation Emails**: Verify email sent on successful purchase
2. **Customer Registration**: Validate welcome email delivery
3. **Password Reset**: Test reset link functionality
4. **Template Validation**: Ensure HTML rendering, images, CTAs work
5. **Link Testing**: Verify all links point to correct URLs

---

## Prerequisites

- [ ] Resend notification module configured (Track 1.4)
- [ ] Playwright installed (Track 7.1)
- [ ] Checkout flow working (Track 4)
- [ ] Infisical access for secrets management

---

## Step 1: Create Mailosaur Account

### 1.1 Sign Up

1. Go to https://mailosaur.com
2. Click **"Sign Up Free"**
3. Use company email: `engineering@optic.works` (or your email)
4. Verify email address

### 1.2 Create Test Server

1. Log in to Mailosaur dashboard
2. Click **"Servers"** in sidebar
3. Click **"New Server"**
4. Configure:
   - **Server Name**: `opticworks-test`
   - **Description**: `E2E testing for OpticWorks Phase 3`
5. Click **"Create Server"**
6. Note the **Server ID** (e.g., `abc123de`)

### 1.3 Get API Key

1. Click on your profile (top right)
2. Click **"API Keys"**
3. Copy the API key (starts with `xxxxx`)
4. Store securely (will add to Infisical next)

---

## Step 2: Add Secrets to Infisical

### 2.1 Add to Infisical

1. Log in to Infisical: https://app.infisical.com
2. Navigate to **OpticWorks** project
3. Select **Development** environment
4. Add secrets:

**MAILOSAUR_API_KEY**:
- **Key**: `MAILOSAUR_API_KEY`
- **Value**: `<your-api-key-from-step-1.3>`
- **Description**: Mailosaur API key for E2E email testing

**MAILOSAUR_SERVER_ID**:
- **Key**: `MAILOSAUR_SERVER_ID`
- **Value**: `<your-server-id-from-step-1.2>`
- **Description**: Mailosaur server ID for test email addresses

### 2.2 Pull Secrets Locally

```bash
cd /home/user/opticworks-store
pnpm run secrets:pull
```

**Verify**:
```bash
grep MAILOSAUR .env.local
# Should output:
# MAILOSAUR_API_KEY=xxxxx
# MAILOSAUR_SERVER_ID=abc123de
```

---

## Step 3: Install Mailosaur Package

### 3.1 Install Dependency

```bash
cd /home/user/opticworks-store
pnpm add -D mailosaur
```

### 3.2 Verify Installation

```bash
pnpm list mailosaur
# Should output: mailosaur@8.x.x (or latest version)
```

---

## Step 4: Create Email Test Helpers

### 4.1 Create Helper Directory

```bash
mkdir -p tests/helpers
```

### 4.2 Create Email Helper (`tests/helpers/email.ts`)

```typescript
import MailosaurClient from 'mailosaur'
import { expect } from '@playwright/test'

// Initialize Mailosaur client
const mailosaur = new MailosaurClient(process.env.MAILOSAUR_API_KEY!)
const serverId = process.env.MAILOSAUR_SERVER_ID!

/**
 * Generate a unique test email address
 * Format: test-{timestamp}@{serverId}.mailosaur.net
 */
export async function getTestEmail(): Promise<string> {
  const timestamp = Date.now()
  return `test-${timestamp}@${serverId}.mailosaur.net`
}

/**
 * Wait for an email to be received
 * @param sentTo - Email address to check
 * @param timeout - Max wait time in milliseconds (default 30s)
 * @returns Email message object
 */
export async function waitForEmail(sentTo: string, timeout = 30000) {
  try {
    const message = await mailosaur.messages.get(serverId, {
      sentTo,
      timeout
    })
    return message
  } catch (error) {
    console.error(`Failed to retrieve email for ${sentTo}:`, error)
    throw new Error(`Email not received within ${timeout}ms for ${sentTo}`)
  }
}

/**
 * Wait for multiple emails (e.g., order confirmation + welcome email)
 * @param sentTo - Email address to check
 * @param count - Number of emails to wait for
 * @param timeout - Max wait time in milliseconds (default 30s)
 */
export async function waitForEmails(sentTo: string, count: number, timeout = 30000) {
  try {
    const messages = await mailosaur.messages.list(serverId, {
      sentTo,
      timeout
    })

    if (messages.items.length < count) {
      throw new Error(`Expected ${count} emails, but received ${messages.items.length}`)
    }

    return messages.items.slice(0, count)
  } catch (error) {
    console.error(`Failed to retrieve ${count} emails for ${sentTo}:`, error)
    throw error
  }
}

/**
 * Verify email content matches expectations
 */
export function verifyEmailContent(
  email: any,
  expectations: {
    subject?: string
    bodyContains?: string[]
    bodyNotContains?: string[]
    linksContain?: string[]
    hasAttachments?: boolean
    from?: string
  }
) {
  // Verify subject
  if (expectations.subject) {
    expect(email.subject).toContain(expectations.subject)
  }

  // Verify sender
  if (expectations.from) {
    expect(email.from[0].email).toContain(expectations.from)
  }

  // Verify body contains expected text
  if (expectations.bodyContains) {
    expectations.bodyContains.forEach(text => {
      expect(email.html.body).toContain(text)
    })
  }

  // Verify body does NOT contain certain text (e.g., template variables)
  if (expectations.bodyNotContains) {
    expectations.bodyNotContains.forEach(text => {
      expect(email.html.body).not.toContain(text)
    })
  }

  // Verify links exist
  if (expectations.linksContain) {
    expectations.linksContain.forEach(href => {
      const hasLink = email.html.links.some((link: any) =>
        link.href.includes(href)
      )
      expect(hasLink).toBe(true)
    })
  }

  // Verify attachments
  if (expectations.hasAttachments !== undefined) {
    const hasAttachments = email.attachments && email.attachments.length > 0
    expect(hasAttachments).toBe(expectations.hasAttachments)
  }
}

/**
 * Clean up test emails (optional, for housekeeping)
 */
export async function deleteAllTestEmails() {
  try {
    await mailosaur.messages.deleteAll(serverId)
    console.log('All test emails deleted from Mailosaur')
  } catch (error) {
    console.warn('Failed to delete test emails:', error)
  }
}
```

---

## Step 5: Update Playwright Configuration

### 5.1 Update `playwright.config.ts`

Add Mailosaur environment variables:

```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  // Add environment variables for tests
  use: {
    // ... existing config
  },

  // Make Mailosaur secrets available to tests
  env: {
    MAILOSAUR_API_KEY: process.env.MAILOSAUR_API_KEY || '',
    MAILOSAUR_SERVER_ID: process.env.MAILOSAUR_SERVER_ID || '',
  },

  // Timeout for email delivery tests (emails can take 10-20 seconds)
  timeout: 60000, // 60 seconds (increase from default 30s)
})
```

---

## Step 6: Write Email Tests

### 6.1 Update Checkout Test (`tests/e2e/checkout.spec.ts`)

```typescript
import { test, expect } from '@playwright/test'
import { getTestEmail, waitForEmail, verifyEmailContent } from '../helpers/email'

test('complete purchase flow with email confirmation', async ({ page }) => {
  // Generate unique test email
  const testEmail = await getTestEmail()
  console.log(`Using test email: ${testEmail}`)

  // 1. Browse products
  await page.goto('/store')
  await expect(page.locator('h2:has-text("Products")')).toBeVisible()

  // 2. Add to cart
  await page.click('[data-testid="add-to-cart-bed-presence-sensor"]')
  await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1')

  // 3. View cart
  await page.click('[data-testid="cart-icon"]')
  await expect(page).toHaveURL('/store/cart')

  // 4. Proceed to checkout
  await page.click('[data-testid="checkout-button"]')

  // 5. Fill shipping info with Mailosaur email
  await page.fill('[name="email"]', testEmail)
  await page.fill('[name="name"]', 'Test Customer')
  await page.fill('[name="address"]', '123 Main St')
  await page.fill('[name="city"]', 'San Francisco')
  await page.fill('[name="state"]', 'CA')
  await page.fill('[name="zip"]', '94102')

  // 6. Enter payment info (Stripe test card)
  const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]')
  await stripeFrame.locator('[name="cardnumber"]').fill('4242424242424242')
  await stripeFrame.locator('[name="exp-date"]').fill('12/34')
  await stripeFrame.locator('[name="cvc"]').fill('123')

  // 7. Submit payment
  await page.click('[data-testid="submit-payment"]')

  // 8. Verify order confirmation page
  await expect(page).toHaveURL(/\/orders\/.*\/confirmation/)
  await expect(page.locator('h1:has-text("Order Confirmed")')).toBeVisible()

  // Extract order ID from URL
  const url = page.url()
  const orderId = url.match(/\/orders\/([^/]+)\/confirmation/)?.[1]
  console.log(`Order created: ${orderId}`)

  // 9. Wait for confirmation email (may take 10-20 seconds)
  console.log('Waiting for order confirmation email...')
  const email = await waitForEmail(testEmail, 30000)
  console.log(`Email received! Subject: ${email.subject}`)

  // 10. Verify email content
  verifyEmailContent(email, {
    subject: 'Order Confirmation',
    from: 'orders@optic.works',
    bodyContains: [
      'Thank you for your order',
      'OpticWorks',
      'Bed Presence Sensor',
      orderId || '', // Verify order ID appears in email
    ],
    bodyNotContains: [
      '{{', // No unrendered template variables
      'undefined',
      'null'
    ],
    linksContain: [
      `/orders/${orderId}`, // Link to order details
      '/account/orders', // Link to order history
    ]
  })

  console.log('✅ Email verification passed!')
})
```

### 6.2 Create Registration Email Test (`tests/e2e/registration-email.spec.ts`)

```typescript
import { test, expect } from '@playwright/test'
import { getTestEmail, waitForEmail, verifyEmailContent } from '../helpers/email'

test('customer registration sends welcome email', async ({ page }) => {
  const testEmail = await getTestEmail()
  console.log(`Testing registration with: ${testEmail}`)

  // 1. Navigate to registration page
  await page.goto('/auth/register')

  // 2. Fill registration form
  await page.fill('[name="email"]', testEmail)
  await page.fill('[name="password"]', 'TestPassword123!')
  await page.fill('[name="firstName"]', 'Test')
  await page.fill('[name="lastName"]', 'Customer')
  await page.click('[data-testid="register-button"]')

  // 3. Verify redirect to login
  await expect(page).toHaveURL('/auth/login?registered=true')

  // 4. Wait for welcome email
  console.log('Waiting for welcome email...')
  const email = await waitForEmail(testEmail, 30000)
  console.log(`Email received! Subject: ${email.subject}`)

  // 5. Verify welcome email content
  verifyEmailContent(email, {
    subject: 'Welcome to OpticWorks',
    from: 'orders@optic.works',
    bodyContains: [
      'Welcome',
      'Test Customer',
      'OpticWorks',
    ],
    linksContain: [
      '/account', // Link to customer portal
      '/store', // Link to store
    ]
  })

  console.log('✅ Welcome email verification passed!')
})
```

---

## Step 7: Run Tests

### 7.1 Run Checkout Test with Email Verification

```bash
cd /home/user/opticworks-store

# Ensure secrets are loaded
pnpm run secrets:pull

# Start dev server (in separate terminal)
pnpm run dev

# Run email test
pnpm exec playwright test tests/e2e/checkout.spec.ts --headed
```

### 7.2 View Test Results

```bash
# View Playwright HTML report
pnpm exec playwright show-report

# Check Mailosaur dashboard
# https://mailosaur.com/app/servers/<server-id>/messages
```

### 7.3 Run All E2E Tests

```bash
pnpm exec playwright test
```

---

## Step 8: CI/CD Integration

### 8.1 Add Secrets to GitHub Actions

Add to GitHub repository secrets:
- `MAILOSAUR_API_KEY`
- `MAILOSAUR_SERVER_ID`

### 8.2 Update GitHub Actions Workflow (`.github/workflows/e2e.yml`)

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps

      - name: Run E2E tests
        env:
          MAILOSAUR_API_KEY: ${{ secrets.MAILOSAUR_API_KEY }}
          MAILOSAUR_SERVER_ID: ${{ secrets.MAILOSAUR_SERVER_ID }}
        run: pnpm exec playwright test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Troubleshooting

### Issue: Email not received within timeout

**Symptoms**: Test fails with "Email not received within 30000ms"

**Solutions**:
1. Check Resend configuration (Track 1.4)
2. Verify `FROM_EMAIL` is correct in Infisical
3. Check Resend dashboard for delivery logs
4. Increase timeout to 60000ms (60 seconds)
5. Verify Mailosaur server ID is correct
6. Check Mailosaur account limits (free tier: 100 emails/month)

### Issue: Email received but content verification fails

**Symptoms**: Email arrives but `verifyEmailContent` assertions fail

**Solutions**:
1. Log email content: `console.log(email.html.body)`
2. Check for template rendering issues in Medusa
3. Verify email template includes expected text
4. Check for typos in expectations array
5. Inspect email in Mailosaur dashboard web UI

### Issue: `MAILOSAUR_API_KEY` not defined

**Symptoms**: Error: "MAILOSAUR_API_KEY is not defined"

**Solutions**:
1. Run `pnpm run secrets:pull` to pull from Infisical
2. Verify secrets exist in Infisical
3. Check `.env.local` contains Mailosaur vars
4. Restart dev server after pulling secrets

### Issue: Rate limit exceeded

**Symptoms**: Mailosaur returns 429 error

**Solutions**:
1. Free tier: 100 emails/month - upgrade if needed
2. Delete old test emails: `deleteAllTestEmails()`
3. Reduce test frequency
4. Consider paid plan ($20/month for 1,000 emails)

---

## Best Practices

### 1. Use Unique Email Addresses

Always use `getTestEmail()` to generate unique addresses:
```typescript
const testEmail = await getTestEmail() // test-1701234567890@abc123.mailosaur.net
```

**Don't** reuse email addresses across tests (can cause flaky tests).

### 2. Clean Up After Tests

Optionally delete test emails to stay within free tier limits:
```typescript
import { deleteAllTestEmails } from '../helpers/email'

test.afterAll(async () => {
  await deleteAllTestEmails()
})
```

### 3. Increase Timeouts for Email Tests

Email delivery takes 10-30 seconds. Set appropriate timeouts:
```typescript
test('checkout with email', async ({ page }) => {
  test.setTimeout(60000) // 60 seconds for this test

  // ... test code
})
```

### 4. Log Email Details for Debugging

```typescript
const email = await waitForEmail(testEmail)
console.log('Email received:', {
  subject: email.subject,
  from: email.from[0].email,
  to: email.to[0].email,
  links: email.html.links.map(l => l.href)
})
```

### 5. Verify Template Variables are Rendered

Always check that template variables don't appear unrendered:
```typescript
verifyEmailContent(email, {
  bodyNotContains: [
    '{{', // Handlebars/Mustache syntax
    '${', // Template literal syntax
    'undefined',
    'null',
    '[object Object]'
  ]
})
```

---

## Cost & Limits

### Free Tier (Current)
- **100 emails/month**
- **Unlimited servers**
- **30-day email retention**
- **API access**
- **Sufficient for Phase 3 E2E testing**

### Paid Tier (If Needed in Phase 4)
- **$20/month**: 1,000 emails
- **$50/month**: 5,000 emails
- **Enterprise**: Custom pricing

**Recommendation**: Start with free tier, upgrade if CI/CD tests exceed 100 emails/month.

---

## Security Considerations

### 1. Never Commit Mailosaur Secrets

Ensure `.env.local` is in `.gitignore`:
```bash
# .gitignore
.env.local
.env*.local
```

### 2. Rotate API Keys Quarterly

- Set reminder to rotate Mailosaur API key every 3 months
- Update in Infisical when rotating
- Pull secrets on all dev machines

### 3. Limit Access

- Only engineering team needs Mailosaur dashboard access
- Use role-based access in Mailosaur (if available)
- Store secrets in Infisical (source of truth)

---

## Additional Resources

- **Mailosaur Documentation**: https://docs.mailosaur.com
- **Playwright Email Testing Guide**: https://playwright.dev/docs/test-configuration#global-setup-and-teardown
- **Resend Documentation**: https://resend.com/docs
- **Medusa Notification Module**: https://docs.medusajs.com/v2/resources/commerce-modules/notification

---

## Support

**Issues with Mailosaur**:
- Mailosaur Support: support@mailosaur.com
- Documentation: https://docs.mailosaur.com

**Issues with OpticWorks Integration**:
- Check `docs/PHASE3_PLAN.md` Track 7.3
- Review `docs/MEDUSA_MODULES_REVIEW.md`
- Contact platform engineering team

---

**Document Status**: ✅ Complete
**Last Updated**: 2025-12-01
**Phase**: Phase 3, Track 7.3
