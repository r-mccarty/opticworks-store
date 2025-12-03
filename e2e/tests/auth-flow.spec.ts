import { test, expect } from "@playwright/test"
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  AccountPage,
} from "../fixtures/page-objects/auth-page"
import { generateTestEmail, testAuthCredentials } from "../fixtures/test-data"

test.describe("Authentication Flow", () => {
  test("user can register a new account", async ({ page }) => {
    const registerPage = new RegisterPage(page)
    const testEmail = generateTestEmail()

    await registerPage.goto()

    // Fill out registration form
    await registerPage.register(
      testEmail,
      testAuthCredentials.password,
      "E2E",
      "TestUser"
    )

    // Should redirect to account page after successful registration
    await registerPage.waitForRedirect("/account")

    // Verify we're on the account page
    const accountPage = new AccountPage(page)
    await accountPage.waitForLoaded()
    expect(await accountPage.isAuthenticated()).toBe(true)

    console.log(`[Test] Successfully registered user: ${testEmail}`)
  })

  test("registration shows error for weak password", async ({ page }) => {
    const registerPage = new RegisterPage(page)
    const testEmail = generateTestEmail()

    await registerPage.goto()

    // Try to register with weak password
    await registerPage.fillForm(testEmail, testAuthCredentials.weakPassword)
    await registerPage.submit()

    // Should show an error (either client-side validation or server error)
    // The form has minLength=8 on the password field, so this may fail validation
    // Wait a moment for any error to appear
    await page.waitForTimeout(1000)

    // Should still be on register page
    expect(page.url()).toContain("/auth/register")
  })

  test("user can login with valid credentials", async ({ page }) => {
    // First, register a new account
    const registerPage = new RegisterPage(page)
    const testEmail = generateTestEmail()

    await registerPage.goto()
    await registerPage.register(testEmail, testAuthCredentials.password, "E2E", "LoginTest")
    await registerPage.waitForRedirect("/account")

    // Now logout (go to a different page or clear cookies)
    await page.goto("/")
    await page.context().clearCookies()

    // Try to login with the credentials we just registered
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(testEmail, testAuthCredentials.password)

    // Should redirect to account page
    await loginPage.waitForRedirect("/account")

    const accountPage = new AccountPage(page)
    expect(await accountPage.isAuthenticated()).toBe(true)

    console.log(`[Test] Successfully logged in user: ${testEmail}`)
  })

  test("login shows error for invalid credentials", async ({ page }) => {
    const loginPage = new LoginPage(page)

    await loginPage.goto()
    await loginPage.login(
      testAuthCredentials.invalidEmail,
      testAuthCredentials.invalidPassword
    )

    // Should show error message
    await loginPage.waitForError()
    const errorMessage = await loginPage.getErrorMessage()

    expect(errorMessage).toBeTruthy()
    expect(errorMessage?.toLowerCase()).toContain("invalid")

    // Should still be on login page
    expect(page.url()).toContain("/auth/login")
  })

  test("unauthenticated user is redirected from account page", async ({ page }) => {
    // Clear any existing cookies
    await page.context().clearCookies()

    // Try to access account page directly
    const accountPage = new AccountPage(page)
    await accountPage.goto()
    await accountPage.waitForLoaded()

    // Should be redirected to login
    expect(page.url()).toContain("/auth/login")
    expect(page.url()).toContain("redirect")
  })

  test("forgot password page loads and accepts email", async ({ page }) => {
    const forgotPasswordPage = new ForgotPasswordPage(page)
    const testEmail = generateTestEmail()

    await forgotPasswordPage.goto()

    // Verify page loaded
    await expect(page.locator("h1")).toContainText("Reset Password")

    // Submit password reset request
    await forgotPasswordPage.requestReset(testEmail)

    // Should show success message (always, to prevent email enumeration)
    await forgotPasswordPage.waitForSuccess()
    expect(await forgotPasswordPage.isSuccessVisible()).toBe(true)
  })

  test("forgot password link from login page works", async ({ page }) => {
    const loginPage = new LoginPage(page)

    await loginPage.goto()

    // Click forgot password link
    await loginPage.forgotPasswordLink.click()
    await page.waitForLoadState("domcontentloaded")

    // Should be on forgot password page
    expect(page.url()).toContain("/auth/forgot-password")
    await expect(page.locator("h1")).toContainText("Reset Password")
  })

  test("login page links to register page", async ({ page }) => {
    const loginPage = new LoginPage(page)

    await loginPage.goto()

    // Click register link
    await loginPage.registerLink.click()
    await page.waitForLoadState("domcontentloaded")

    // Should be on register page
    expect(page.url()).toContain("/auth/register")
  })

  test("register page links to login page", async ({ page }) => {
    const registerPage = new RegisterPage(page)

    await registerPage.goto()

    // Click login link
    await registerPage.loginLink.click()
    await page.waitForLoadState("domcontentloaded")

    // Should be on login page
    expect(page.url()).toContain("/auth/login")
  })
})
