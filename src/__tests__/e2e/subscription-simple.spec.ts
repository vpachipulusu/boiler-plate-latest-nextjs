import { test, expect } from '@playwright/test';
import {
  loginViaUI,
  TEST_USER,
  navigateAndWait,
  STRIPE_TEST_CARDS,
  fillStripeCheckout,
  submitStripeCheckout,
  waitForSubscriptionSuccess,
  expectSubscriptionTier,
} from './helpers/e2e-utils';

/**
 * Simplified Subscription Upgrade E2E Test
 *
 * This test focuses on the critical happy path:
 * 1. Login as free tier user
 * 2. Navigate to pricing page
 * 3. Click upgrade to Pro
 * 4. Complete Stripe checkout
 * 5. Verify success redirect
 * 6. Verify subscription updated
 *
 * Uses helper functions for common operations.
 */

test.describe('Subscription Upgrade - Happy Path', () => {
  test.skip(
    !process.env.TEST_USER_EMAIL || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    'Skipped: TEST_USER_EMAIL or STRIPE not configured'
  );

  test('should successfully upgrade from free to pro tier', async ({ page, context }) => {
    // Step 1: Login as test user
    await loginViaUI(page, TEST_USER.email, TEST_USER.password);

    // Step 2: Navigate to pricing page
    await navigateAndWait(page, '/pricing');

    // Step 3: Find and click Pro tier upgrade button
    const proCard = page.locator('[class*="card"]').filter({ hasText: /^Pro$/i });
    const upgradeButton = proCard.getByRole('button', { name: /upgrade to pro/i });

    const buttonExists = await upgradeButton.count().then((count) => count > 0);

    if (!buttonExists) {
      test.skip(true, 'Upgrade button not available - user may already be on Pro tier');
      return;
    }

    // Step 4: Click upgrade and handle Stripe checkout popup
    const checkoutPagePromise = context.waitForEvent('page');
    await upgradeButton.click();
    const checkoutPage = await checkoutPagePromise;
    await checkoutPage.waitForLoadState();

    // Verify on Stripe checkout
    expect(checkoutPage.url()).toContain('checkout.stripe.com');

    try {
      // Step 5: Fill checkout form with test card
      await fillStripeCheckout(checkoutPage, STRIPE_TEST_CARDS.success);

      // Step 6: Submit payment
      await submitStripeCheckout(checkoutPage);

      // Step 7: Wait for success redirect and webhook processing
      const success = await waitForSubscriptionSuccess(page);
      expect(success).toBe(true);

      // Step 8: Verify subscription tier updated
      await expectSubscriptionTier(page, 'pro');

      // Step 9: Verify upgrade banner is gone
      const upgradeBanner = page.getByText(/upgrade to pro/i).first();
      await expect(upgradeBanner).not.toBeVisible();

      console.log('✅ Subscription upgrade successful!');
    } finally {
      if (!checkoutPage.isClosed()) {
        await checkoutPage.close();
      }
    }
  });
});
