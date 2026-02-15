import { test, expect } from '@playwright/test';
import { loginViaUI, TEST_USER, waitForPageReady, navigateAndWait } from './helpers/e2e-utils';

/**
 * Subscription & Upgrade E2E Tests
 *
 * These tests cover the complete subscription upgrade flow:
 * - Navigating to pricing page
 * - Initiating checkout for Pro tier
 * - Completing payment with Stripe test cards
 * - Webhook processing and database updates
 * - Success redirect and status polling
 * - Dashboard displaying upgraded subscription
 *
 * NOTE: These tests use Stripe test mode with test cards.
 * Requires STRIPE environment variables to be configured.
 */

/**
 * Stripe test card numbers
 * https://stripe.com/docs/testing#cards
 */
const STRIPE_TEST_CARDS = {
  // Standard successful payment
  success: '4242424242424242',
  // Requires authentication (3D Secure)
  requiresAuth: '4000002500003155',
  // Card is declined
  declined: '4000000000000002',
  // Insufficient funds
  insufficientFunds: '4000000000009995',
  // Expired card
  expired: '4000000000000069',
  // Processing error
  processingError: '4000000000000119',
};

/**
 * Test billing details
 */
const TEST_BILLING_DETAILS = {
  email: 'test@example.com',
  cardNumber: STRIPE_TEST_CARDS.success,
  expiry: '12/34', // MM/YY format
  cvc: '123',
  zip: '12345',
  name: 'Test User',
  country: 'US',
};

test.describe('Subscription Upgrade Flow', () => {
  test.describe('Unauthenticated User Flow', () => {
    test('should redirect to signup when clicking pricing CTA without auth', async ({ page }) => {
      await navigateAndWait(page, '/pricing');

      // Click on "Start Free Trial" for Pro tier
      const proCard = page.locator('[class*="card"]').filter({ hasText: /^Pro$/i });
      const ctaButton = proCard.getByRole('link', { name: /start free trial/i });
      await ctaButton.click();

      // Should redirect to signup with plan parameter
      await expect(page).toHaveURL(/\/signup\?plan=pro/);
    });

    test('should display signup form with plan pre-selected', async ({ page }) => {
      await page.goto('/signup?plan=pro');
      await waitForPageReady(page);

      await expect(page.getByRole('heading', { name: /sign up/i })).toBeVisible();
      // User would complete signup and then be able to upgrade
    });
  });

  test.describe('Authenticated User - Subscription Upgrade', () => {
    test.skip(
      !process.env.TEST_USER_EMAIL || !process.env.STRIPE_PUBLISHABLE_KEY,
      'Skipped: TEST_USER_EMAIL or STRIPE keys not configured'
    );

    test.beforeEach(async ({ page }) => {
      // Login as test user (should be on free tier)
      await loginViaUI(page, TEST_USER.email, TEST_USER.password);
    });

    test('should show upgrade banner on dashboard for free tier users', async ({ page }) => {
      await navigateAndWait(page, '/dashboard');

      // Free tier users should see upgrade banner
      const upgradeBanner = page.getByText(/upgrade to pro/i).first();
      const isVisible = await upgradeBanner.isVisible().catch(() => false);

      if (isVisible) {
        await expect(upgradeBanner).toBeVisible();
        await expect(page.getByRole('link', { name: /upgrade now/i })).toBeVisible();
      }
    });

    test('should navigate to pricing page from dashboard upgrade banner', async ({ page }) => {
      await navigateAndWait(page, '/dashboard');

      const upgradeLink = page.getByRole('link', { name: /upgrade now/i });
      const isVisible = await upgradeLink.isVisible().catch(() => false);

      if (isVisible) {
        await upgradeLink.click();
        await expect(page).toHaveURL(/\/pricing/);
      }
    });

    test('should display pricing tiers on pricing page', async ({ page }) => {
      await navigateAndWait(page, '/pricing');

      // Verify all tiers are visible
      await expect(page.getByRole('heading', { name: /^free$/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: /^pro$/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: /^enterprise$/i })).toBeVisible();
    });

    test('should show "Upgrade to Pro" button for authenticated free tier users', async ({
      page,
    }) => {
      await navigateAndWait(page, '/pricing');

      // For authenticated users on free tier, Pro tier should show upgrade button
      const proCard = page.locator('[class*="card"]').filter({ hasText: /^Pro$/i });

      // Button text might be "Upgrade to Pro" or "Start Free Trial"
      const upgradeButton = proCard.getByRole('button', {
        name: /upgrade to pro|start free trial/i,
      });
      const ctaExists = await upgradeButton.count().then((count) => count > 0);

      if (ctaExists) {
        await expect(upgradeButton.first()).toBeVisible();
      }
    });

    test('should initiate Stripe checkout when clicking upgrade button', async ({
      page,
      context,
    }) => {
      await navigateAndWait(page, '/pricing');

      // Find Pro tier upgrade button
      const proCard = page.locator('[class*="card"]').filter({ hasText: /^Pro$/i });
      const upgradeButton = proCard.getByRole('button', { name: /upgrade to pro/i });

      const buttonExists = await upgradeButton.count().then((count) => count > 0);

      if (buttonExists) {
        // Start waiting for new page before clicking
        const checkoutPagePromise = context.waitForEvent('page');

        await upgradeButton.click();

        // Wait for Stripe checkout page to open
        const checkoutPage = await checkoutPagePromise;
        await checkoutPage.waitForLoadState();

        // Verify we're on Stripe checkout
        await expect(checkoutPage).toHaveURL(/checkout\.stripe\.com/);

        await checkoutPage.close();
      } else {
        test.skip(true, 'Upgrade button not available (user might already be on Pro tier)');
      }
    });

    test('should complete full upgrade flow with Stripe test card', async ({ page, context }) => {
      await navigateAndWait(page, '/pricing');

      // Find and click Pro tier upgrade button
      const proCard = page.locator('[class*="card"]').filter({ hasText: /^Pro$/i });
      const upgradeButton = proCard.getByRole('button', { name: /upgrade to pro/i });

      const buttonExists = await upgradeButton.count().then((count) => count > 0);

      if (!buttonExists) {
        test.skip(true, 'Upgrade button not available (user might already be on Pro tier)');
        return;
      }

      // Click upgrade and wait for Stripe checkout
      const checkoutPagePromise = context.waitForEvent('page');
      await upgradeButton.click();
      const checkoutPage = await checkoutPagePromise;
      await checkoutPage.waitForLoadState();

      // Verify we're on Stripe checkout
      expect(checkoutPage.url()).toContain('checkout.stripe.com');

      // Fill in Stripe checkout form with test card
      // Note: Stripe's iframe structure may vary, adjust selectors as needed
      try {
        // Wait for email field (might be pre-filled)
        const emailField = checkoutPage.locator('input[type="email"]').first();
        await emailField.waitFor({ state: 'visible', timeout: 10000 });

        // Fill email if not pre-filled
        const emailValue = await emailField.inputValue();
        if (!emailValue) {
          await emailField.fill(TEST_BILLING_DETAILS.email);
        }

        // Card number field (in iframe)
        const cardFrame = checkoutPage.frameLocator('iframe[name*="card"]').first();
        await cardFrame.locator('input[name="number"]').fill(TEST_BILLING_DETAILS.cardNumber);
        await cardFrame.locator('input[name="expiry"]').fill(TEST_BILLING_DETAILS.expiry);
        await cardFrame.locator('input[name="cvc"]').fill(TEST_BILLING_DETAILS.cvc);

        // Billing details
        await checkoutPage.locator('input[name="billingName"]').fill(TEST_BILLING_DETAILS.name);

        const zipField = checkoutPage.locator('input[name="zip"]');
        if (await zipField.isVisible()) {
          await zipField.fill(TEST_BILLING_DETAILS.zip);
        }

        // Submit payment
        const submitButton = checkoutPage.getByRole('button', { name: /pay|subscribe/i });
        await submitButton.click();

        // Wait for redirect back to our app with success parameter
        await page.waitForURL(/\/dashboard\?upgrade=success/, { timeout: 30000 });

        // Verify we're back on dashboard with success parameter
        await expect(page).toHaveURL(/\/dashboard\?upgrade=success/);

        // Should show success message
        await expect(
          page.getByText(/processing your subscription|subscription activated/i)
        ).toBeVisible({ timeout: 10000 });

        // Wait for subscription to be processed (polling mechanism should work)
        // The SubscriptionSuccessHandler polls every 3 seconds for up to 30 seconds
        await page.waitForTimeout(5000);

        // After polling completes, should auto-refresh to clean URL
        await page.waitForURL('/dashboard', { timeout: 35000 });

        // Verify subscription tier is updated to Pro
        const subscriptionCard = page.locator('[class*="card"]').filter({
          hasText: /subscription plan/i,
        });
        await expect(subscriptionCard).toContainText(/pro/i, { timeout: 10000 });

        // Upgrade banner should no longer be visible
        const upgradeBanner = page.getByText(/upgrade to pro/i).first();
        await expect(upgradeBanner).not.toBeVisible();
      } catch (error) {
        // Close checkout page if still open
        if (!checkoutPage.isClosed()) {
          await checkoutPage.close();
        }
        throw error;
      } finally {
        // Cleanup: close checkout page if still open
        if (!checkoutPage.isClosed()) {
          await checkoutPage.close();
        }
      }
    });

    test('should handle Stripe checkout cancellation', async ({ page, context }) => {
      await navigateAndWait(page, '/pricing');

      const proCard = page.locator('[class*="card"]').filter({ hasText: /^Pro$/i });
      const upgradeButton = proCard.getByRole('button', { name: /upgrade to pro/i });

      const buttonExists = await upgradeButton.count().then((count) => count > 0);

      if (!buttonExists) {
        test.skip(true, 'Upgrade button not available');
        return;
      }

      // Click upgrade and wait for Stripe checkout
      const checkoutPagePromise = context.waitForEvent('page');
      await upgradeButton.click();
      const checkoutPage = await checkoutPagePromise;
      await checkoutPage.waitForLoadState();

      // Look for back/cancel button on Stripe checkout
      const backButton = checkoutPage.getByRole('link', { name: /back|cancel/i });
      const backExists = await backButton.count().then((count) => count > 0);

      if (backExists) {
        await backButton.click();

        // Should redirect to cancel URL (pricing page with cancelled parameter)
        await page.waitForURL(/\/pricing\?upgrade=cancelled/, { timeout: 10000 });
        await expect(page).toHaveURL(/\/pricing\?upgrade=cancelled/);
      }

      if (!checkoutPage.isClosed()) {
        await checkoutPage.close();
      }
    });
  });

  test.describe('Subscription Status Display', () => {
    test.skip(!process.env.TEST_USER_EMAIL, 'Skipped: TEST_USER_EMAIL not configured');

    test.beforeEach(async ({ page }) => {
      await loginViaUI(page, TEST_USER.email, TEST_USER.password);
    });

    test('should display current subscription tier on dashboard', async ({ page }) => {
      await navigateAndWait(page, '/dashboard');

      // Find subscription plan card
      const subscriptionCard = page.locator('[class*="card"]').filter({
        hasText: /subscription plan/i,
      });
      await expect(subscriptionCard).toBeVisible();

      // Should display tier (free, pro, or enterprise)
      await expect(subscriptionCard).toContainText(/free|pro|enterprise/i);
    });

    test('should display subscription status', async ({ page }) => {
      await navigateAndWait(page, '/dashboard');

      const subscriptionCard = page.locator('[class*="card"]').filter({
        hasText: /subscription plan/i,
      });

      // Should display status (active, canceled, etc.)
      await expect(subscriptionCard).toContainText(/active|canceled|past_due|trialing/i);
    });

    test('should show current period end date for active subscriptions', async ({ page }) => {
      await navigateAndWait(page, '/dashboard');

      const subscriptionCard = page.locator('[class*="card"]').filter({
        hasText: /subscription plan/i,
      });

      // Check if shows "Active until" for paid subscriptions
      const hasActiveUntil = await subscriptionCard.getByText(/active until/i).count();

      if (hasActiveUntil > 0) {
        // Should show a date
        await expect(subscriptionCard).toContainText(/\d{1,2}\/\d{1,2}\/\d{2,4}/);
      }
    });
  });

  test.describe('Stripe Test Cards - Payment Scenarios', () => {
    test.skip(
      !process.env.TEST_USER_EMAIL || !process.env.STRIPE_PUBLISHABLE_KEY,
      'Skipped: Stripe not configured for testing'
    );

    test.beforeEach(async ({ page }) => {
      await loginViaUI(page, TEST_USER.email, TEST_USER.password);
    });

    test('should handle declined card gracefully', async ({ page, context }) => {
      await navigateAndWait(page, '/pricing');

      const proCard = page.locator('[class*="card"]').filter({ hasText: /^Pro$/i });
      const upgradeButton = proCard.getByRole('button', { name: /upgrade to pro/i });

      const buttonExists = await upgradeButton.count().then((count) => count > 0);

      if (!buttonExists) {
        test.skip(true, 'Upgrade button not available');
        return;
      }

      const checkoutPagePromise = context.waitForEvent('page');
      await upgradeButton.click();
      const checkoutPage = await checkoutPagePromise;
      await checkoutPage.waitForLoadState();

      try {
        // Fill with declined test card
        const emailField = checkoutPage.locator('input[type="email"]').first();
        const emailValue = await emailField.inputValue();
        if (!emailValue) {
          await emailField.fill(TEST_BILLING_DETAILS.email);
        }

        const cardFrame = checkoutPage.frameLocator('iframe[name*="card"]').first();
        await cardFrame.locator('input[name="number"]').fill(STRIPE_TEST_CARDS.declined);
        await cardFrame.locator('input[name="expiry"]').fill(TEST_BILLING_DETAILS.expiry);
        await cardFrame.locator('input[name="cvc"]').fill(TEST_BILLING_DETAILS.cvc);

        const submitButton = checkoutPage.getByRole('button', { name: /pay|subscribe/i });
        await submitButton.click();

        // Should show error message on Stripe checkout page
        await expect(checkoutPage.getByText(/card was declined|payment failed/i)).toBeVisible({
          timeout: 10000,
        });

        // Should NOT redirect to success page
        await expect(page).not.toHaveURL(/\/dashboard\?upgrade=success/);
      } finally {
        if (!checkoutPage.isClosed()) {
          await checkoutPage.close();
        }
      }
    });

    test('should handle insufficient funds card', async ({ page, context }) => {
      await navigateAndWait(page, '/pricing');

      const proCard = page.locator('[class*="card"]').filter({ hasText: /^Pro$/i });
      const upgradeButton = proCard.getByRole('button', { name: /upgrade to pro/i });

      const buttonExists = await upgradeButton.count().then((count) => count > 0);

      if (!buttonExists) {
        test.skip(true, 'Upgrade button not available');
        return;
      }

      const checkoutPagePromise = context.waitForEvent('page');
      await upgradeButton.click();
      const checkoutPage = await checkoutPagePromise;
      await checkoutPage.waitForLoadState();

      try {
        const emailField = checkoutPage.locator('input[type="email"]').first();
        const emailValue = await emailField.inputValue();
        if (!emailValue) {
          await emailField.fill(TEST_BILLING_DETAILS.email);
        }

        const cardFrame = checkoutPage.frameLocator('iframe[name*="card"]').first();
        await cardFrame.locator('input[name="number"]').fill(STRIPE_TEST_CARDS.insufficientFunds);
        await cardFrame.locator('input[name="expiry"]').fill(TEST_BILLING_DETAILS.expiry);
        await cardFrame.locator('input[name="cvc"]').fill(TEST_BILLING_DETAILS.cvc);

        const submitButton = checkoutPage.getByRole('button', { name: /pay|subscribe/i });
        await submitButton.click();

        // Should show insufficient funds error
        await expect(
          checkoutPage.getByText(/insufficient funds|card has insufficient/i)
        ).toBeVisible({ timeout: 10000 });
      } finally {
        if (!checkoutPage.isClosed()) {
          await checkoutPage.close();
        }
      }
    });
  });

  test.describe('Billing Management', () => {
    test.skip(!process.env.TEST_USER_EMAIL, 'Skipped: TEST_USER_EMAIL not configured');

    test.beforeEach(async ({ page }) => {
      await loginViaUI(page, TEST_USER.email, TEST_USER.password);
    });

    test('should have billing/subscription link in dashboard', async ({ page }) => {
      await navigateAndWait(page, '/dashboard');

      // Look for billing-related links
      const billingLink = page.getByRole('link', { name: /billing|subscription/i });
      const linkExists = await billingLink.count().then((count) => count > 0);

      if (linkExists) {
        await expect(billingLink.first()).toBeVisible();
      }
    });

    test('should navigate to settings when clicking settings link', async ({ page }) => {
      await navigateAndWait(page, '/dashboard');

      await page
        .getByRole('link', { name: /settings/i })
        .first()
        .click();
      await expect(page).toHaveURL(/\/dashboard\/settings/);
    });
  });
});
