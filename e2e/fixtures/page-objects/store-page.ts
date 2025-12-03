import { Page, Locator, expect } from "@playwright/test"

/**
 * Page object for the store listing page.
 */
export class StorePage {
  readonly page: Page
  readonly heading: Locator
  readonly productGrid: Locator
  readonly productCards: Locator
  readonly productLinks: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.locator("h1")
    this.productGrid = page.locator(".grid")
    this.productCards = page.locator('[class*="Card"]')
    this.productLinks = page.locator('a[href^="/products/"]')
  }

  async goto(): Promise<void> {
    console.log("[StorePage] Navigating to /store")
    await this.page.goto("/store")
    await this.page.waitForLoadState("domcontentloaded")
  }

  async waitForProducts(): Promise<void> {
    console.log("[StorePage] Waiting for products to load")
    // Wait for at least one product link to appear
    await this.productLinks.first().waitFor({ state: "visible", timeout: 15000 })
    console.log("[StorePage] Products loaded")
  }

  async getProductCount(): Promise<number> {
    const count = await this.productLinks.count()
    console.log(`[StorePage] Found ${count} products`)
    return count
  }

  async getProductNames(): Promise<string[]> {
    const names: string[] = []
    const cards = await this.productCards.all()
    for (const card of cards) {
      const name = await card.locator("h3").textContent()
      if (name) names.push(name)
    }
    return names
  }

  /**
   * Click on a product by its name.
   * Uses the "View Details" button to ensure navigation.
   */
  async clickProduct(productName: string): Promise<void> {
    console.log(`[StorePage] Clicking on product: ${productName}`)
    // Find the card containing the product name and click its View Details link
    const card = this.page.locator(`text=${productName}`).first().locator("xpath=ancestor::a[contains(@href, '/products/')]")
    await card.click()
    await this.page.waitForURL("**/products/**", { timeout: 10000 })
    await this.page.waitForLoadState("domcontentloaded")
    console.log(`[StorePage] Navigated to: ${this.page.url()}`)
  }

  /**
   * Click on a product by index (0-based).
   * Uses direct navigation to the href to avoid click interception issues.
   */
  async clickProductByIndex(index: number): Promise<void> {
    console.log(`[StorePage] Clicking on product at index: ${index}`)
    const href = await this.productLinks.nth(index).getAttribute("href")
    if (!href) throw new Error(`No href found for product at index ${index}`)
    await this.page.goto(href)
    await this.page.waitForLoadState("domcontentloaded")
    console.log(`[StorePage] Navigated to: ${this.page.url()}`)
  }

  /**
   * Get the href of a product link by index.
   */
  async getProductHref(index: number): Promise<string | null> {
    const link = this.productLinks.nth(index)
    return await link.getAttribute("href")
  }

  /**
   * Get all product hrefs.
   */
  async getAllProductHrefs(): Promise<string[]> {
    const hrefs: string[] = []
    const count = await this.productLinks.count()
    for (let i = 0; i < count; i++) {
      const href = await this.productLinks.nth(i).getAttribute("href")
      if (href) hrefs.push(href)
    }
    return hrefs
  }

  /**
   * Verify that all product links are valid (not 404).
   */
  async verifyProductLinks(): Promise<{ valid: string[]; invalid: string[] }> {
    const hrefs = await this.getAllProductHrefs()
    const valid: string[] = []
    const invalid: string[] = []

    for (const href of hrefs) {
      if (!href) continue
      // Check if href looks valid (should be /products/some-slug)
      if (href.match(/^\/products\/[a-z0-9-]+$/)) {
        valid.push(href)
      } else {
        invalid.push(href)
      }
    }

    console.log(`[StorePage] Valid links: ${valid.length}, Invalid: ${invalid.length}`)
    return { valid, invalid }
  }
}
