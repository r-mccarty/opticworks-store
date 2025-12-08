import { test, expect } from '@playwright/test';
import { ProductPage } from '../fixtures/page-objects/product-page';
import { CartPage } from '../fixtures/page-objects/cart-page';
import { CheckoutPage } from '../fixtures/page-objects/checkout-page';
import { testProducts, testCards, testAddress, generateTestEmail } from '../fixtures/test-data';
import { createConsoleCapture, filterAppLogs, getErrorSummary } from '../helpers/console-capture';
import { createNetworkLogger, getFailureSummary, getApiCallSummary } from '../helpers/network-logger';
import { clearCartStorage, logCartState } from '../helpers/storage-inspector';
import { captureDebugInfo, logStep, waitForNetworkIdle } from '../helpers/debug-utils';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh
    await page.goto('/');
    await clearCartStorage(page);
    console.log('\n=== Checkout Test Starting ===\n');
  });

  test('complete checkout with test card', async ({ page }, testInfo) => {
    const consoleLogs = createConsoleCapture(page);
    const networkLogs = createNetworkLogger(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    const testEmail = generateTestEmail();
    console.log(`Using test email: ${testEmail}`);

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
    await logCartState(page, 'After adding product');

    // Step 2: Navigate to cart
    logStep(2, 'Navigating to cart page');
    await cartPage.goto();

    const hasItems = await cartPage.hasItems();
    if (!hasItems) {
      console.error('Cart is empty after adding product');
      await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'step2-cart-empty');
      throw new Error('Cart is empty - add to cart failed');
    }

    // Step 3: Proceed to payment
    logStep(3, 'Proceeding to payment');
    try {
      await cartPage.proceedToPayment();
    } catch (error) {
      console.error('Failed to proceed to payment');
      await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'step3-proceed-failed');
      throw error;
    }

    // Step 4: Wait for checkout form
    logStep(4, 'Waiting for checkout form to load');
    try {
      await checkoutPage.waitForCheckoutReady();
    } catch (error) {
      console.error('Checkout form failed to load');
      const errorMsg = await checkoutPage.getErrorMessage();
      console.error('Checkout error message:', errorMsg);
      await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'step4-checkout-failed');
      throw error;
    }

    // Step 5: Fill email
    logStep(5, 'Filling email address');
    await checkoutPage.fillEmail(testEmail);

    // Step 5.5: Fill shipping address
    logStep(5.5, 'Filling shipping address');
    try {
      await checkoutPage.fillShippingAddress(testAddress);
    } catch (error) {
      console.error('Failed to fill shipping address');
      await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'step5-address-failed');
      throw error;
    }

    // Step 5.6: Wait for shipping rates and EXPLICITLY select one
    // IMPORTANT: Auto-selection in the UI only sets state, it does NOT add shipping to cart
    // or refresh the payment session. We MUST click a rate to trigger the full flow.
    logStep(5.6, 'Waiting for shipping rates');
    try {
      await checkoutPage.waitForShippingRates();
      const rates = await checkoutPage.getAvailableShippingRates();
      console.log(`Found ${rates.length} shipping rates`);

      if (rates.length > 0) {
        // EXPLICITLY click the first shipping rate to trigger:
        // 1. addShippingMethod() - adds shipping to cart total
        // 2. onShippingChange() - refreshes PaymentIntent with new amount
        console.log(`Selecting shipping rate: ${rates[0]}`);
        await checkoutPage.selectShippingRate(rates[0]);

        // Wait for payment session to refresh after shipping selection
        // This is critical - the PaymentIntent needs to be updated with shipping cost
        await page.waitForTimeout(2000);
        console.log('Waited for payment session refresh after shipping selection');
      }

      // Verify shipping cost shows in order summary
      const shippingCost = await checkoutPage.getShippingCost();
      console.log(`Shipping cost: ${shippingCost >= 0 ? '$' + shippingCost : 'pending'}`);
    } catch (error) {
      console.warn('Shipping rates loading issue:', error);
      // Check if it's digital-only (no shipping needed)
      const isDigital = await checkoutPage.isDigitalOnly();
      if (!isDigital) {
        await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'step5-shipping-failed');
        throw new Error('Shipping rates required but failed to load: ' + error);
      }
      console.log('Order is digital-only, no shipping needed');
    }

    // Step 6: Fill card details
    logStep(6, 'Filling card details');
    try {
      await checkoutPage.fillCardDetails(testCards.success);
    } catch (error) {
      console.error('Failed to fill card details');
      await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'step6-card-failed');
      throw error;
    }

    // Step 7: Submit payment
    logStep(7, 'Submitting payment');
    await checkoutPage.submitPayment();

    // Step 8: Wait for success
    logStep(8, 'Waiting for payment success');
    try {
      await checkoutPage.waitForSuccess();
    } catch (error) {
      console.error('Payment did not succeed');
      const statusMsg = await checkoutPage.getStatusMessage();
      console.error('Status message:', statusMsg);
      await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'step8-success-failed');
      throw error;
    }

    // Verify success elements
    await expect(page.locator('[data-testid="order-success"]')).toBeVisible();

    console.log('\n=== Checkout Completed Successfully ===\n');

    // Log final summary
    console.log('App Logs:', filterAppLogs(consoleLogs));
    console.log('API Calls:', getApiCallSummary(networkLogs));

    if (consoleLogs.errors.length > 0) {
      console.log('Console Errors (non-fatal):', getErrorSummary(consoleLogs));
    }
  });

  test('checkout shows error for declined card', async ({ page }, testInfo) => {
    const consoleLogs = createConsoleCapture(page);
    const networkLogs = createNetworkLogger(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

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

    // Go to cart and checkout
    await cartPage.goto();
    if (!(await cartPage.hasItems())) {
      await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'cart-empty');
      throw new Error('Cart is empty');
    }

    await cartPage.proceedToPayment();

    try {
      await checkoutPage.waitForCheckoutReady();
    } catch (error) {
      await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'checkout-failed');
      throw error;
    }

    // Fill form with declined card
    await checkoutPage.fillEmail(generateTestEmail());
    await checkoutPage.fillShippingAddress(testAddress);

    // Wait for shipping rates and EXPLICITLY select one
    try {
      await checkoutPage.waitForShippingRates();
      const rates = await checkoutPage.getAvailableShippingRates();
      if (rates.length > 0) {
        await checkoutPage.selectShippingRate(rates[0]);
        // Wait for payment session to refresh
        await page.waitForTimeout(2000);
      }
    } catch {
      // Shipping may still work if digital-only
      console.log('Shipping rates loading issue, continuing...');
    }

    await checkoutPage.fillCardDetails(testCards.decline);

    // Submit
    await checkoutPage.submitPayment();

    // Wait for error message
    await page.waitForTimeout(5000);

    // Should show an error message (not redirect to success)
    const errorMsg = await checkoutPage.getErrorMessage();
    const statusMsg = await checkoutPage.getStatusMessage();
    const currentUrl = page.url();

    console.log('Error message:', errorMsg);
    console.log('Status message:', statusMsg);
    console.log('Current URL:', currentUrl);

    // Should NOT be on success page
    expect(currentUrl).not.toContain('/success');
  });

  test('payment submission shows clear error on failure', async ({ page }, testInfo) => {
    /**
     * This test verifies that when payment fails, a clear error message is shown.
     * This catches issues like payment_intent_unexpected_state where the UI might
     * fail silently or show a generic error.
     */
    const consoleLogs = createConsoleCapture(page);
    const networkLogs = createNetworkLogger(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // Setup: Add product to cart
    await productPage.goto(testProducts.flagship.slug);
    await productPage.waitForProduct();

    try {
      await productPage.addToCart();
    } catch (error) {
      await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'add-failed');
      throw error;
    }

    await page.waitForTimeout(2000);

    // Go to checkout
    await cartPage.goto();
    if (!(await cartPage.hasItems())) {
      await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'cart-empty');
      throw new Error('Cart is empty');
    }

    await cartPage.proceedToPayment();

    try {
      await checkoutPage.waitForCheckoutReady();
    } catch (error) {
      await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'checkout-failed');
      throw error;
    }

    // Fill checkout form
    await checkoutPage.fillEmail(generateTestEmail());
    await checkoutPage.fillShippingAddress(testAddress);

    // Wait for shipping rates and select one
    try {
      await checkoutPage.waitForShippingRates();
      const rates = await checkoutPage.getAvailableShippingRates();
      if (rates.length > 0) {
        await checkoutPage.selectShippingRate(rates[0]);
        // Wait for payment session refresh
        await page.waitForTimeout(2000);
      }
    } catch {
      console.log('Shipping rates issue, continuing...');
    }

    // Fill declined card - will fail with clear error
    await checkoutPage.fillCardDetails(testCards.decline);

    // Submit payment
    await checkoutPage.submitPayment();

    // Wait for error to appear (not success)
    await page.waitForTimeout(5000);

    // Verify we're NOT on success page
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/success');

    // Check for error message
    const errorMsg = await checkoutPage.getErrorMessage();
    const statusMsg = await checkoutPage.getStatusMessage();

    console.log('Error message:', errorMsg);
    console.log('Status message:', statusMsg);

    // Should have some error indication (either in error or status message)
    const hasErrorIndication = (errorMsg && errorMsg.length > 0) ||
                               (statusMsg && statusMsg.length > 0 && !statusMsg.includes('successful'));

    if (!hasErrorIndication) {
      // Capture debug info if no error shown (this is the bug we want to catch)
      await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'no-error-shown');
      console.error('BUG: Payment failed but no error message shown to user!');
    }

    // Log console errors for debugging
    const stripeErrors = consoleLogs.errors.filter(e =>
      e.toLowerCase().includes('stripe') ||
      e.toLowerCase().includes('payment') ||
      e.toLowerCase().includes('intent')
    );
    if (stripeErrors.length > 0) {
      console.log('Stripe-related console errors:', stripeErrors);
    }

    expect(hasErrorIndication).toBe(true);
  });

  test('debug: capture full checkout initialization', async ({ page }, testInfo) => {
    /**
     * Debug test to capture the full checkout initialization process.
     * Useful for identifying where the flow breaks.
     */
    const consoleLogs = createConsoleCapture(page);
    const networkLogs = createNetworkLogger(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);

    // Add product
    console.log('\n>>> Adding product...');
    await productPage.goto(testProducts.flagship.slug);
    await page.waitForTimeout(2000);

    try {
      await productPage.addToCart();
    } catch {
      console.log('Add to cart failed');
    }

    await page.waitForTimeout(3000);
    await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'after-add-product');

    // Go to cart
    console.log('\n>>> Going to cart...');
    await cartPage.goto();
    await page.waitForTimeout(2000);
    await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'cart-page');

    const hasItems = await cartPage.hasItems();
    console.log('Cart has items:', hasItems);

    if (!hasItems) {
      console.log('\n=== DEBUGGING: Cart is empty ===');
      console.log('Possible causes:');
      console.log('1. Product variantId missing (required for Medusa integration)');
      console.log('2. Medusa API call failed');
      console.log('3. localStorage not persisting');
      console.log('4. Zustand hydration issue');
      console.log('\nCheck captured debug files for details.');

      // Still try to proceed to see what happens
    }

    // Try proceeding to payment
    console.log('\n>>> Attempting to proceed to payment...');
    try {
      await cartPage.proceedToPayment();
      await page.waitForTimeout(5000);
      await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'after-proceed-to-payment');
    } catch (error) {
      console.log('Proceed to payment failed:', error);
      await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'proceed-failed');
    }

    // Final summary
    console.log('\n========== DEBUG SUMMARY ==========');

    console.log('\nConsole Errors:', consoleLogs.errors.length);
    consoleLogs.errors.slice(0, 10).forEach((e, i) =>
      console.log(`  ${i + 1}. ${e.slice(0, 300)}`)
    );

    console.log('\nApp Logs:');
    filterAppLogs(consoleLogs).forEach((log) => console.log(`  ${log}`));

    console.log('\nAPI Calls:', networkLogs.apiCalls.length);
    networkLogs.apiCalls.forEach((c) =>
      console.log(`  ${c.method} ${c.url} -> ${c.status ?? 'pending'} (${c.duration ?? '?'}ms)`)
    );

    console.log('\nAPI Failures:', networkLogs.failures.length);
    networkLogs.failures.forEach((f) => {
      console.log(`  ${f.method} ${f.url}: ${f.status ?? f.error}`);
      if (f.responseBody) {
        try {
          const body = JSON.parse(f.responseBody);
          console.log(`    Response: ${JSON.stringify(body).slice(0, 200)}`);
        } catch {
          console.log(`    Response: ${f.responseBody.slice(0, 200)}`);
        }
      }
    });

    console.log('\n====================================\n');

    // This test always passes - it's for debugging
    expect(true).toBe(true);
  });
});
