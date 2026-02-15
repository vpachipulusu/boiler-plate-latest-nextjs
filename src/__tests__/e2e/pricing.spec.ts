import { test, expect } from '@playwright/test';
import { waitForPageReady } from './helpers/e2e-utils';

/**
 * Pricing & Marketing Pages E2E Tests
 *
 * These tests cover publicly accessible marketing pages:
 * - Pricing page (tiers, features, FAQ, CTA)
 * - Navigation between marketing and auth pages
 */

test.describe('Pricing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pricing');
    await waitForPageReady(page);
  });

  test.describe('Page Header', () => {
    test('should display pricing page heading', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: /simple.*transparent.*pricing/i })
      ).toBeVisible();
    });

    test('should display pricing page description', async ({ page }) => {
      await expect(page.getByText(/choose the plan that.*right for you/i)).toBeVisible();
      await expect(page.getByText(/14-day free trial/i).first()).toBeVisible();
    });
  });

  test.describe('Pricing Tiers', () => {
    test('should display all 3 pricing tiers', async ({ page }) => {
      await expect(page.getByText(/^free$/i).first()).toBeVisible();
      await expect(page.getByText(/^pro$/i).first()).toBeVisible();
      await expect(page.getByText(/^enterprise$/i).first()).toBeVisible();
    });

    test('should display prices for each tier', async ({ page }) => {
      // Free tier should show $0
      await expect(page.getByRole('heading', { name: /^free$/i })).toBeVisible();
      await expect(page.getByText('$0').first()).toBeVisible();

      // Pro and Enterprise should show a dollar amount (fetched from Stripe)
      await expect(page.getByRole('heading', { name: /^pro$/i })).toBeVisible();
      const proCard = page.locator('[class*="card"]').filter({ hasText: /^Pro$/ });
      await expect(proCard.getByText(/\$\d+/).first()).toBeVisible();

      await expect(page.getByRole('heading', { name: /^enterprise$/i })).toBeVisible();
      const enterpriseCard = page.locator('[class*="card"]').filter({ hasText: /^Enterprise$/ });
      await expect(enterpriseCard.getByText(/\$\d+/).first()).toBeVisible();
    });

    test('should display tier descriptions', async ({ page }) => {
      await expect(page.getByText(/perfect for trying out/i)).toBeVisible();
      await expect(page.getByText(/for professionals and growing/i)).toBeVisible();
      await expect(page.getByText(/for large organizations/i)).toBeVisible();
    });

    test('should display feature lists for each tier', async ({ page }) => {
      // Free tier features
      await expect(page.getByText('Up to 3 projects', { exact: true })).toBeVisible();
      await expect(page.getByText('Basic analytics', { exact: true })).toBeVisible();
      await expect(page.getByText('Community support', { exact: true })).toBeVisible();

      // Pro tier features - use exact match to avoid matching "No team collaboration"
      await expect(page.getByText('Unlimited projects', { exact: true })).toBeVisible();
      await expect(page.getByText('Advanced analytics', { exact: true })).toBeVisible();
      await expect(page.getByText('Priority email support', { exact: true })).toBeVisible();
      await expect(page.getByText('Team collaboration', { exact: true })).toBeVisible();

      // Enterprise tier features
      await expect(page.getByText('Everything in Pro', { exact: true })).toBeVisible();
      await expect(page.getByText('Unlimited storage', { exact: true })).toBeVisible();
      await expect(page.getByText('24/7 phone support', { exact: true })).toBeVisible();
      await expect(page.getByText('Dedicated account manager', { exact: true })).toBeVisible();
    });

    test('should display CTA buttons for each tier', async ({ page }) => {
      await expect(page.getByRole('link', { name: /get started/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /start free trial/i }).first()).toBeVisible();
      await expect(page.getByRole('link', { name: /contact sales/i }).first()).toBeVisible();
    });

    test('should link Free tier to signup page', async ({ page }) => {
      const getStartedLink = page.getByRole('link', { name: /get started/i });
      await expect(getStartedLink).toHaveAttribute('href', '/signup');
    });

    test('should link Pro tier to signup with plan param', async ({ page }) => {
      const startTrialLink = page.getByRole('link', { name: /start free trial/i }).first();
      await expect(startTrialLink).toHaveAttribute('href', '/signup?plan=pro');
    });
  });

  test.describe('FAQ Section', () => {
    test('should display FAQ heading', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: /frequently asked questions/i })
      ).toBeVisible();
    });

    test('should display FAQ items', async ({ page }) => {
      await expect(page.getByText(/can i change my plan later/i)).toBeVisible();
      await expect(page.getByText(/what payment methods/i)).toBeVisible();
      await expect(page.getByText(/do you offer refunds/i)).toBeVisible();
      await expect(page.getByText(/is there a free trial/i)).toBeVisible();
    });

    test('should display FAQ answers', async ({ page }) => {
      await expect(page.getByText(/upgrade or downgrade/i)).toBeVisible();
      await expect(page.getByText(/visa.*mastercard/i)).toBeVisible();
      await expect(page.getByText(/30-day money-back/i)).toBeVisible();
    });
  });

  test.describe('CTA Section', () => {
    test('should display bottom CTA section', async ({ page }) => {
      await expect(page.getByText(/ready to get started/i)).toBeVisible();
      await expect(page.getByText(/thousands of satisfied customers/i)).toBeVisible();
    });

    test('should display CTA buttons', async ({ page }) => {
      // There should be a "Start Free Trial" and "Contact Sales" in the CTA
      const startTrialButtons = page.getByRole('link', { name: /start free trial/i });
      await expect(startTrialButtons.last()).toBeVisible();

      const contactButtons = page.getByRole('link', { name: /contact sales/i });
      await expect(contactButtons.last()).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should display pricing cards in grid on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/pricing');
      await waitForPageReady(page);

      // Grid container should be visible
      const grid = page.locator('.grid.gap-8');
      await expect(grid.first()).toBeVisible();
    });

    test('should stack pricing cards on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/pricing');
      await waitForPageReady(page);

      // All 3 tiers should still be visible
      await expect(page.getByText(/^free$/i).first()).toBeVisible();
      await expect(page.getByText(/^pro$/i).first()).toBeVisible();
      await expect(page.getByText(/^enterprise$/i).first()).toBeVisible();
    });
  });
});
