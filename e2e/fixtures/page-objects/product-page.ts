import { Page, Locator, expect } from '@playwright/test';

/**
 * Page object for product pages.
 * Handles product viewing and add-to-cart interactions.
 */
export class ProductPage {
  readonly page: Page;
  readonly addToCartButton: Locator;
  readonly addToCartCta: Locator;
  readonly productTitle: Locator;
  readonly productPrice: Locator;
  readonly outOfStockBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addToCartButton = page.locator('[data-testid="add-to-cart-button"]');
    this.addToCartCta = page.locator('[data-testid="add-to-cart-cta"]');
    this.productTitle = page.locator('h1');
    this.productPrice = page.locator('[data-testid="product-price"]');
    this.outOfStockBadge = page.locator('text=Out of Stock');
  }

  /**
   * Navigate to a product page by slug.
   */
  async goto(productSlug: string): Promise<void> {
    console.log(`[ProductPage] Navigating to /products/${productSlug}`);
    await this.page.goto(`/products/${productSlug}`);
    await this.page.waitForLoadState('domcontentloaded');
    console.log(`[ProductPage] Page loaded: ${this.page.url()}`);
  }

  /**
   * Wait for the product page to fully load.
   */
  async waitForProduct(): Promise<void> {
    // Wait for either add to cart button or out of stock badge
    await Promise.race([
      this.addToCartButton.waitFor({ state: 'visible', timeout: 15000 }),
      this.outOfStockBadge.waitFor({ state: 'visible', timeout: 15000 }),
    ]).catch(() => {
      // Neither appeared, page might still be loading
      console.log('[ProductPage] Neither add-to-cart nor out-of-stock found within timeout');
    });
  }

  /**
   * Check if the add to cart button is available.
   */
  async isAddToCartAvailable(): Promise<boolean> {
    const button = this.addToCartButton;
    const isVisible = await button.isVisible().catch(() => false);
    if (!isVisible) {
      console.log('[ProductPage] Add to cart button not visible');
      return false;
    }
    const isDisabled = await button.isDisabled();
    console.log(`[ProductPage] Add to cart button visible=${isVisible}, disabled=${isDisabled}`);
    return !isDisabled;
  }

  /**
   * Click the add to cart button.
   */
  async addToCart(): Promise<void> {
    console.log('[ProductPage] Attempting to add to cart...');

    // First check if button exists and is enabled
    const isAvailable = await this.isAddToCartAvailable();
    if (!isAvailable) {
      // Try the CTA button as fallback
      const ctaVisible = await this.addToCartCta.isVisible().catch(() => false);
      if (ctaVisible) {
        console.log('[ProductPage] Using CTA add to cart button instead');
        await this.addToCartCta.click();
        return;
      }
      throw new Error('Add to cart button is not available');
    }

    await this.addToCartButton.click();
    console.log('[ProductPage] Add to cart button clicked');

    // Wait for the cart to update (toast should appear)
    await this.page.waitForTimeout(1500);
  }

  /**
   * Get the product title.
   */
  async getTitle(): Promise<string> {
    return (await this.productTitle.textContent()) ?? '';
  }

  /**
   * Check if product is out of stock.
   */
  async isOutOfStock(): Promise<boolean> {
    return await this.outOfStockBadge.isVisible().catch(() => false);
  }
}
