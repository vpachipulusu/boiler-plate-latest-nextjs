import { type Page, type BrowserContext, expect } from '@playwright/test';

/**
 * Test credentials for E2E tests.
 * These should match seeded test users in the test database.
 */
export const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'testuser@example.com',
  password: process.env.TEST_USER_PASSWORD || 'TestPass123!',
  name: 'Test User',
};

export const TEST_ADMIN = {
  email: process.env.TEST_ADMIN_EMAIL || 'admin@example.com',
  password: process.env.TEST_ADMIN_PASSWORD || 'AdminPass123!',
  name: 'Admin User',
};

/**
 * Log in a user via the login form UI.
 * Use this when testing the actual login flow.
 */
export async function loginViaUI(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();

  // Wait for navigation to dashboard
  await page.waitForURL(/\/dashboard/, { timeout: 15_000 });
}

/**
 * Set a mock session cookie for authenticated tests.
 * This bypasses the Firebase auth flow for faster, more reliable tests.
 */
export async function setSessionCookie(
  context: BrowserContext,
  sessionValue = 'test-session-cookie'
): Promise<void> {
  await context.addCookies([
    {
      name: 'session',
      value: sessionValue,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
  ]);
}

/**
 * Assert that the page redirects unauthenticated users to login.
 */
export async function expectRedirectToLogin(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForURL(/\/login/, { timeout: 10_000 });
  await expect(page).toHaveURL(/\/login/);
}

/**
 * Assert that a toast notification appears with the expected text.
 */
export async function expectToast(page: Page, text: string | RegExp): Promise<void> {
  const toast = page.locator('[data-sonner-toast], [role="status"], [data-radix-toast-viewport] li');
  await expect(toast.filter({ hasText: text }).first()).toBeVisible({ timeout: 5_000 });
}

/**
 * Wait for page to be fully loaded (no network activity + DOM stable).
 */
export async function waitForPageReady(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Check that a card metric displays a specific value pattern.
 */
export async function expectMetricCard(
  page: Page,
  title: string | RegExp,
  valuePattern?: string | RegExp
): Promise<void> {
  const card = page.locator('[class*="card"]').filter({ hasText: title });
  await expect(card.first()).toBeVisible();
  if (valuePattern) {
    await expect(card.first()).toContainText(valuePattern);
  }
}

/**
 * Navigate to a page and wait for it to be ready.
 */
export async function navigateAndWait(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await waitForPageReady(page);
}
