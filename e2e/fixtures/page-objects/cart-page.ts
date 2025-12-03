import { Page, Locator, expect } from '@playwright/test';

/**
 * Page object for the cart page.
 * Handles cart viewing and checkout initiation.
 */
export class CartPage {
  readonly page: Page;
  readonly proceedToPaymentButton: Locator;
  readonly emptyCartMessage: Locator;
  readonly loadingState: Locator;
  readonly cartItems: Locator;
  readonly orderSummary: Locator;

  constructor(page: Page) {
    this.page = page;
    this.proceedToPaymentButton = page.locator('[data-testid="proceed-to-payment-button"]');
    this.emptyCartMessage = page.locator('text=Your Cart is Empty');
    this.loadingState = page.locator('text=Loading');
    this.cartItems = page.locator('[data-testid^="cart-item-"]');
    this.orderSummary = page.locator('[data-testid="order-summary"]');
  }

  /**
   * Navigate to the cart page.
   */
  async goto(): Promise<void> {
    console.log('[CartPage] Navigating to /store/cart');
    await this.page.goto('/store/cart');
    await this.page.waitForLoadState('domcontentloaded');
    console.log(`[CartPage] Page loaded: ${this.page.url()}`);

    // Wait for cart to hydrate from localStorage
    await this.waitForCartHydration();
  }

  /**
   * Wait for the cart to hydrate from localStorage.
   * Zustand hydration can cause a brief loading state.
   */
  async waitForCartHydration(): Promise<void> {
    console.log('[CartPage] Waiting for cart hydration...');

    // Wait up to 5 seconds for loading state to disappear
    try {
      await this.loadingState.waitFor({ state: 'hidden', timeout: 5000 });
    } catch {
      // Loading state might not appear at all
    }

    // Wait a moment for React to settle
    await this.page.waitForTimeout(500);

    console.log('[CartPage] Cart hydration complete');
  }

  /**
   * Check if the cart has any items.
   */
  async hasItems(): Promise<boolean> {
    // First check if empty message is visible
    const isEmpty = await this.emptyCartMessage.isVisible().catch(() => false);
    if (isEmpty) {
      console.log('[CartPage] Cart is empty (empty message visible)');
      return false;
    }

    // Check for proceed to payment button as indicator of items
    const hasButton = await this.proceedToPaymentButton.isVisible().catch(() => false);
    console.log(`[CartPage] Has items: ${hasButton} (proceed button visible)`);
    return hasButton;
  }

  /**
   * Get the number of cart items displayed.
   */
  async getItemCount(): Promise<number> {
    const count = await this.cartItems.count();
    console.log(`[CartPage] Item count: ${count}`);
    return count;
  }

  /**
   * Click the proceed to payment button.
   */
  async proceedToPayment(): Promise<void> {
    console.log('[CartPage] Clicking proceed to payment...');

    // Ensure button is visible and enabled
    await expect(this.proceedToPaymentButton).toBeVisible({ timeout: 10000 });
    await expect(this.proceedToPaymentButton).toBeEnabled({ timeout: 5000 });

    await this.proceedToPaymentButton.click();
    console.log('[CartPage] Proceed to payment clicked');

    // Wait for checkout to initialize
    await this.page.waitForTimeout(1000);
  }

  /**
   * Get cart item by product ID.
   */
  getCartItem(productId: string): Locator {
    return this.page.locator(`[data-testid="cart-item-${productId}"]`);
  }

  /**
   * Remove an item from the cart.
   */
  async removeItem(productId: string): Promise<void> {
    const removeButton = this.page.locator(`[data-testid="remove-item-${productId}"]`);
    await removeButton.click();
    console.log(`[CartPage] Removed item: ${productId}`);
    await this.page.waitForTimeout(500);
  }

  /**
   * Update item quantity.
   */
  async updateQuantity(productId: string, quantity: number): Promise<void> {
    const input = this.page.locator(`[data-testid="quantity-input-${productId}"]`);
    await input.fill(quantity.toString());
    console.log(`[CartPage] Updated quantity for ${productId} to ${quantity}`);
    await this.page.waitForTimeout(500);
  }
}
