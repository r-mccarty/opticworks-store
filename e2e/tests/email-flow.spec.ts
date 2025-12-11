/**
 * E2E tests for email notification flows.
 * Uses Mailosaur to verify that emails are actually sent and contain expected content.
 *
 * These tests require MAILOSAUR_API_KEY and MAILOSAUR_SERVER_ID environment variables.
 * If not configured, tests will be skipped.
 */
import { test, expect } from "@playwright/test";
import { RegisterPage } from "../fixtures/page-objects/auth-page";
import { StorePage } from "../fixtures/page-objects/store-page";
import { ProductPage } from "../fixtures/page-objects/product-page";
import { CartPage } from "../fixtures/page-objects/cart-page";
import { CheckoutPage } from "../fixtures/page-objects/checkout-page";
import {
  testProducts,
  testAddress,
  testCards,
  testAuthCredentials,
  mailosaurConfig,
} from "../fixtures/test-data";
import {
  waitForEmail,
  extractLinkFromEmail,
  emailContainsText,
  isMailosaurConfigured,
  deleteAllMessages,
} from "../fixtures/email-utils";

test.describe("Email Notifications", () => {
  // Skip all tests if Mailosaur is not configured
  test.beforeEach(async () => {
    if (!isMailosaurConfigured()) {
      test.skip();
    }
  });

  // Clean up messages before each test
  test.beforeEach(async () => {
    if (isMailosaurConfigured()) {
      await deleteAllMessages();
    }
  });

  test("order confirmation email is sent after checkout", async ({ page }) => {
    // This test verifies the full checkout flow sends an order confirmation email
    test.setTimeout(120000); // 2 minutes for checkout + email

    const storePage = new StorePage(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // Generate a Mailosaur email address for this test
    const testEmail = mailosaurConfig.generateEmail();
    console.log(`[Email Test] Using email: ${testEmail}`);

    // Step 1: Add product to cart
    console.log("[Email Test] Adding product to cart...");
    await productPage.goto(testProducts.flagship.slug);
    await productPage.waitForProduct();
    await productPage.addToCart();

    // Step 2: Go to cart and proceed to checkout
    console.log("[Email Test] Proceeding to checkout...");
    await cartPage.goto();
    await cartPage.waitForCartHydration();
    await cartPage.proceedToPayment();

    // Step 3: Fill checkout form with Mailosaur email
    console.log("[Email Test] Filling checkout form...");
    await checkoutPage.waitForCheckoutReady();
    await checkoutPage.fillEmail(testEmail);
    await checkoutPage.fillShippingAddress(testAddress);

    // Step 4: Select shipping rate (required for checkout)
    console.log("[Email Test] Selecting shipping rate...");
    await checkoutPage.waitForShippingRates();
    const rates = await checkoutPage.getAvailableShippingRates();
    if (rates.length > 0) {
      await checkoutPage.selectShippingRate(rates[0]);
      await page.waitForTimeout(2000); // Allow rate selection to process
    }

    // Step 5: Fill payment and submit
    console.log("[Email Test] Completing payment...");
    await checkoutPage.waitForStripeElements();
    await checkoutPage.fillCardDetails(testCards.success);
    await checkoutPage.submitPayment();

    // Step 5: Wait for success
    console.log("[Email Test] Waiting for success...");
    await checkoutPage.waitForSuccess();
    expect(page.url()).toContain("/success");

    // Step 6: Wait for order confirmation email
    console.log("[Email Test] Waiting for order confirmation email...");
    const email = await waitForEmail(testEmail, {
      subject: "Order Confirmation",
      timeout: 60000,
    });

    // Step 7: Verify email content
    expect(email).not.toBeNull();
    if (email) {
      expect(email.subject).toContain("Order Confirmation");
      expect(emailContainsText(email, "Order Confirmed")).toBe(true);
      expect(emailContainsText(email, testProducts.flagship.name)).toBe(true);
      expect(emailContainsText(email, "OpticWorks")).toBe(true);

      console.log("[Email Test] Order confirmation email verified!");
    }
  });

  test("welcome email is sent after registration", async ({ page }) => {
    // This test verifies that new customer registration triggers a welcome email
    test.setTimeout(90000);

    const registerPage = new RegisterPage(page);

    // Generate a Mailosaur email address for this test
    const testEmail = mailosaurConfig.generateEmail();
    console.log(`[Email Test] Using email: ${testEmail}`);

    // Step 1: Register new account
    console.log("[Email Test] Registering new account...");
    await registerPage.goto();
    await registerPage.register(
      testEmail,
      testAuthCredentials.password,
      "E2E",
      "EmailTest"
    );

    // Step 2: Wait for redirect to account page (confirms registration succeeded)
    console.log("[Email Test] Waiting for registration redirect...");
    await registerPage.waitForRedirect("/account");

    // Step 3: Wait for welcome email
    console.log("[Email Test] Waiting for welcome email...");
    const email = await waitForEmail(testEmail, {
      subject: "Welcome",
      timeout: 60000,
    });

    // Step 4: Verify email content
    expect(email).not.toBeNull();
    if (email) {
      expect(email.subject).toContain("Welcome");
      expect(emailContainsText(email, "Welcome to OpticWorks")).toBe(true);
      expect(emailContainsText(email, "E2E")).toBe(true); // First name

      // Verify there's a link to start shopping
      const shopLink = extractLinkFromEmail(email, "Start Shopping");
      expect(shopLink).toBeTruthy();
      if (shopLink) {
        expect(shopLink).toContain("optic.works");
      }

      console.log("[Email Test] Welcome email verified!");
    }
  });

  test("order confirmation email contains correct product details", async ({ page }) => {
    // More detailed verification of order confirmation email content
    test.setTimeout(120000);

    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    const testEmail = mailosaurConfig.generateEmail();
    console.log(`[Email Test] Using email: ${testEmail}`);

    // Complete checkout
    await productPage.goto(testProducts.flagship.slug);
    await productPage.waitForProduct();
    await productPage.addToCart();

    await cartPage.goto();
    await cartPage.waitForCartHydration();
    await cartPage.proceedToPayment();

    await checkoutPage.waitForCheckoutReady();
    await checkoutPage.fillEmail(testEmail);
    await checkoutPage.fillShippingAddress(testAddress);

    // Select shipping rate
    await checkoutPage.waitForShippingRates();
    const rates = await checkoutPage.getAvailableShippingRates();
    if (rates.length > 0) {
      await checkoutPage.selectShippingRate(rates[0]);
      await page.waitForTimeout(2000);
    }

    await checkoutPage.waitForStripeElements();
    await checkoutPage.fillCardDetails(testCards.success);
    await checkoutPage.submitPayment();
    await checkoutPage.waitForSuccess();

    // Wait for and verify email
    const email = await waitForEmail(testEmail, {
      subject: "Order Confirmation",
      timeout: 60000,
    });

    expect(email).not.toBeNull();
    if (email) {
      // Verify product is listed
      expect(emailContainsText(email, testProducts.flagship.name)).toBe(true);

      // Verify shipping address
      expect(emailContainsText(email, testAddress.city)).toBe(true);
      expect(emailContainsText(email, testAddress.state)).toBe(true);

      // Verify order totals are present (not specific values due to tax variations)
      expect(emailContainsText(email, "Subtotal")).toBe(true);
      expect(emailContainsText(email, "Shipping")).toBe(true);
      expect(emailContainsText(email, "Tax")).toBe(true);
      expect(emailContainsText(email, "Total")).toBe(true);

      // Verify support link exists
      const supportLink = extractLinkFromEmail(email, "Contact Support");
      expect(supportLink).toBeTruthy();

      console.log("[Email Test] Order confirmation content verified!");
    }
  });
});

test.describe("Email Notifications (Mailosaur not configured)", () => {
  // These tests run when Mailosaur is not configured - just verify the flows complete
  test.beforeEach(async () => {
    if (isMailosaurConfigured()) {
      test.skip();
    }
  });

  test("checkout completes successfully (email not verified)", async ({ page }) => {
    // Fallback test that just verifies checkout works
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    const testEmail = `e2e-no-mailosaur-${Date.now()}@optic.works`;

    await productPage.goto(testProducts.flagship.slug);
    await productPage.waitForProduct();
    await productPage.addToCart();

    await cartPage.goto();
    await cartPage.waitForCartHydration();
    await cartPage.proceedToPayment();

    await checkoutPage.waitForCheckoutReady();
    await checkoutPage.fillEmail(testEmail);
    await checkoutPage.fillShippingAddress(testAddress);

    // Select shipping rate
    await checkoutPage.waitForShippingRates();
    const rates = await checkoutPage.getAvailableShippingRates();
    if (rates.length > 0) {
      await checkoutPage.selectShippingRate(rates[0]);
      await page.waitForTimeout(2000);
    }

    await checkoutPage.waitForStripeElements();
    await checkoutPage.fillCardDetails(testCards.success);
    await checkoutPage.submitPayment();
    await checkoutPage.waitForSuccess();

    expect(page.url()).toContain("/success");
    console.log("[Email Test] Checkout completed (email verification skipped - Mailosaur not configured)");
  });
});
