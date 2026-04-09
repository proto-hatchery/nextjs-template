import { test, expect } from "@playwright/test"

/**
 * Essential E2E Test: Authentication Flow
 *
 * This test suite covers ONLY the critical authentication flows.
 * Do not add additional E2E tests - use unit/integration tests for other features.
 *
 * @see docs/architecture/testing.md - Testing Strategy
 */

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    // Start from marketing home page
    await page.goto("/")
  })

  test("should navigate to sign-in page from home", async ({ page }) => {
    // Find and click the sign-in button
    await page.getByRole("link", { name: /iniciar sessão|sign in/i }).click()

    // Should navigate to sign-in page
    await expect(page).toHaveURL(/\/sign-in/)
    await expect(page.getByRole("heading", { name: /bem-vindo|welcome/i })).toBeVisible()
  })

  test("should show error for invalid credentials", async ({ page }) => {
    // Navigate to sign-in
    await page.getByRole("link", { name: /iniciar sessão|sign in/i }).click()
    await page.waitForURL(/\/sign-in/)

    // Fill in invalid credentials
    await page.getByLabel(/e-mail|email/i).fill("invalid@example.com")
    await page.getByLabel(/palavra-passe|password/i, { exact: true }).fill("wrongpassword")

    // Submit form
    await page.getByRole("button", { name: /iniciar sessão|sign in/i }).click()

    // Should show error message
    await expect(page.getByText(/invalid|error|credenciais/i)).toBeVisible({ timeout: 5000 })

    // Should stay on sign-in page
    await expect(page).toHaveURL(/\/sign-in/)
  })

  test("should sign out successfully", async ({ page, context }) => {
    // Note: This test requires a valid test user to be set up
    // In CI, this test will be skipped if no test user is available

    const testEmail = process.env.E2E_TEST_EMAIL
    const testPassword = process.env.E2E_TEST_PASSWORD

    test.skip(!testEmail || !testPassword, "E2E test credentials not configured")

    // Navigate to sign-in
    await page.getByRole("link", { name: /iniciar sessão|sign in/i }).click()
    await page.waitForURL(/\/sign-in/)

    // Sign in with valid credentials
    await page.getByLabel(/e-mail|email/i).fill(testEmail!)
    await page.getByLabel(/palavra-passe|password/i, { exact: true }).fill(testPassword!)
    await page.getByRole("button", { name: /iniciar sessão|sign in/i }).click()

    // Wait for successful redirect
    await page.waitForURL(/\/continue|\/dashboard/i, { timeout: 10000 })

    // Sign out
    await page.getByRole("button", { name: /terminar sessão|sign out|logout/i }).click()

    // Should redirect to signed-out state
    await expect(page).toHaveURL(/\/sign-in|\/\?signedout/i, { timeout: 5000 })

    // Clear cookies to ensure clean state
    await context.clearCookies()
  })

  test("should redirect unauthenticated users from protected routes", async ({ page }) => {
    // Try to access a protected route directly
    await page.goto("/mfa")

    // Should redirect to sign-in
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 5000 })

    // Should show authentication required message
    await expect(page.getByRole("heading", { name: /bem-vindo|welcome|sign in/i })).toBeVisible()
  })
})
