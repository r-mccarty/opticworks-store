import { Page, Locator, expect, FrameLocator } from '@playwright/test';

export interface CardDetails {
  number: string;
  expMonth: string;
  expYear: string;
  cvc: string;
}

/**
 * Page object for the checkout flow.
 * Handles Stripe Elements and payment submission.
 */
export class CheckoutPage {
  readonly page: Page;
  readonly checkoutForm: Locator;
  readonly emailInput: Locator;
  readonly payButton: Locator;
  readonly checkoutLoading: Locator;
  readonly checkoutError: Locator;
  readonly checkoutMessage: Locator;
  readonly successIcon: Locator;
  readonly orderSuccess: Locator;
  readonly shippingSelector: Locator;
  readonly shippingRatesLoading: Locator;
  readonly shippingRatesList: Locator;
  readonly shippingRatesError: Locator;
  readonly shippingDigital: Locator;

  constructor(page: Page) {
    this.page = page;
    this.checkoutForm = page.locator('[data-testid="checkout-form"]');
    this.emailInput = page.locator('[data-testid="checkout-email-input"]');
    this.payButton = page.locator('[data-testid="pay-button"]');
    this.checkoutLoading = page.locator('[data-testid="checkout-loading"]');
    this.checkoutError = page.locator('[data-testid="checkout-error"]');
    this.checkoutMessage = page.locator('[data-testid="checkout-message"]');
    this.successIcon = page.locator('[data-testid="success-icon"]');
    this.orderSuccess = page.locator('[data-testid="order-success"]');
    this.shippingSelector = page.locator('[data-testid="shipping-selector"]');
    this.shippingRatesLoading = page.locator('[data-testid="shipping-rates-loading"]');
    this.shippingRatesList = page.locator('[data-testid="shipping-rates-list"]');
    this.shippingRatesError = page.locator('[data-testid="shipping-rates-error"]');
    this.shippingDigital = page.locator('[data-testid="shipping-selector-digital"]');
  }

  /**
   * Wait for the checkout form to be ready.
   * This includes waiting for Stripe Elements to initialize.
   */
  async waitForCheckoutReady(): Promise<void> {
    console.log('[CheckoutPage] Waiting for checkout to be ready...');

    // Wait for loading state to disappear
    try {
      await this.checkoutLoading.waitFor({ state: 'visible', timeout: 5000 });
      console.log('[CheckoutPage] Loading state detected');
      await this.checkoutLoading.waitFor({ state: 'hidden', timeout: 30000 });
      console.log('[CheckoutPage] Loading state cleared');
    } catch {
      console.log('[CheckoutPage] No loading state detected, continuing...');
    }

    // Check for errors
    const hasError = await this.checkoutError.isVisible().catch(() => false);
    if (hasError) {
      const errorText = await this.checkoutError.textContent();
      console.error(`[CheckoutPage] Checkout error: ${errorText}`);
      throw new Error(`Checkout initialization error: ${errorText}`);
    }

    // Wait for checkout form to appear
    await this.checkoutForm.waitFor({ state: 'visible', timeout: 30000 });
    console.log('[CheckoutPage] Checkout form visible');

    // Wait for Stripe Elements iframe to load
    await this.waitForStripeElements();
  }

  /**
   * Wait for Stripe Elements iframes to be ready.
   */
  async waitForStripeElements(): Promise<void> {
    console.log('[CheckoutPage] Waiting for Stripe Elements...');

    // Wait for at least one Stripe iframe to appear
    const stripeFrame = this.page.locator('iframe[name^="__privateStripeFrame"]').first();
    await stripeFrame.waitFor({ state: 'visible', timeout: 30000 });

    // Wait a moment for Stripe to fully initialize
    await this.page.waitForTimeout(2000);
    console.log('[CheckoutPage] Stripe Elements ready');
  }

  /**
   * Fill the email input.
   */
  async fillEmail(email: string): Promise<void> {
    console.log(`[CheckoutPage] Filling email: ${email}`);
    await this.emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.emailInput.fill(email);
    console.log('[CheckoutPage] Email filled');
  }

  /**
   * Find and return the Stripe Payment Element iframe.
   * The Payment Element uses a nested iframe structure.
   */
  private async findPaymentElementFrame(): Promise<FrameLocator | null> {
    // Stripe Payment Element uses iframes with specific titles
    const frames = this.page.locator('iframe');
    const frameCount = await frames.count();
    console.log(`[CheckoutPage] Found ${frameCount} iframes`);

    for (let i = 0; i < frameCount; i++) {
      const frame = frames.nth(i);
      const title = await frame.getAttribute('title').catch(() => null);
      const name = await frame.getAttribute('name').catch(() => null);
      console.log(`[CheckoutPage] Frame ${i}: title="${title}", name="${name}"`);
    }

    // Look for the Payment Element iframe by title
    const paymentFrame = this.page.frameLocator('iframe[title*="Secure payment"]');
    return paymentFrame;
  }

  /**
   * Fill Stripe card details using the Payment Element.
   * The Payment Element has a unified card input.
   */
  async fillCardDetails(card: CardDetails): Promise<void> {
    console.log('[CheckoutPage] Filling card details...');

    // Scroll to make sure payment section is visible
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.page.waitForTimeout(1000);

    // Find all Stripe iframes and identify the payment input
    const frames = this.page.locator('iframe');
    const frameCount = await frames.count();
    console.log(`[CheckoutPage] Searching ${frameCount} iframes for payment input...`);

    // Try multiple strategies to find and fill the card input
    let filled = false;

    // Strategy 1: Look for iframe with 'payment' in title
    for (let i = 0; i < frameCount && !filled; i++) {
      const frame = frames.nth(i);
      const title = await frame.getAttribute('title').catch(() => '');
      const name = await frame.getAttribute('name').catch(() => '');

      if (title?.toLowerCase().includes('payment') || title?.toLowerCase().includes('card')) {
        console.log(`[CheckoutPage] Trying payment frame ${i}: ${title}`);
        const frameLocator = this.page.frameLocator(`iframe`).nth(i);

        try {
          // Try to find card number input
          const cardInput = frameLocator.locator('input[name="cardNumber"], input[name="number"], input[autocomplete="cc-number"]').first();
          if (await cardInput.isVisible({ timeout: 2000 }).catch(() => false)) {
            await cardInput.fill(card.number);
            console.log('[CheckoutPage] Card number filled via strategy 1');

            // Fill expiry
            const expiryInput = frameLocator.locator('input[name="cardExpiry"], input[name="expiry"], input[autocomplete="cc-exp"]').first();
            await expiryInput.fill(`${card.expMonth}${card.expYear.slice(-2)}`);
            console.log('[CheckoutPage] Expiry filled');

            // Fill CVC
            const cvcInput = frameLocator.locator('input[name="cardCvc"], input[name="cvc"], input[autocomplete="cc-csc"]').first();
            await cvcInput.fill(card.cvc);
            console.log('[CheckoutPage] CVC filled');

            filled = true;
          }
        } catch (e) {
          console.log(`[CheckoutPage] Strategy 1 failed for frame ${i}:`, e);
        }
      }
    }

    // Strategy 2: Try using Stripe's test mode card directly via keyboard
    if (!filled) {
      console.log('[CheckoutPage] Strategy 2: Using Tab navigation...');

      // Click on the payment section to focus it
      const paymentSection = this.page.locator('text=Payment Method, Card, text=Card number').first();
      if (await paymentSection.isVisible({ timeout: 2000 }).catch(() => false)) {
        await paymentSection.click();
        await this.page.waitForTimeout(500);
      }

      // Type card number
      await this.page.keyboard.type(card.number, { delay: 50 });
      await this.page.keyboard.press('Tab');
      await this.page.keyboard.type(`${card.expMonth}${card.expYear.slice(-2)}`, { delay: 50 });
      await this.page.keyboard.press('Tab');
      await this.page.keyboard.type(card.cvc, { delay: 50 });

      console.log('[CheckoutPage] Card details typed via keyboard');
      filled = true;
    }

    if (!filled) {
      throw new Error('Could not fill card details - no suitable input found');
    }

    // Wait for Stripe to validate
    await this.page.waitForTimeout(1000);
  }

  /**
   * Fill shipping address in Stripe Address Element.
   */
  async fillShippingAddress(address: {
    name: string;
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }): Promise<void> {
    console.log('[CheckoutPage] Filling shipping address...');

    // Find the Address Element iframe - it has 'address' in the title
    const frames = this.page.locator('iframe');
    const frameCount = await frames.count();

    for (let i = 0; i < frameCount; i++) {
      const frame = frames.nth(i);
      const title = await frame.getAttribute('title').catch(() => '');
      console.log(`[CheckoutPage] Frame ${i}: title="${title}"`);
    }

    // Try to fill address fields using visible inputs first (non-iframe approach)
    // The Address Element may render some fields outside iframes
    try {
      // Fill full name
      const nameInput = this.page.locator('input[name="name"], input[placeholder*="name" i]').first();
      if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await nameInput.fill(address.name);
        console.log('[CheckoutPage] Name filled');
      }

      // Check for Stripe Address Element iframe
      const addressFrame = this.page.frameLocator('iframe[title*="Address" i], iframe[title*="Shipping" i]');

      // Try filling within the iframe - Use "Secure address input frame" title
      const addressFrameSecure = this.page.frameLocator('iframe[title="Secure address input frame"]');

      const nameInputFrame = addressFrameSecure.locator('input[name="name"]').first();
      if (await nameInputFrame.isVisible({ timeout: 3000 }).catch(() => false)) {
        await nameInputFrame.fill(address.name);
        console.log('[CheckoutPage] Name filled in iframe');
      }

      const line1Input = addressFrameSecure.locator('input[name="addressLine1"]').first();
      if (await line1Input.isVisible({ timeout: 3000 }).catch(() => false)) {
        await line1Input.fill(address.line1);
        console.log('[CheckoutPage] Address line 1 filled');

        // Dismiss Google autocomplete dropdown by pressing Escape
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(300);

        const cityInput = addressFrameSecure.locator('input[name="locality"]').first();
        await cityInput.fill(address.city);
        console.log('[CheckoutPage] City filled');

        // State is a SELECT element, use selectOption
        const stateSelect = addressFrameSecure.locator('select[name="administrativeArea"]').first();
        if (await stateSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
          await stateSelect.selectOption(address.state);
          console.log('[CheckoutPage] State selected');
        } else {
          // Try as input if not a select
          const stateInput = addressFrameSecure.locator('input[name="administrativeArea"]').first();
          await stateInput.fill(address.state);
          console.log('[CheckoutPage] State filled as input');
        }

        const postalInput = addressFrameSecure.locator('input[name="postalCode"]').first();
        await postalInput.fill(address.postalCode);
        console.log('[CheckoutPage] Postal code filled');

        console.log('[CheckoutPage] Address filled via iframe');
      } else {
        // Fallback: Try keyboard navigation
        console.log('[CheckoutPage] Trying keyboard navigation for address...');

        // Find and click on the Shipping Address section
        const shippingSection = this.page.locator('text=Shipping Address').first();
        await shippingSection.scrollIntoViewIfNeeded();

        // Tab to first address field and fill
        await this.page.keyboard.press('Tab');
        await this.page.keyboard.type(address.name, { delay: 30 });
        await this.page.keyboard.press('Tab');
        await this.page.keyboard.type(address.line1, { delay: 30 });
        // Dismiss Google autocomplete dropdown if it appears
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(300);
        await this.page.keyboard.press('Tab');
        await this.page.keyboard.press('Tab'); // Skip line2
        await this.page.keyboard.type(address.city, { delay: 30 });
        // Dismiss any autocomplete
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(300);
        await this.page.keyboard.press('Tab');
        await this.page.keyboard.type(address.state, { delay: 30 });
        await this.page.keyboard.press('Tab');
        await this.page.keyboard.type(address.postalCode, { delay: 30 });

        console.log('[CheckoutPage] Address filled via keyboard');
      }
    } catch (error) {
      console.log('[CheckoutPage] Address fill failed:', error);
      throw error;
    }

    await this.page.waitForTimeout(1000);
  }

  /**
   * Submit the payment.
   */
  async submitPayment(): Promise<void> {
    console.log('[CheckoutPage] Submitting payment...');

    // Wait for pay button to be enabled
    await expect(this.payButton).toBeEnabled({ timeout: 10000 });

    await this.payButton.click();
    console.log('[CheckoutPage] Pay button clicked');
  }

  /**
   * Wait for successful payment and redirect to success page.
   */
  async waitForSuccess(timeout = 60000): Promise<void> {
    console.log('[CheckoutPage] Waiting for payment success...');

    // Wait for redirect to success page
    await this.page.waitForURL('**/store/cart/success**', { timeout });
    console.log('[CheckoutPage] Redirected to success page');

    // Verify success page is showing - just check for order-success div (success-icon is a child of it)
    await expect(this.orderSuccess).toBeVisible({ timeout: 10000 });
    console.log('[CheckoutPage] Success confirmed');
  }

  /**
   * Check if there's an error message displayed.
   */
  async getErrorMessage(): Promise<string | null> {
    const isVisible = await this.checkoutError.isVisible().catch(() => false);
    if (!isVisible) return null;
    return await this.checkoutError.textContent();
  }

  /**
   * Check if there's a processing/status message.
   */
  async getStatusMessage(): Promise<string | null> {
    const isVisible = await this.checkoutMessage.isVisible().catch(() => false);
    if (!isVisible) return null;
    return await this.checkoutMessage.textContent();
  }

  // ===== Shipping Methods =====

  /**
   * Wait for shipping rates to be loaded.
   * Should be called after filling the shipping address.
   */
  async waitForShippingRates(timeout = 15000): Promise<void> {
    console.log('[CheckoutPage] Waiting for shipping rates...');

    // First check if loading state appears
    try {
      await this.shippingRatesLoading.waitFor({ state: 'visible', timeout: 5000 });
      console.log('[CheckoutPage] Shipping rates loading...');
    } catch {
      // Loading state may have passed quickly
      console.log('[CheckoutPage] Loading state not detected, checking for rates...');
    }

    // Wait for either rates list OR digital-only OR error
    await Promise.race([
      this.shippingRatesList.waitFor({ state: 'visible', timeout }),
      this.shippingDigital.waitFor({ state: 'visible', timeout }),
      this.shippingRatesError.waitFor({ state: 'visible', timeout }),
    ]);

    console.log('[CheckoutPage] Shipping rates ready');
  }

  /**
   * Check if the order is digital-only (no shipping needed).
   */
  async isDigitalOnly(): Promise<boolean> {
    return await this.shippingDigital.isVisible().catch(() => false);
  }

  /**
   * Get all available shipping rate IDs.
   */
  async getAvailableShippingRates(): Promise<string[]> {
    const rateLabels = this.page.locator('[data-testid^="shipping-rate-"]');
    const count = await rateLabels.count();

    const rates: string[] = [];
    for (let i = 0; i < count; i++) {
      const testId = await rateLabels.nth(i).getAttribute('data-testid');
      if (testId) {
        rates.push(testId.replace('shipping-rate-', ''));
      }
    }

    console.log(`[CheckoutPage] Found ${rates.length} shipping rates:`, rates);
    return rates;
  }

  /**
   * Select a specific shipping rate by ID.
   */
  async selectShippingRate(rateId: string): Promise<void> {
    console.log(`[CheckoutPage] Selecting shipping rate: ${rateId}`);

    const rateLabel = this.page.locator(`[data-testid="shipping-rate-${rateId}"]`);
    await rateLabel.waitFor({ state: 'visible', timeout: 5000 });
    await rateLabel.click();

    console.log('[CheckoutPage] Shipping rate selected');
  }

  /**
   * Get the currently selected shipping rate ID.
   */
  async getSelectedShippingRate(): Promise<string | null> {
    const checkedInput = this.page.locator('[data-testid^="shipping-radio-"]:checked');
    if (await checkedInput.isVisible().catch(() => false)) {
      const testId = await checkedInput.getAttribute('data-testid');
      return testId?.replace('shipping-radio-', '') || null;
    }
    return null;
  }

  /**
   * Get the shipping cost displayed in the order summary.
   */
  async getShippingCost(): Promise<number> {
    // Find the shipping line in order summary
    const shippingLine = this.page.locator('text=Shipping').locator('..').locator('span').last();
    const text = await shippingLine.textContent();

    if (!text) return 0;

    // Handle various formats: "FREE", "$9.99", "Select shipping"
    if (text.includes('FREE') || text.includes('Digital')) {
      return 0;
    }
    if (text.includes('Select')) {
      return -1; // Indicates no shipping selected yet
    }

    // Parse dollar amount
    const match = text.match(/\$?([\d.]+)/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Check if there's a shipping rate error.
   */
  async hasShippingError(): Promise<boolean> {
    return await this.shippingRatesError.isVisible().catch(() => false);
  }

  /**
   * Get the shipping error message if present.
   */
  async getShippingErrorMessage(): Promise<string | null> {
    if (await this.hasShippingError()) {
      return await this.shippingRatesError.textContent();
    }
    return null;
  }
}
