import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E testing of checkout flow.
 * Optimized for debugging client-side issues against live optic.works.
 */
export default defineConfig({
  testDir: './e2e/tests',

  // Run tests sequentially for easier debugging
  fullyParallel: false,
  workers: 1,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on first failure to capture trace
  retries: process.env.CI ? 2 : 1,

  // Reporters for debugging
  reporter: [
    ['html', { open: 'never', outputFolder: 'e2e-report' }],
    ['list'],
    ['json', { outputFile: 'e2e-results.json' }],
  ],

  // Output directory for screenshots, videos, traces
  outputDir: 'e2e-results',

  // Global settings
  use: {
    // Target the live site
    baseURL: process.env.E2E_BASE_URL || 'https://optic.works',

    // Capture trace on first retry for debugging
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on first retry
    video: 'on-first-retry',

    // Viewport
    viewport: { width: 1280, height: 720 },

    // Slow down actions for visibility when debugging
    // actionTimeout: 10000,
  },

  // Browser projects - start with Chromium for debugging
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment to test other browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Timeouts - generous for Stripe operations
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
});
