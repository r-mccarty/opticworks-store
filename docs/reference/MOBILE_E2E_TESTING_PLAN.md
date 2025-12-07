# Mobile E2E Testing Plan

**Status**: Proposed
**Author**: Claude
**Date**: 2025-12-07
**Related**: PHASE4_PLAN.md (Track 5: Usability Testing, Track 6: CI/CD Hardening)

---

## Executive Summary

This document proposes an extended E2E testing strategy focused on mobile device coverage for iOS (iPhone) and Android devices. The plan establishes a feedback loop where deployed code is automatically tested on real mobile viewports, screenshots are captured, and visual regressions are detected before reaching production.

---

## Current State

### Existing E2E Infrastructure

| Component | Status | Details |
|-----------|--------|---------|
| Playwright | ✅ Active | Version in `package.json` |
| Test Suite | ✅ Complete | 7 test files covering critical flows |
| Page Objects | ✅ Complete | Store, Product, Cart, Checkout, Auth pages |
| Desktop Coverage | ✅ Complete | Chromium 1280x720 viewport |
| Mobile Coverage | ❌ None | No mobile device projects configured |
| Visual Regression | ❌ None | Only failure screenshots captured |
| Real Device Testing | ❌ None | Emulation only |

### Current Playwright Config

```typescript
// Current: Desktop only
projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
]
```

---

## Proposed Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MOBILE E2E TESTING PIPELINE                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                 │
│  │   Deploy     │────▶│  Stage URL   │────▶│ Trigger E2E  │                 │
│  │  to Preview  │     │  Generated   │     │   Tests      │                 │
│  └──────────────┘     └──────────────┘     └──────────────┘                 │
│                                                   │                          │
│         ┌─────────────────────────────────────────┼─────────────────────┐   │
│         │                                         │                     │   │
│         ▼                                         ▼                     ▼   │
│  ┌──────────────┐                      ┌──────────────┐     ┌──────────────┐│
│  │  Playwright  │                      │ BrowserStack │     │    Percy     ││
│  │  Emulation   │                      │ Real Devices │     │   Visual     ││
│  │  (Local/CI)  │                      │ (Optional)   │     │  Regression  ││
│  └──────────────┘                      └──────────────┘     └──────────────┘│
│         │                                         │                     │   │
│         └─────────────────────────────────────────┼─────────────────────┘   │
│                                                   │                          │
│                                                   ▼                          │
│                                        ┌──────────────────┐                  │
│                                        │   Screenshots +   │                 │
│                                        │   Test Results    │                 │
│                                        └──────────────────┘                  │
│                                                   │                          │
│                                                   ▼                          │
│                                        ┌──────────────────┐                  │
│                                        │  Feedback Loop   │                  │
│                                        │  - PR Comments   │                  │
│                                        │  - Slack Alerts  │                  │
│                                        │  - Dashboard     │                  │
│                                        └──────────────────┘                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Tiers

### Tier 1: Playwright Mobile Emulation (Immediate)

**Effort**: Low | **Cost**: Free | **Coverage**: Good

Add mobile device emulation to existing Playwright setup. This provides fast, reliable mobile viewport testing without additional services.

#### Device Coverage

| Device | Viewport | User Agent | Touch |
|--------|----------|------------|-------|
| iPhone 14 Pro Max | 430x932 | iOS Safari | Yes |
| iPhone 12 | 390x844 | iOS Safari | Yes |
| iPhone SE | 375x667 | iOS Safari | Yes |
| Pixel 7 | 412x915 | Chrome Mobile | Yes |
| Samsung Galaxy S21 | 360x800 | Chrome Mobile | Yes |

#### Configuration Update

```typescript
// playwright.config.ts - Extended mobile projects
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // ... existing config

  projects: [
    // Desktop (existing)
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // iOS Mobile
    {
      name: 'iphone-14-pro-max',
      use: {
        ...devices['iPhone 14 Pro Max'],
        // Capture full-page screenshots for mobile
        screenshot: 'on',
      },
    },
    {
      name: 'iphone-12',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'iphone-se',
      use: { ...devices['iPhone SE'] },
    },

    // Android Mobile
    {
      name: 'pixel-7',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'galaxy-s21',
      use: {
        viewport: { width: 360, height: 800 },
        userAgent: 'Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },

    // Tablet
    {
      name: 'ipad-pro',
      use: { ...devices['iPad Pro 11'] },
    },
  ],
});
```

#### New Mobile-Specific Tests

Create `e2e/tests/mobile/` directory for mobile-specific test scenarios:

```typescript
// e2e/tests/mobile/mobile-navigation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Mobile Navigation', () => {
  test('hamburger menu opens and closes', async ({ page }) => {
    await page.goto('/');

    // Mobile menu should be visible on mobile devices
    const hamburger = page.locator('[data-testid="mobile-menu-toggle"]');
    await expect(hamburger).toBeVisible();

    // Open menu
    await hamburger.click();
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();

    // Navigate to store
    await page.locator('[data-testid="mobile-menu-store"]').click();
    await expect(page).toHaveURL('/store');
  });

  test('touch gestures work for product carousel', async ({ page }) => {
    await page.goto('/store');

    // Swipe gesture simulation
    const carousel = page.locator('[data-testid="product-carousel"]');
    if (await carousel.isVisible()) {
      await carousel.evaluate((el) => {
        el.dispatchEvent(new TouchEvent('touchstart', {
          touches: [{ clientX: 300, clientY: 200 }]
        }));
        el.dispatchEvent(new TouchEvent('touchmove', {
          touches: [{ clientX: 100, clientY: 200 }]
        }));
        el.dispatchEvent(new TouchEvent('touchend'));
      });
    }
  });

  test('checkout form is usable on mobile', async ({ page }) => {
    // Navigate to checkout with product in cart
    await page.goto('/store/products/bed-presence-sensor');
    await page.locator('[data-testid="add-to-cart"]').click();
    await page.goto('/store/cart');
    await page.locator('[data-testid="proceed-to-payment"]').click();

    // Verify form elements are properly sized for touch
    const emailInput = page.locator('[data-testid="checkout-email-input"]');
    await expect(emailInput).toBeVisible();

    // Check input is at least 44px tall (minimum touch target)
    const box = await emailInput.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });
});
```

#### Screenshot Capture Strategy

```typescript
// e2e/tests/mobile/visual-snapshots.spec.ts
import { test, expect } from '@playwright/test';

const pages = [
  { name: 'home', path: '/' },
  { name: 'store', path: '/store' },
  { name: 'product', path: '/store/products/bed-presence-sensor' },
  { name: 'cart', path: '/store/cart' },
  { name: 'checkout', path: '/store/cart' }, // Requires cart state
];

test.describe('Visual Snapshots', () => {
  for (const { name, path } of pages) {
    test(`captures ${name} page`, async ({ page }, testInfo) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      // Full page screenshot
      const screenshot = await page.screenshot({
        fullPage: true,
        animations: 'disabled',
      });

      // Attach to test report
      await testInfo.attach(`${name}-${testInfo.project.name}`, {
        body: screenshot,
        contentType: 'image/png',
      });

      // Optional: Visual comparison with baseline
      await expect(page).toHaveScreenshot(`${name}.png`, {
        fullPage: true,
        animations: 'disabled',
        threshold: 0.1, // Allow 10% pixel difference
      });
    });
  }
});
```

---

### Tier 2: Visual Regression Testing with Percy (Recommended)

**Effort**: Medium | **Cost**: ~$400/mo (Team plan) | **Coverage**: Excellent

Percy by BrowserStack provides automated visual regression testing with baseline comparisons across browsers and viewports.

#### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Percy Workflow                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Playwright Test ──▶ percy snapshot ──▶ Percy Cloud         │
│                                              │              │
│                                              ▼              │
│                                    ┌─────────────────┐      │
│                                    │ Compare against │      │
│                                    │ baseline images │      │
│                                    └────────┬────────┘      │
│                                             │               │
│                          ┌──────────────────┼───────────────┤
│                          │                  │               │
│                          ▼                  ▼               │
│                    ┌──────────┐      ┌──────────────┐       │
│                    │  Match   │      │  Visual Diff │       │
│                    │  ✅ Pass │      │  ❌ Review   │       │
│                    └──────────┘      └──────────────┘       │
│                                             │               │
│                                             ▼               │
│                                    ┌─────────────────┐      │
│                                    │  PR Comment +   │      │
│                                    │  Review Link    │      │
│                                    └─────────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Integration

```typescript
// e2e/tests/visual/percy-snapshots.spec.ts
import { test } from '@playwright/test';
import percySnapshot from '@percy/playwright';

const viewports = [
  { width: 375, height: 667, name: 'mobile' },   // iPhone SE
  { width: 430, height: 932, name: 'mobile-lg' }, // iPhone 14 Pro Max
  { width: 768, height: 1024, name: 'tablet' },   // iPad
  { width: 1280, height: 720, name: 'desktop' },  // Desktop
];

test.describe('Percy Visual Tests', () => {
  test('homepage visual regression', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Percy automatically captures across configured widths
    await percySnapshot(page, 'Homepage', {
      widths: viewports.map(v => v.width),
    });
  });

  test('product page visual regression', async ({ page }) => {
    await page.goto('/store/products/bed-presence-sensor');
    await page.waitForLoadState('networkidle');

    await percySnapshot(page, 'Product Page - Bed Sensor', {
      widths: viewports.map(v => v.width),
    });
  });

  test('checkout flow visual regression', async ({ page }) => {
    // Add product to cart first
    await page.goto('/store/products/bed-presence-sensor');
    await page.locator('[data-testid="add-to-cart"]').click();
    await page.waitForTimeout(1000);

    await page.goto('/store/cart');
    await page.waitForLoadState('networkidle');

    await percySnapshot(page, 'Cart Page', {
      widths: viewports.map(v => v.width),
    });

    // Proceed to checkout
    await page.locator('[data-testid="proceed-to-payment"]').click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for Stripe

    await percySnapshot(page, 'Checkout Page', {
      widths: viewports.map(v => v.width),
    });
  });
});
```

#### Percy Configuration

```yaml
# percy.yml
version: 2
snapshot:
  widths:
    - 375   # iPhone SE
    - 430   # iPhone 14 Pro Max
    - 768   # Tablet
    - 1280  # Desktop
  minHeight: 1024
  percyCSS: |
    /* Hide dynamic content that causes false positives */
    [data-testid="timestamp"],
    [data-percy-hide] {
      visibility: hidden !important;
    }

discovery:
  networkIdleTimeout: 500
  allowedHostnames:
    - optic.works
    - api.optic.works
```

#### CI Integration

```yaml
# .github/workflows/visual-tests.yml
name: Visual Tests

on:
  pull_request:
    branches: [main]

jobs:
  percy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm exec playwright install --with-deps chromium

      - name: Run Percy Tests
        env:
          PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}
          E2E_BASE_URL: ${{ github.event.deployment_status.target_url }}
        run: |
          pnpm exec percy exec -- pnpm exec playwright test e2e/tests/visual/
```

---

### Tier 3: Real Device Testing with BrowserStack (Premium)

**Effort**: High | **Cost**: ~$200-500/mo | **Coverage**: Comprehensive

Real device testing on actual iOS and Android hardware for the most accurate mobile behavior.

#### Why Real Devices?

| Aspect | Emulation | Real Devices |
|--------|-----------|--------------|
| Touch accuracy | Simulated | Native |
| Performance | Host-dependent | Device-accurate |
| Browser quirks | Approximate | Exact |
| iOS Safari bugs | Some missed | All caught |
| Network behavior | Simulated | Real 4G/5G |
| Cost | Free | $200-500/mo |

#### BrowserStack Automate Integration

```typescript
// e2e/browserstack.config.ts
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './e2e/tests',
  timeout: 120000, // Longer timeout for real devices

  use: {
    baseURL: process.env.E2E_BASE_URL || 'https://optic.works',
  },

  projects: [
    // Real iPhone via BrowserStack
    {
      name: 'browserstack-iphone-14',
      use: {
        connectOptions: {
          wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
            'browser': 'playwright-webkit',
            'os': 'ios',
            'os_version': '16',
            'device': 'iPhone 14 Pro',
            'browserstack.username': process.env.BROWSERSTACK_USERNAME,
            'browserstack.accessKey': process.env.BROWSERSTACK_ACCESS_KEY,
            'browserstack.local': 'false',
          }))}`,
        },
      },
    },

    // Real Android via BrowserStack
    {
      name: 'browserstack-pixel-7',
      use: {
        connectOptions: {
          wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
            'browser': 'playwright-chromium',
            'os': 'android',
            'os_version': '13.0',
            'device': 'Google Pixel 7',
            'browserstack.username': process.env.BROWSERSTACK_USERNAME,
            'browserstack.accessKey': process.env.BROWSERSTACK_ACCESS_KEY,
          }))}`,
        },
      },
    },

    // Real Samsung via BrowserStack
    {
      name: 'browserstack-galaxy-s23',
      use: {
        connectOptions: {
          wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
            'browser': 'playwright-chromium',
            'os': 'android',
            'os_version': '13.0',
            'device': 'Samsung Galaxy S23',
            'browserstack.username': process.env.BROWSERSTACK_USERNAME,
            'browserstack.accessKey': process.env.BROWSERSTACK_ACCESS_KEY,
          }))}`,
        },
      },
    },
  ],
};

export default config;
```

#### Running Real Device Tests

```bash
# Run on real devices (requires BrowserStack credentials)
BROWSERSTACK_USERNAME=xxx \
BROWSERSTACK_ACCESS_KEY=xxx \
pnpm exec playwright test --config=e2e/browserstack.config.ts

# Run specific device
pnpm exec playwright test --config=e2e/browserstack.config.ts --project=browserstack-iphone-14
```

---

## Feedback Loop Implementation

### GitHub Actions Workflow

```yaml
# .github/workflows/mobile-e2e.yml
name: Mobile E2E Tests

on:
  deployment_status:
  pull_request:
    branches: [main]

jobs:
  mobile-tests:
    if: github.event.deployment_status.state == 'success' || github.event_name == 'pull_request'
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps

      - name: Run Mobile E2E Tests
        env:
          E2E_BASE_URL: ${{ github.event.deployment_status.target_url || 'https://optic.works' }}
        run: |
          pnpm exec playwright test \
            --project=iphone-14-pro-max \
            --project=pixel-7 \
            --project=iphone-se

      - name: Upload Screenshots
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: mobile-screenshots-${{ github.sha }}
          path: |
            e2e-results/
            e2e-report/
          retention-days: 14

      - name: Comment PR with Screenshots
        if: github.event_name == 'pull_request' && always()
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const artifactUrl = `https://github.com/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}`;

            // Check for test results
            let summary = '## 📱 Mobile E2E Test Results\n\n';

            try {
              const results = JSON.parse(fs.readFileSync('e2e-results.json', 'utf8'));
              const passed = results.suites.flatMap(s => s.specs).filter(s => s.ok).length;
              const failed = results.suites.flatMap(s => s.specs).filter(s => !s.ok).length;

              summary += `| Device | Passed | Failed |\n`;
              summary += `|--------|--------|--------|\n`;
              summary += `| iPhone 14 Pro Max | ${passed} | ${failed} |\n`;
              summary += `| Pixel 7 | ${passed} | ${failed} |\n`;
              summary += `| iPhone SE | ${passed} | ${failed} |\n`;
            } catch (e) {
              summary += '⚠️ Could not parse test results\n';
            }

            summary += `\n[📸 View Screenshots & Report](${artifactUrl})\n`;

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: summary
            });

      - name: Slack Notification
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "❌ Mobile E2E Tests Failed",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "Mobile E2E tests failed on PR #${{ github.event.pull_request.number }}"
                  }
                },
                {
                  "type": "actions",
                  "elements": [
                    {
                      "type": "button",
                      "text": { "type": "plain_text", "text": "View Report" },
                      "url": "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
                    }
                  ]
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Screenshot Dashboard

Create a simple dashboard for reviewing mobile screenshots:

```typescript
// scripts/generate-screenshot-report.ts
import fs from 'fs';
import path from 'path';

interface Screenshot {
  device: string;
  page: string;
  path: string;
  timestamp: Date;
}

function generateReport(): void {
  const resultsDir = 'e2e-results';
  const screenshots: Screenshot[] = [];

  // Collect all screenshots
  const files = fs.readdirSync(resultsDir, { recursive: true }) as string[];
  for (const file of files) {
    if (file.endsWith('.png')) {
      const parts = file.split('/');
      screenshots.push({
        device: parts[0] || 'unknown',
        page: path.basename(file, '.png'),
        path: path.join(resultsDir, file),
        timestamp: new Date(),
      });
    }
  }

  // Generate HTML report
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Mobile Screenshot Report</title>
  <style>
    body { font-family: system-ui; padding: 20px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .card { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
    .card img { width: 100%; height: auto; }
    .card-info { padding: 10px; background: #f5f5f5; }
    .device { font-weight: bold; }
    .page { color: #666; }
  </style>
</head>
<body>
  <h1>📱 Mobile Screenshots</h1>
  <p>Generated: ${new Date().toISOString()}</p>
  <div class="grid">
    ${screenshots.map(s => `
      <div class="card">
        <img src="${s.path}" alt="${s.page} on ${s.device}" />
        <div class="card-info">
          <div class="device">${s.device}</div>
          <div class="page">${s.page}</div>
        </div>
      </div>
    `).join('')}
  </div>
</body>
</html>
  `;

  fs.writeFileSync('e2e-report/mobile-screenshots.html', html);
  console.log('Report generated: e2e-report/mobile-screenshots.html');
}

generateReport();
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)

- [ ] Update `playwright.config.ts` with mobile device projects
- [ ] Create `e2e/tests/mobile/` directory structure
- [ ] Add mobile navigation tests
- [ ] Add mobile touch interaction tests
- [ ] Configure screenshot capture on all test runs
- [ ] Update CI workflow to run mobile projects

### Phase 2: Visual Regression (Week 2)

- [ ] Evaluate Percy vs Chromatic vs Playwright built-in
- [ ] Set up chosen visual regression tool
- [ ] Create baseline snapshots for critical pages
- [ ] Configure widths for all target devices
- [ ] Integrate with PR workflow

### Phase 3: Feedback Loop (Week 3)

- [ ] Create GitHub Actions workflow for mobile E2E
- [ ] Add PR comment integration with screenshot links
- [ ] Set up Slack notifications for failures
- [ ] Create screenshot review dashboard
- [ ] Document review process

### Phase 4: Real Device Testing (Optional)

- [ ] Evaluate BrowserStack vs Sauce Labs
- [ ] Set up account and credentials
- [ ] Create real device test configuration
- [ ] Add critical path tests for real devices
- [ ] Configure scheduled real device runs (nightly)

---

## Device Coverage Matrix

### Priority 1 (Must Have)

| Device | OS | Browser | Viewport | Notes |
|--------|----|---------|----------|-------|
| iPhone 14 Pro Max | iOS 17 | Safari | 430x932 | Latest flagship |
| iPhone 12/13 | iOS 16 | Safari | 390x844 | Common model |
| Pixel 7 | Android 13 | Chrome | 412x915 | Reference Android |
| Samsung Galaxy S21 | Android 12 | Chrome | 360x800 | Popular Android |

### Priority 2 (Should Have)

| Device | OS | Browser | Viewport | Notes |
|--------|----|---------|----------|-------|
| iPhone SE | iOS 16 | Safari | 375x667 | Small screen |
| iPad Pro 11 | iPadOS 17 | Safari | 834x1194 | Tablet |
| iPad Mini | iPadOS 16 | Safari | 744x1133 | Small tablet |
| Samsung Tab S8 | Android 13 | Chrome | 800x1280 | Android tablet |

### Priority 3 (Nice to Have)

| Device | OS | Browser | Viewport | Notes |
|--------|----|---------|----------|-------|
| iPhone 8 | iOS 15 | Safari | 375x667 | Legacy support |
| Pixel 5 | Android 12 | Chrome | 393x851 | Mid-range |
| OnePlus 11 | Android 13 | Chrome | 412x915 | Alternative Android |

---

## Critical Flows to Test

### High Priority

1. **Homepage → Product → Cart → Checkout** (complete purchase)
2. **Mobile menu navigation**
3. **Product image gallery (swipe/zoom)**
4. **Checkout form usability** (input sizes, keyboard behavior)
5. **Shipping address autocomplete on mobile**

### Medium Priority

1. **Account registration on mobile**
2. **Login flow on mobile**
3. **Order history viewing**
4. **Footer navigation**
5. **Search functionality**

### Low Priority

1. **Social sharing**
2. **Documentation site mobile**
3. **Email rendering (separate tool)**

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Mobile test coverage | 80% of desktop tests | Test count comparison |
| Visual regression detection | < 5% false positives | Percy/Chromatic stats |
| Mobile-specific bugs caught | > 2 per release | Bug tracker |
| Feedback loop time | < 10 min from deploy | CI timing |
| Real device test pass rate | > 95% | Test results |

---

## Cost Estimate

| Tool | Monthly Cost | Notes |
|------|--------------|-------|
| Playwright (emulation) | $0 | Included, runs locally/CI |
| Percy (visual) | $400 | Team plan, 25k snapshots |
| BrowserStack (real devices) | $299 | Automate Pro, 5 parallel |
| **Total (all tiers)** | ~$700/mo | |
| **Recommended (Tier 1+2)** | ~$400/mo | Best value |

---

## Commands

```bash
# Run all mobile tests
pnpm exec playwright test --project=iphone-14-pro-max --project=pixel-7

# Run with visual comparison
pnpm exec playwright test e2e/tests/visual/ --update-snapshots

# Run on specific device
pnpm exec playwright test --project=iphone-se

# Generate screenshot report
pnpm exec tsx scripts/generate-screenshot-report.ts

# Run Percy visual tests
PERCY_TOKEN=xxx pnpm exec percy exec -- pnpm exec playwright test e2e/tests/visual/
```

---

## Related Documentation

- [PHASE4_PLAN.md](./PHASE4_PLAN.md) - Current phase planning
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [Playwright Emulation Docs](https://playwright.dev/docs/emulation)
- [Percy Documentation](https://docs.percy.io/docs/playwright)
- [BrowserStack Playwright Docs](https://www.browserstack.com/docs/automate/playwright)

---

## Appendix: Mobile-Specific Test Data IDs

Add these `data-testid` attributes to components for mobile testing:

```typescript
// Required data-testid attributes for mobile tests
const requiredTestIds = [
  'mobile-menu-toggle',      // Hamburger menu button
  'mobile-menu',             // Mobile navigation drawer
  'mobile-menu-store',       // Store link in mobile menu
  'mobile-menu-docs',        // Docs link in mobile menu
  'product-carousel',        // Product image carousel
  'product-image-zoom',      // Zoom trigger for product images
  'checkout-email-input',    // Email input (verify touch target)
  'shipping-address-form',   // Shipping form container
  'add-to-cart',            // Add to cart button
  'cart-item',              // Cart line items
  'proceed-to-payment',     // Checkout button
];
```
