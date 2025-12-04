import { test, expect } from '@playwright/test';
import { ProductPage } from '../fixtures/page-objects/product-page';
import { CartPage } from '../fixtures/page-objects/cart-page';
import { testProducts } from '../fixtures/test-data';
import { createConsoleCapture, filterAppLogs, getErrorSummary } from '../helpers/console-capture';
import { createNetworkLogger, getFailureSummary, getApiCallSummary } from '../helpers/network-logger';
import { clearCartStorage, logCartState, cartHasItems } from '../helpers/storage-inspector';
import { captureDebugInfo, logStep, waitForNetworkIdle } from '../helpers/debug-utils';

test.describe('Add to Cart', () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh - navigate to home and clear cart
    await page.goto('/');
    await clearCartStorage(page);
    console.log('\n=== Test Starting ===\n');
  });

  test('should add flagship product to cart', async ({ page }, testInfo) => {
    const consoleLogs = createConsoleCapture(page);
    const networkLogs = createNetworkLogger(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);

    // Step 1: Navigate to product page
    logStep(1, 'Navigating to product page');
    await productPage.goto(testProducts.flagship.slug);
    await productPage.waitForProduct();

    // Log initial cart state
    const initialState = await logCartState(page, 'Before Add');
    expect(initialState?.items?.length ?? 0).toBe(0);

    // Step 2: Click Add to Cart
    logStep(2, 'Clicking Add to Cart button');
    try {
      await productPage.addToCart();
    } catch (error) {
      console.error('\n!!! Add to Cart Failed !!!');
      console.error('Error:', error);
      await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'add-to-cart-click-failed');
      throw error;
    }

    // Step 3: Wait for cart sync
    logStep(3, 'Waiting for cart sync with Medusa');
    await waitForNetworkIdle(page);
    await page.waitForTimeout(2000); // Extra time for async cart operations

    // Log cart state after add
    const afterAddState = await logCartState(page, 'After Add');

    // Check localStorage
    const hasItemsInStorage = await cartHasItems(page);
    console.log(`\n[CHECK] Cart has items in localStorage: ${hasItemsInStorage}`);

    // Log app-specific console messages
    const appLogs = filterAppLogs(consoleLogs);
    if (appLogs.length > 0) {
      console.log('\n[APP LOGS]:');
      appLogs.forEach((log) => console.log(`  ${log}`));
    }

    // Log any errors
    if (consoleLogs.errors.length > 0) {
      console.error('\n[CONSOLE ERRORS]:');
      console.error(getErrorSummary(consoleLogs));
    }

    // Log API calls
    console.log('\n[API CALLS]:');
    console.log(getApiCallSummary(networkLogs));

    // Log any failures
    if (networkLogs.failures.length > 0) {
      console.error('\n[API FAILURES]:');
      console.error(getFailureSummary(networkLogs));
    }

    // Step 4: Navigate to cart page
    logStep(4, 'Navigating to cart page');
    await cartPage.goto();

    // Step 5: Verify cart has items
    logStep(5, 'Verifying cart has items');
    const cartHasItemsOnPage = await cartPage.hasItems();

    if (!cartHasItemsOnPage) {
      console.error('\n!!! Cart page shows no items !!!');
      await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'cart-empty-after-add');
    }

    // Assertions
    expect(hasItemsInStorage, 'Cart should have items in localStorage').toBe(true);
    expect(cartHasItemsOnPage, 'Cart page should show items').toBe(true);

    console.log('\n=== Test Completed Successfully ===\n');
  });

  test('should display correct product info on cart page', async ({ page }, testInfo) => {
    const consoleLogs = createConsoleCapture(page);
    const networkLogs = createNetworkLogger(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);

    // Add product
    await productPage.goto(testProducts.flagship.slug);
    await productPage.waitForProduct();

    try {
      await productPage.addToCart();
    } catch (error) {
      await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'add-failed');
      throw error;
    }

    await page.waitForTimeout(2000);

    // Navigate to cart
    await cartPage.goto();

    // The product name appears in the cart - wait for it to be visible
    // Use a locator that matches the h2/title element showing the product name
    const productNameLocator = page.locator(`text="${testProducts.flagship.name}"`).first();

    // Wait up to 10 seconds for the product name to appear
    await productNameLocator.waitFor({ state: "visible", timeout: 10000 }).catch(async () => {
      // If not found, capture debug info before failing
      await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'product-not-visible');
    });

    const isVisible = await productNameLocator.isVisible();
    expect(isVisible, `Product "${testProducts.flagship.name}" should be visible in cart`).toBe(true);
  });

  test('debug: capture full page state after add to cart attempt', async ({ page }, testInfo) => {
    /**
     * This test is specifically for debugging.
     * It captures comprehensive debug info regardless of success/failure.
     */
    const consoleLogs = createConsoleCapture(page);
    const networkLogs = createNetworkLogger(page);
    const productPage = new ProductPage(page);

    // Navigate to product
    await productPage.goto(testProducts.flagship.slug);
    await page.waitForTimeout(3000); // Wait for full page load

    // Capture state BEFORE clicking
    await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'before-add-to-cart');

    // Attempt to add to cart
    try {
      await productPage.addToCart();
    } catch (error) {
      console.log('Add to cart threw error (expected for debugging):', error);
    }

    // Wait for any async operations
    await page.waitForTimeout(3000);

    // Capture state AFTER clicking
    await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'after-add-to-cart');

    // Navigate to cart
    await page.goto('/store/cart');
    await page.waitForTimeout(2000);

    // Capture cart page state
    await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'cart-page');

    // Log summary
    console.log('\n========== DEBUG SUMMARY ==========');
    console.log('\nConsole Errors:', consoleLogs.errors.length);
    consoleLogs.errors.forEach((e, i) => console.log(`  ${i + 1}. ${e.slice(0, 200)}`));

    console.log('\nAPI Calls:', networkLogs.apiCalls.length);
    networkLogs.apiCalls.forEach((c) =>
      console.log(`  ${c.method} ${c.url} -> ${c.status ?? 'pending'}`)
    );

    console.log('\nAPI Failures:', networkLogs.failures.length);
    networkLogs.failures.forEach((f) =>
      console.log(`  ${f.method} ${f.url}: ${f.status ?? f.error}`)
    );

    console.log('\n====================================\n');

    // This test always passes - it's just for debugging
    expect(true).toBe(true);
  });
});
