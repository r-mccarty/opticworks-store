import { Page, Locator, expect } from "@playwright/test"

/**
 * Page object for the login page.
 */
export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator
  readonly forgotPasswordLink: Locator
  readonly registerLink: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.locator('input[name="email"]')
    this.passwordInput = page.locator('input[name="password"]')
    this.submitButton = page.locator('button[type="submit"]')
    this.errorMessage = page.locator(".bg-red-500\\/10")
    this.forgotPasswordLink = page.locator('a[href="/auth/forgot-password"]')
    this.registerLink = page.locator('a[href="/auth/register"]')
  }

  async goto(): Promise<void> {
    console.log("[LoginPage] Navigating to /auth/login")
    await this.page.goto("/auth/login")
    await this.page.waitForLoadState("domcontentloaded")
  }

  async fillEmail(email: string): Promise<void> {
    console.log(`[LoginPage] Filling email: ${email}`)
    await this.emailInput.fill(email)
  }

  async fillPassword(password: string): Promise<void> {
    console.log("[LoginPage] Filling password")
    await this.passwordInput.fill(password)
  }

  async submit(): Promise<void> {
    console.log("[LoginPage] Submitting form")
    await this.submitButton.click()
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillEmail(email)
    await this.fillPassword(password)
    await this.submit()
  }

  async getErrorMessage(): Promise<string | null> {
    const isVisible = await this.errorMessage.isVisible().catch(() => false)
    if (!isVisible) return null
    return await this.errorMessage.textContent()
  }

  async waitForError(): Promise<void> {
    await this.errorMessage.waitFor({ state: "visible", timeout: 10000 })
  }

  async waitForRedirect(expectedPath: string): Promise<void> {
    await this.page.waitForURL(`**${expectedPath}`, { timeout: 10000 })
  }
}

/**
 * Page object for the registration page.
 */
export class RegisterPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly firstNameInput: Locator
  readonly lastNameInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator
  readonly loginLink: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.locator('input[name="email"]')
    this.passwordInput = page.locator('input[name="password"]')
    this.firstNameInput = page.locator('input[name="firstName"]')
    this.lastNameInput = page.locator('input[name="lastName"]')
    this.submitButton = page.locator('button[type="submit"]')
    this.errorMessage = page.locator(".bg-red-500\\/10")
    this.loginLink = page.locator('a[href="/auth/login"]')
  }

  async goto(): Promise<void> {
    console.log("[RegisterPage] Navigating to /auth/register")
    await this.page.goto("/auth/register")
    await this.page.waitForLoadState("domcontentloaded")
  }

  async fillForm(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ): Promise<void> {
    console.log(`[RegisterPage] Filling form for: ${email}`)
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    if (firstName) await this.firstNameInput.fill(firstName)
    if (lastName) await this.lastNameInput.fill(lastName)
  }

  async submit(): Promise<void> {
    console.log("[RegisterPage] Submitting form")
    await this.submitButton.click()
  }

  async register(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ): Promise<void> {
    await this.fillForm(email, password, firstName, lastName)
    await this.submit()
  }

  async getErrorMessage(): Promise<string | null> {
    const isVisible = await this.errorMessage.isVisible().catch(() => false)
    if (!isVisible) return null
    return await this.errorMessage.textContent()
  }

  async waitForError(): Promise<void> {
    await this.errorMessage.waitFor({ state: "visible", timeout: 10000 })
  }

  async waitForRedirect(expectedPath: string): Promise<void> {
    await this.page.waitForURL(`**${expectedPath}`, { timeout: 10000 })
  }
}

/**
 * Page object for the forgot password page.
 */
export class ForgotPasswordPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator
  readonly successMessage: Locator
  readonly loginLink: Locator
  readonly tryAgainButton: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.locator('input[name="email"]')
    this.submitButton = page.locator('button[type="submit"]')
    this.errorMessage = page.locator(".bg-red-500\\/10")
    this.successMessage = page.locator("text=Check Your Email")
    this.loginLink = page.locator('a[href="/auth/login"]')
    this.tryAgainButton = page.locator("text=Try Again")
  }

  async goto(): Promise<void> {
    console.log("[ForgotPasswordPage] Navigating to /auth/forgot-password")
    await this.page.goto("/auth/forgot-password")
    await this.page.waitForLoadState("domcontentloaded")
  }

  async fillEmail(email: string): Promise<void> {
    console.log(`[ForgotPasswordPage] Filling email: ${email}`)
    await this.emailInput.fill(email)
  }

  async submit(): Promise<void> {
    console.log("[ForgotPasswordPage] Submitting form")
    await this.submitButton.click()
  }

  async requestReset(email: string): Promise<void> {
    await this.fillEmail(email)
    await this.submit()
  }

  async waitForSuccess(): Promise<void> {
    await this.successMessage.waitFor({ state: "visible", timeout: 10000 })
  }

  async isSuccessVisible(): Promise<boolean> {
    return await this.successMessage.isVisible().catch(() => false)
  }
}

/**
 * Page object for the account dashboard.
 */
export class AccountPage {
  readonly page: Page
  readonly heading: Locator
  readonly emailDisplay: Locator
  readonly logoutButton: Locator
  readonly loadingState: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.locator("h1")
    this.emailDisplay = page.locator("text=@")
    this.logoutButton = page.locator("text=Sign Out")
    this.loadingState = page.locator("text=Loading")
  }

  async goto(): Promise<void> {
    console.log("[AccountPage] Navigating to /account")
    await this.page.goto("/account")
    await this.page.waitForLoadState("domcontentloaded")
  }

  async waitForLoaded(): Promise<void> {
    // Wait for either the heading to appear or redirect to login
    await Promise.race([
      this.heading.waitFor({ state: "visible", timeout: 10000 }),
      this.page.waitForURL("**/auth/login**", { timeout: 10000 }),
    ])
  }

  async isAuthenticated(): Promise<boolean> {
    const url = this.page.url()
    return !url.includes("/auth/login")
  }

  async getHeading(): Promise<string | null> {
    return await this.heading.textContent()
  }

  async logout(): Promise<void> {
    console.log("[AccountPage] Logging out")
    await this.logoutButton.click()
  }
}
