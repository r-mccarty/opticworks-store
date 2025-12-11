import { test, expect } from '@playwright/test';
import { ProductPage } from '../fixtures/page-objects/product-page';
import { CartPage } from '../fixtures/page-objects/cart-page';
import { CheckoutPage } from '../fixtures/page-objects/checkout-page';
import { testProducts, testCards, taxTestAddresses, generateTestEmail } from '../fixtures/test-data';
import { createConsoleCapture } from '../helpers/console-capture';
import { createNetworkLogger, getLatestTaxData, getTaxDataSummary } from '../helpers/network-logger';
import { clearCartStorage, logCartState } from '../helpers/storage-inspector';
import { captureDebugInfo, logStep, waitForNetworkIdle } from '../helpers/debug-utils';
import { createQAArtifactLogger } from '../helpers/qa-artifact-logger';

/**
 * Stripe Tax Integration Tests
 *
 * These tests verify that tax calculation works correctly with the Stripe Tax provider.
 * Tax is calculated based on shipping address and is displayed in the checkout order summary.
 *
 * Test addresses:
 * - California (94105): ~8.75% tax
 * - Oregon (97205): 0% tax (no sales tax)
 * - Minnesota (55402): ~7.88% tax (origin state)
 * - Delaware (19801): 0% tax (no sales tax)
 */
test.describe('Stripe Tax Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh
    await page.goto('/');
    await clearCartStorage(page);
    console.log('\n=== Tax Integration Test Starting ===\n');
  });

  test('tax is calculated after address entry', async ({ page }, testInfo) => {
    const qaLogger = createQAArtifactLogger(testInfo.title, testInfo.file || 'checkout-tax.spec.ts');
    const consoleLogs = createConsoleCapture(page);
    const networkLogs = createNetworkLogger(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    try {
      // Step 1: Add product to cart
      qaLogger.checkpoint('Add product to cart', { product: testProducts.flagship.name, price: testProducts.flagship.price });
      logStep(1, 'Adding product to cart');
      await productPage.goto(testProducts.flagship.slug);
      await productPage.waitForProduct();
      await productPage.addToCart();
      await page.waitForTimeout(2000);

      // Step 2: Navigate to cart and proceed to checkout
      qaLogger.checkpoint('Navigate to checkout');
      logStep(2, 'Navigating to cart');
      await cartPage.goto();
      const hasItems = await cartPage.hasItems();
      expect(hasItems).toBe(true);

      logStep(3, 'Proceeding to payment');
      await cartPage.proceedToPayment();

      // Step 3: Wait for checkout form
      qaLogger.checkpoint('Wait for checkout form');
      logStep(4, 'Waiting for checkout form');
      await checkoutPage.waitForCheckoutReady();

      // Step 4: Fill email
      const testEmail = generateTestEmail();
      logStep(5, 'Filling email');
      await checkoutPage.fillEmail(testEmail);

      // Step 5: Fill California address (high tax state)
      qaLogger.checkpoint('Fill California address', { address: taxTestAddresses.california });
      logStep(6, 'Filling California address');
      await checkoutPage.fillShippingAddress(taxTestAddresses.california);
      await qaLogger.captureScreenshot(page, 'after-address');

      // Step 6: Wait for shipping rates and select one
      qaLogger.checkpoint('Wait for shipping rates');
      logStep(7, 'Waiting for shipping rates');
      await checkoutPage.waitForShippingRates();
      const rates = await checkoutPage.getAvailableShippingRates();
      console.log(`Found ${rates.length} shipping rates`);
      expect(rates.length).toBeGreaterThan(0);

      // The hook auto-selects the cheapest rate and adds it to cart
      // Wait for the auto-selection's shipping-methods call to complete
      // (This happens asynchronously when rates are fetched)
      qaLogger.checkpoint('Wait for auto-selection to complete');
      logStep(8, 'Waiting for auto-selection shipping method to be added');

      // Wait for the shipping method to be added (auto-selection) by watching for the API response
      // The frontend makes this call asynchronously after fetching rates
      try {
        await page.waitForResponse(
          (resp) => resp.url().includes('/shipping-methods') && resp.status() === 200,
          { timeout: 10000 }
        );
        console.log('[Test] Auto-selection shipping method call completed');
      } catch {
        console.log('[Test] Shipping method may have already been added');
      }

      // Wait for React state to update from the shipping-methods response
      await page.waitForTimeout(3000);

      // Now explicitly select/confirm the first rate to trigger full selectRate flow
      qaLogger.checkpoint('Confirm shipping rate', { rateId: rates[0] });
      logStep(9, 'Confirming shipping rate selection');
      await checkoutPage.selectShippingAndWait(rates[0]);

      // Step 7: Wait for tax calculation with extended polling for taxable states
      qaLogger.checkpoint('Wait for tax calculation');
      logStep(9, 'Waiting for tax calculation (with extended polling for CA tax)');

      // First wait for basic tax calculation state
      await checkoutPage.waitForTaxCalculation();

      // Then poll for positive tax since California should have tax > 0
      // This handles async tax calculation from Stripe Tax API
      const hasTax = await checkoutPage.waitForPositiveTax(30000, 2000);

      // Step 8: Verify tax is calculated (California should have tax > 0)
      const taxAmount = await checkoutPage.getTaxAmount();
      console.log(`Tax amount: ${taxAmount !== null ? '$' + taxAmount : 'not calculated'}`);
      console.log(`Has positive tax: ${hasTax}`);
      await qaLogger.captureScreenshot(page, 'after-tax-calculation');

      // Assert tax is calculated and greater than 0 for California
      if (!hasTax) {
        // Log additional debug info before failing
        console.log('Tax data summary:', getTaxDataSummary(networkLogs));
        const pageContent = await page.content();
        console.log('Order summary HTML:', pageContent.match(/<div[^>]*data-testid="order-summary[^"]*"[^>]*>[\s\S]*?<\/div>/g)?.[0] || 'Not found');
      }
      expect(taxAmount).not.toBeNull();
      expect(taxAmount).toBeGreaterThan(0);

      // Verify order summary math
      const orderMath = await checkoutPage.verifyOrderSummaryMath();
      qaLogger.setOrderSummary({
        items: [{ name: testProducts.flagship.name, quantity: 1, price: testProducts.flagship.price }],
        subtotal: orderMath.subtotal,
        shipping: orderMath.shipping,
        tax: orderMath.tax,
        total: orderMath.total,
        verificationPassed: orderMath.isCorrect,
      });

      // Calculate approximate tax rate
      const taxRate = (orderMath.tax / orderMath.subtotal) * 100;
      qaLogger.setTaxCalculation({
        address: {
          city: taxTestAddresses.california.city,
          state: taxTestAddresses.california.state,
          postalCode: taxTestAddresses.california.postalCode,
          country: taxTestAddresses.california.country,
        },
        subtotal: orderMath.subtotal,
        shippingCost: orderMath.shipping,
        taxAmount: orderMath.tax,
        taxRate: taxRate,
      });

      expect(orderMath.isCorrect).toBe(true);

      // Log tax data from network
      console.log('Tax data summary:', getTaxDataSummary(networkLogs));

      qaLogger.finalize('pass');
    } catch (error) {
      qaLogger.logError('test execution', error as Error);
      await qaLogger.captureScreenshot(page, 'error');
      await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'tax-calculation-failed');
      qaLogger.finalize('fail');
      throw error;
    }
  });

  test('tax-free state shows zero tax', async ({ page }, testInfo) => {
    const qaLogger = createQAArtifactLogger(testInfo.title, testInfo.file || 'checkout-tax.spec.ts');
    const consoleLogs = createConsoleCapture(page);
    const networkLogs = createNetworkLogger(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    try {
      // Step 1: Add product to cart
      qaLogger.checkpoint('Add product to cart', { product: testProducts.flagship.name });
      await productPage.goto(testProducts.flagship.slug);
      await productPage.waitForProduct();
      await productPage.addToCart();
      await page.waitForTimeout(2000);

      // Step 2: Navigate to checkout
      qaLogger.checkpoint('Navigate to checkout');
      await cartPage.goto();
      await cartPage.proceedToPayment();
      await checkoutPage.waitForCheckoutReady();

      // Step 3: Fill email and Oregon address (no sales tax)
      qaLogger.checkpoint('Fill Oregon address', { address: taxTestAddresses.oregon });
      const testEmail = generateTestEmail();
      await checkoutPage.fillEmail(testEmail);
      await checkoutPage.fillShippingAddress(taxTestAddresses.oregon);

      // Step 4: Select shipping
      qaLogger.checkpoint('Select shipping');
      await checkoutPage.waitForShippingRates();
      const rates = await checkoutPage.getAvailableShippingRates();
      await checkoutPage.selectShippingAndWait(rates[0]);

      // Step 5: Wait for tax calculation
      qaLogger.checkpoint('Wait for tax calculation');
      await checkoutPage.waitForTaxCalculation();

      // Step 6: Verify tax is $0 for Oregon
      const taxAmount = await checkoutPage.getTaxAmount();
      await qaLogger.captureScreenshot(page, 'oregon-zero-tax');

      console.log(`Tax amount for Oregon: ${taxAmount !== null ? '$' + taxAmount : 'not calculated'}`);

      // Oregon should have $0 tax (not null - it should be calculated as 0)
      expect(taxAmount).toBe(0);

      // Verify tax is in calculated state (shows $0.00, not "Enter address")
      const isCalculated = await checkoutPage.isTaxCalculated();
      expect(isCalculated).toBe(true);

      qaLogger.setTaxCalculation({
        address: {
          city: taxTestAddresses.oregon.city,
          state: taxTestAddresses.oregon.state,
          postalCode: taxTestAddresses.oregon.postalCode,
          country: taxTestAddresses.oregon.country,
        },
        subtotal: testProducts.flagship.price,
        shippingCost: await checkoutPage.getShippingCost(),
        taxAmount: 0,
        taxRate: 0,
      });

      qaLogger.finalize('pass');
    } catch (error) {
      qaLogger.logError('test execution', error as Error);
      await qaLogger.captureScreenshot(page, 'error');
      await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'oregon-tax-failed');
      qaLogger.finalize('fail');
      throw error;
    }
  });

  test('total includes tax correctly', async ({ page }, testInfo) => {
    const qaLogger = createQAArtifactLogger(testInfo.title, testInfo.file || 'checkout-tax.spec.ts');
    const consoleLogs = createConsoleCapture(page);
    const networkLogs = createNetworkLogger(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    try {
      // Setup: Add product and navigate to checkout
      qaLogger.checkpoint('Setup: Add product and navigate to checkout');
      await productPage.goto(testProducts.flagship.slug);
      await productPage.waitForProduct();
      await productPage.addToCart();
      await page.waitForTimeout(2000);
      await cartPage.goto();
      await cartPage.proceedToPayment();
      await checkoutPage.waitForCheckoutReady();

      // Fill California address
      qaLogger.checkpoint('Fill California address');
      const testEmail = generateTestEmail();
      await checkoutPage.fillEmail(testEmail);
      await checkoutPage.fillShippingAddress(taxTestAddresses.california);

      // Select shipping
      qaLogger.checkpoint('Select shipping');
      await checkoutPage.waitForShippingRates();
      const rates = await checkoutPage.getAvailableShippingRates();
      await checkoutPage.selectShippingAndWait(rates[0]);

      // Wait for tax
      qaLogger.checkpoint('Wait for tax calculation');
      await checkoutPage.waitForTaxCalculation();

      // Verify math: subtotal + shipping + tax = total
      qaLogger.checkpoint('Verify order summary math');
      const orderMath = await checkoutPage.verifyOrderSummaryMath();
      await qaLogger.captureScreenshot(page, 'order-summary');

      console.log('Order summary verification:');
      console.log(`  Subtotal: $${orderMath.subtotal}`);
      console.log(`  Shipping: $${orderMath.shipping}`);
      console.log(`  Tax: $${orderMath.tax}`);
      console.log(`  Total: $${orderMath.total}`);
      console.log(`  Math correct: ${orderMath.isCorrect}`);

      qaLogger.setOrderSummary({
        items: [{ name: testProducts.flagship.name, quantity: 1, price: testProducts.flagship.price }],
        subtotal: orderMath.subtotal,
        shipping: orderMath.shipping,
        tax: orderMath.tax,
        total: orderMath.total,
        verificationPassed: orderMath.isCorrect,
      });

      // The critical assertion
      expect(orderMath.isCorrect).toBe(true);

      // Also verify pay button shows correct total
      const payButtonText = await checkoutPage.payButton.textContent();
      console.log(`Pay button text: ${payButtonText}`);
      expect(payButtonText).toContain(orderMath.total.toFixed(2));

      qaLogger.finalize('pass');
    } catch (error) {
      qaLogger.logError('test execution', error as Error);
      await qaLogger.captureScreenshot(page, 'error');
      await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'total-math-failed');
      qaLogger.finalize('fail');
      throw error;
    }
  });

  test('complete checkout with tax verification', async ({ page }, testInfo) => {
    // Set longer timeout for full checkout
    test.setTimeout(120000);

    const qaLogger = createQAArtifactLogger(testInfo.title, testInfo.file || 'checkout-tax.spec.ts');
    const consoleLogs = createConsoleCapture(page);
    const networkLogs = createNetworkLogger(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    try {
      // Step 1: Add product to cart
      qaLogger.checkpoint('Add product to cart', { product: testProducts.flagship.name });
      await productPage.goto(testProducts.flagship.slug);
      await productPage.waitForProduct();
      await productPage.addToCart();
      await page.waitForTimeout(2000);

      // Step 2: Navigate to checkout
      qaLogger.checkpoint('Navigate to checkout');
      await cartPage.goto();
      await cartPage.proceedToPayment();
      await checkoutPage.waitForCheckoutReady();

      // Step 3: Fill checkout form with California address
      const testEmail = generateTestEmail();
      qaLogger.checkpoint('Fill checkout form', { email: testEmail, address: taxTestAddresses.california });
      await checkoutPage.fillEmail(testEmail);
      await checkoutPage.fillShippingAddress(taxTestAddresses.california);

      // Step 4: Select shipping
      qaLogger.checkpoint('Select shipping');
      await checkoutPage.waitForShippingRates();
      const rates = await checkoutPage.getAvailableShippingRates();
      await checkoutPage.selectShippingAndWait(rates[0]);

      // Step 5: Verify tax is calculated
      qaLogger.checkpoint('Verify tax calculation');
      await checkoutPage.waitForTaxCalculation();
      const taxAmount = await checkoutPage.getTaxAmount();
      expect(taxAmount).not.toBeNull();
      expect(taxAmount).toBeGreaterThan(0);
      console.log(`Tax calculated: $${taxAmount}`);

      // Capture order summary before payment
      const orderMath = await checkoutPage.verifyOrderSummaryMath();
      qaLogger.setOrderSummary({
        items: [{ name: testProducts.flagship.name, quantity: 1, price: testProducts.flagship.price }],
        subtotal: orderMath.subtotal,
        shipping: orderMath.shipping,
        tax: orderMath.tax,
        total: orderMath.total,
        verificationPassed: orderMath.isCorrect,
      });
      expect(orderMath.isCorrect).toBe(true);

      await qaLogger.captureScreenshot(page, 'before-payment');

      // Step 6: Fill card details
      qaLogger.checkpoint('Fill card details');
      await checkoutPage.fillCardDetails(testCards.success);

      // Step 7: Submit payment
      qaLogger.checkpoint('Submit payment');
      await checkoutPage.submitPayment();

      // Step 8: Wait for success
      qaLogger.checkpoint('Wait for success');
      await checkoutPage.waitForSuccess();
      await qaLogger.captureScreenshot(page, 'success');

      // Log final tax data from network
      const latestTaxData = getLatestTaxData(networkLogs);
      if (latestTaxData) {
        console.log('Final tax data from order:', latestTaxData);
        qaLogger.setTaxCalculation({
          address: {
            city: taxTestAddresses.california.city,
            state: taxTestAddresses.california.state,
            postalCode: taxTestAddresses.california.postalCode,
            country: taxTestAddresses.california.country,
          },
          subtotal: latestTaxData.subtotal || orderMath.subtotal,
          shippingCost: latestTaxData.shippingTotal || orderMath.shipping,
          taxAmount: latestTaxData.taxTotal || orderMath.tax,
        });
      }

      qaLogger.finalize('pass');
    } catch (error) {
      qaLogger.logError('test execution', error as Error);
      await qaLogger.captureScreenshot(page, 'error');
      await captureDebugInfo(page, testInfo, consoleLogs, networkLogs, 'full-checkout-failed');
      qaLogger.finalize('fail');
      throw error;
    }
  });
});
