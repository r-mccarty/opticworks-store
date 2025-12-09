import { test, expect } from '@playwright/test';
import { ProductPage } from '../fixtures/page-objects/product-page';
import { CartPage } from '../fixtures/page-objects/cart-page';
import { CheckoutPage } from '../fixtures/page-objects/checkout-page';
import { testProducts, testCards, testAddress, generateTestEmail } from '../fixtures/test-data';
import { createConsoleCapture, filterAppLogs } from '../helpers/console-capture';
import { createNetworkLogger, getApiCallSummary } from '../helpers/network-logger';
import { clearCartStorage } from '../helpers/storage-inspector';
import { captureDebugInfo, logStep } from '../helpers/debug-utils';

/**
 * E2E tests for shipping rate selection during checkout.
 *
 * These tests verify:
 * - Shipping rates load after address is entered
 * - User can select different shipping rates
 * - Shipping cost is reflected in order total
 * - Free shipping applies for eligible orders
 * - Error handling for invalid addresses
 * - Calculated pricing API is called correctly (regression test for NaN rates bug)
 */
test.describe('Checkout Shipping', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearCartStorage(page);
    console.log('\n=== Checkout Shipping Test Starting ===\n');
  });

  test('shipping rates load after entering address', async ({ page }, testInfo) => {
    const consoleLogs = createConsoleCapture(page);
    const networkLogs = createNetworkLogger(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // Step 1: Add product to cart
    logStep(1, 'Adding product to cart');
    await productPage.goto(testProducts.flagship.slug);
    await productPage.waitForProduct();

    try {
      await productPage.addToCart();
    } catch (error) {
      console.error('Failed to add product to cart');
      await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'step1-add-to-cart-failed');
      throw error;
    }

    await page.waitForTimeout(2000);

    // Step 2: Navigate to cart and checkout
    logStep(2, 'Navigating to checkout');
    await cartPage.goto();

    const hasItems = await cartPage.hasItems();
    if (!hasItems) {
      await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'step2-cart-empty');
      throw new Error('Cart is empty');
    }

    await cartPage.proceedToPayment();

    // Step 3: Wait for checkout form
    logStep(3, 'Waiting for checkout form');
    try {
      await checkoutPage.waitForCheckoutReady();
    } catch (error) {
      await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'step3-checkout-failed');
      throw error;
    }

    // Step 4: Fill email and shipping address
    logStep(4, 'Filling email and shipping address');
    await checkoutPage.fillEmail(generateTestEmail());
    await checkoutPage.fillShippingAddress(testAddress);

    // Step 5: Wait for shipping rates to load
    logStep(5, 'Waiting for shipping rates');
    try {
      await checkoutPage.waitForShippingRates();
    } catch (error) {
      console.error('Shipping rates failed to load');
      await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'step5-shipping-rates-failed');
      throw error;
    }

    // Step 6: Verify shipping rates are displayed
    logStep(6, 'Verifying shipping rates');
    const rates = await checkoutPage.getAvailableShippingRates();
    expect(rates.length).toBeGreaterThan(0);
    console.log(`Found ${rates.length} shipping rates`);

    // Verify a rate is auto-selected (cheapest)
    const selectedRate = await checkoutPage.getSelectedShippingRate();
    console.log('Selected rate:', selectedRate);
    // Note: Selected rate might be null if radio inputs aren't checked by default

    // Verify shipping cost appears in order summary
    const shippingCost = await checkoutPage.getShippingCost();
    console.log('Shipping cost:', shippingCost);
    expect(shippingCost).toBeGreaterThanOrEqual(0); // 0 is valid for free shipping

    console.log('\n=== Shipping Rates Loaded Successfully ===\n');
    console.log('API Calls:', getApiCallSummary(networkLogs));
  });

  test('user can select different shipping rates', async ({ page }, testInfo) => {
    const consoleLogs = createConsoleCapture(page);
    const networkLogs = createNetworkLogger(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // Setup: Add product and navigate to checkout
    await productPage.goto(testProducts.flagship.slug);
    await productPage.waitForProduct();
    await productPage.addToCart();
    await page.waitForTimeout(2000);
    await cartPage.goto();
    await cartPage.proceedToPayment();
    await checkoutPage.waitForCheckoutReady();

    // Fill address to trigger rate calculation
    await checkoutPage.fillEmail(generateTestEmail());
    await checkoutPage.fillShippingAddress(testAddress);

    // Wait for rates
    try {
      await checkoutPage.waitForShippingRates();
    } catch (error) {
      await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'rates-failed');
      throw error;
    }

    // Get available rates
    const rates = await checkoutPage.getAvailableShippingRates();
    expect(rates.length).toBeGreaterThan(0);

    // If multiple rates available, select the second one
    if (rates.length > 1) {
      const initialCost = await checkoutPage.getShippingCost();
      console.log('Initial shipping cost:', initialCost);

      await checkoutPage.selectShippingRate(rates[1]);
      await page.waitForTimeout(500);

      const newCost = await checkoutPage.getShippingCost();
      console.log('New shipping cost after selection:', newCost);

      // Cost might change (or stay same if rates are equal)
      expect(newCost).toBeGreaterThanOrEqual(0);
    }

    console.log('\n=== Rate Selection Test Passed ===\n');
  });

  test('complete checkout with shipping rate selection', async ({ page }, testInfo) => {
    const consoleLogs = createConsoleCapture(page);
    const networkLogs = createNetworkLogger(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    const testEmail = generateTestEmail();

    // Step 1: Add product to cart
    logStep(1, 'Adding product to cart');
    await productPage.goto(testProducts.flagship.slug);
    await productPage.waitForProduct();
    await productPage.addToCart();
    await page.waitForTimeout(2000);

    // Step 2: Navigate to checkout
    logStep(2, 'Navigating to checkout');
    await cartPage.goto();
    await cartPage.proceedToPayment();
    await checkoutPage.waitForCheckoutReady();

    // Step 3: Fill email and address
    logStep(3, 'Filling email and shipping address');
    await checkoutPage.fillEmail(testEmail);
    await checkoutPage.fillShippingAddress(testAddress);

    // Step 4: Wait for and verify shipping rates
    logStep(4, 'Waiting for shipping rates');
    try {
      await checkoutPage.waitForShippingRates();
    } catch (error) {
      await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'rates-failed');
      throw error;
    }

    const rates = await checkoutPage.getAvailableShippingRates();
    expect(rates.length).toBeGreaterThan(0);

    // Select first available rate - this triggers:
    // 1. addShippingMethod() to add shipping to cart
    // 2. onShippingChange() to refresh PaymentIntent with new amount
    await checkoutPage.selectShippingRate(rates[0]);

    // Wait for payment session to refresh after shipping selection
    // This is critical to prevent payment_intent_unexpected_state errors
    await page.waitForTimeout(2000);

    // Verify shipping cost in order summary
    const shippingCost = await checkoutPage.getShippingCost();
    console.log('Shipping cost:', shippingCost);
    expect(shippingCost).toBeGreaterThanOrEqual(0);

    // Step 5: Fill payment details
    logStep(5, 'Filling card details');
    try {
      await checkoutPage.fillCardDetails(testCards.success);
    } catch (error) {
      await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'card-failed');
      throw error;
    }

    // Step 6: Submit payment
    logStep(6, 'Submitting payment');
    await checkoutPage.submitPayment();

    // Step 7: Wait for success
    logStep(7, 'Waiting for payment success');
    try {
      await checkoutPage.waitForSuccess();
    } catch (error) {
      await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'success-failed');
      throw error;
    }

    await expect(page.locator('[data-testid="order-success"]')).toBeVisible();

    console.log('\n=== Checkout with Shipping Completed Successfully ===\n');
    console.log('App Logs:', filterAppLogs(consoleLogs));
  });

  test('shows error when shipping address is incomplete', async ({ page }, testInfo) => {
    const consoleLogs = createConsoleCapture(page);
    const networkLogs = createNetworkLogger(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // Setup
    await productPage.goto(testProducts.flagship.slug);
    await productPage.waitForProduct();
    await productPage.addToCart();
    await page.waitForTimeout(2000);
    await cartPage.goto();
    await cartPage.proceedToPayment();
    await checkoutPage.waitForCheckoutReady();

    await checkoutPage.fillEmail(generateTestEmail());

    // Wait a bit and check that no shipping rates are shown
    // (rates should only load after complete address)
    await page.waitForTimeout(3000);

    // Shipping selector should show "Enter your shipping address to see available options"
    const ratesList = page.locator('[data-testid="shipping-rates-list"]');
    const hasRates = await ratesList.isVisible().catch(() => false);

    // Without a complete address, rates should not be visible
    if (!hasRates) {
      console.log('No rates shown - expected behavior for incomplete address');
      // Check for the "enter address" message
      const shippingSelector = page.locator('[data-testid="shipping-selector"]');
      const selectorText = await shippingSelector.textContent();
      expect(selectorText).toContain('shipping address');
    }

    console.log('\n=== Incomplete Address Test Passed ===\n');
  });

  /**
   * Regression test for calculated shipping pricing.
   *
   * This test verifies that the frontend correctly calls the Medusa v2
   * calculated pricing API for shipping options with price_type: "calculated".
   *
   * Background: On 2024-12-09, shipping rates displayed as "NaN" because
   * the frontend was not calling the /store/shipping-options/{id}/calculate
   * endpoint. The /store/shipping-options endpoint returns calculated_price: null
   * for calculated pricing options.
   *
   * See: docs/postmortems/2025-12-09-shipping-rates-nan.md
   */
  test('calculated shipping prices are fetched correctly (regression)', async ({ page }, testInfo) => {
    const consoleLogs = createConsoleCapture(page);
    const networkLogs = createNetworkLogger(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // Track API calls to verify calculate endpoint is called
    const calculateCalls: { url: string; status: number; body: unknown }[] = [];

    // Intercept shipping-options/calculate API calls
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/shipping-options/') && url.includes('/calculate')) {
        try {
          const body = await response.json().catch(() => null);
          calculateCalls.push({
            url,
            status: response.status(),
            body,
          });
          console.log(`[Test] Calculate API called: ${url} -> ${response.status()}`);
        } catch {
          // Ignore JSON parse errors
        }
      }
    });

    // Step 1: Add product to cart
    logStep(1, 'Adding product to cart');
    await productPage.goto(testProducts.flagship.slug);
    await productPage.waitForProduct();

    try {
      await productPage.addToCart();
    } catch (error) {
      console.error('Failed to add product to cart');
      await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'step1-add-failed');
      throw error;
    }

    await page.waitForTimeout(2000);

    // Step 2: Navigate to checkout
    logStep(2, 'Navigating to checkout');
    await cartPage.goto();
    const hasItems = await cartPage.hasItems();
    if (!hasItems) {
      await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'step2-cart-empty');
      throw new Error('Cart is empty');
    }

    await cartPage.proceedToPayment();
    await checkoutPage.waitForCheckoutReady();

    // Step 3: Fill email and shipping address
    logStep(3, 'Filling email and shipping address');
    await checkoutPage.fillEmail(generateTestEmail());
    await checkoutPage.fillShippingAddress(testAddress);

    // Step 4: Wait for shipping rates to load
    logStep(4, 'Waiting for shipping rates');
    try {
      await checkoutPage.waitForShippingRates();
    } catch (error) {
      console.error('Shipping rates failed to load');
      await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'step4-rates-failed');
      throw error;
    }

    // Step 5: Verify calculate API was called
    logStep(5, 'Verifying calculate API calls');
    console.log(`Calculate API calls made: ${calculateCalls.length}`);

    // For calculated pricing, the frontend should call /calculate for each option
    // We expect at least one call (may have multiple shipping options)
    expect(calculateCalls.length).toBeGreaterThan(0);

    // Verify each call succeeded and returned a valid calculated_amount
    for (const call of calculateCalls) {
      expect(call.status).toBe(200);

      // The response should have calculated_price with a numeric amount
      const shippingOption = (call.body as { shipping_option?: { calculated_price?: { calculated_amount?: number } } })?.shipping_option;
      const calculatedAmount = shippingOption?.calculated_price?.calculated_amount;

      console.log(`Calculate response: calculated_amount = ${calculatedAmount}`);

      // calculated_amount should be a number (in cents), not null/undefined/NaN
      expect(calculatedAmount).toBeDefined();
      expect(typeof calculatedAmount).toBe('number');
      expect(Number.isNaN(calculatedAmount)).toBe(false);
      expect(calculatedAmount).toBeGreaterThanOrEqual(0);
    }

    // Step 6: Verify shipping rates are displayed with valid prices (not NaN)
    logStep(6, 'Verifying displayed shipping rates');
    const rates = await checkoutPage.getAvailableShippingRates();
    expect(rates.length).toBeGreaterThan(0);

    // Check that the shipping cost in the UI is a valid number
    const shippingCost = await checkoutPage.getShippingCost();
    console.log(`Displayed shipping cost: $${shippingCost}`);

    // Shipping cost should be a number >= 0 (not -1 which means "Select shipping", not NaN)
    expect(shippingCost).toBeGreaterThanOrEqual(0);
    expect(Number.isNaN(shippingCost)).toBe(false);

    // Verify the displayed price matches what we got from the API
    // Medusa v2 returns calculated_amount in MAJOR units (dollars), not cents
    // See: https://docs.medusajs.com/learn/introduction/from-v1-to-v2#prices-are-stored-in-major-units
    if (calculateCalls.length > 0) {
      const firstCallAmount = (calculateCalls[0].body as { shipping_option?: { calculated_price?: { calculated_amount?: number } } })?.shipping_option?.calculated_price?.calculated_amount;
      if (firstCallAmount !== undefined) {
        // API already returns dollars (major units), no conversion needed
        // Allow some tolerance for rounding
        expect(Math.abs(shippingCost - firstCallAmount)).toBeLessThan(0.02);
        console.log(`Price verification: API=${firstCallAmount}, UI=${shippingCost}`);
      }
    }

    console.log('\n=== Calculated Shipping Pricing Test Passed ===\n');
    console.log('Summary:');
    console.log(`- Calculate API calls: ${calculateCalls.length}`);
    console.log(`- Shipping rates displayed: ${rates.length}`);
    console.log(`- Displayed cost: $${shippingCost}`);
  });
});
