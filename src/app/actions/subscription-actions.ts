'use server';

import { cookies } from 'next/headers';
import { z } from 'zod';
import Stripe from 'stripe';
import { adminAuth } from '@/lib/firebase/admin';
import { db } from '@/lib/db/client';

/**
 * Initialize Stripe
 */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

/**
 * Response type for subscription actions
 */
type SubscriptionActionResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Get authenticated user ID from session
 */
async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
      return null;
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const user = await db.user.findUnique({
      where: { firebaseUid: decodedClaims.uid },
      select: { id: true },
    });

    return user?.id || null;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * Create checkout session schema
 */
const createCheckoutSessionSchema = z.object({
  priceId: z.string(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

/**
 * Get subscription status
 */
export async function getSubscriptionStatusAction(): Promise<SubscriptionActionResponse> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionTier: true,
        subscriptionStatus: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    let subscriptionDetails = null;

    // Get detailed subscription info from Stripe if exists
    if (user.stripeSubscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        subscriptionDetails = {
          id: subscription.id,
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
        };
      } catch (error) {
        console.error('Failed to retrieve Stripe subscription:', error);
      }
    }

    return {
      success: true,
      data: {
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
        currentPeriodEnd: user.stripeCurrentPeriodEnd,
        stripeSubscription: subscriptionDetails,
      },
    };
  } catch (error: any) {
    console.error('Get subscription status error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get subscription status',
    };
  }
}

/**
 * Create Stripe checkout session
 */
export async function createCheckoutSessionAction(
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<SubscriptionActionResponse> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // Validate input
    const validation = createCheckoutSessionSchema.safeParse({
      priceId,
      successUrl,
      cancelUrl,
    });

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message,
      };
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
          firebaseUid: user.firebaseUid,
        },
      });

      customerId = customer.id;

      // Update user with Stripe customer ID
      await db.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: user.id,
      },
    });

    return {
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    };
  } catch (error: any) {
    console.error('Create checkout session error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create checkout session',
    };
  }
}

/**
 * Create billing portal session
 */
export async function createBillingPortalSessionAction(
  returnUrl: string
): Promise<SubscriptionActionResponse> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });

    if (!user || !user.stripeCustomerId) {
      return {
        success: false,
        error: 'No billing information found',
      };
    }

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });

    return {
      success: true,
      data: {
        url: session.url,
      },
    };
  } catch (error: any) {
    console.error('Create billing portal session error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create billing portal session',
    };
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscriptionAction(): Promise<SubscriptionActionResponse> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { stripeSubscriptionId: true },
    });

    if (!user || !user.stripeSubscriptionId) {
      return {
        success: false,
        error: 'No active subscription found',
      };
    }

    // Cancel subscription at period end
    const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    return {
      success: true,
      data: {
        message: 'Subscription will be canceled at the end of the billing period',
        cancelAt: new Date(subscription.current_period_end * 1000),
      },
    };
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    return {
      success: false,
      error: error.message || 'Failed to cancel subscription',
    };
  }
}

/**
 * Resume subscription (undo cancellation)
 */
export async function resumeSubscriptionAction(): Promise<SubscriptionActionResponse> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { stripeSubscriptionId: true },
    });

    if (!user || !user.stripeSubscriptionId) {
      return {
        success: false,
        error: 'No subscription found',
      };
    }

    // Resume subscription
    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    return {
      success: true,
      data: {
        message: 'Subscription resumed successfully',
      },
    };
  } catch (error: any) {
    console.error('Resume subscription error:', error);
    return {
      success: false,
      error: error.message || 'Failed to resume subscription',
    };
  }
}

/**
 * Update subscription (change plan)
 */
export async function updateSubscriptionAction(newPriceId: string): Promise<SubscriptionActionResponse> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { stripeSubscriptionId: true },
    });

    if (!user || !user.stripeSubscriptionId) {
      return {
        success: false,
        error: 'No active subscription found',
      };
    }

    // Get current subscription
    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);

    // Update subscription with new price
    const updatedSubscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    });

    return {
      success: true,
      data: {
        message: 'Subscription updated successfully',
        subscription: {
          id: updatedSubscription.id,
          status: updatedSubscription.status,
        },
      },
    };
  } catch (error: any) {
    console.error('Update subscription error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update subscription',
    };
  }
}

/**
 * Get subscription invoices
 */
export async function getSubscriptionInvoicesAction(
  limit = 10
): Promise<SubscriptionActionResponse> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });

    if (!user || !user.stripeCustomerId) {
      return {
        success: false,
        error: 'No billing information found',
      };
    }

    // Get invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: user.stripeCustomerId,
      limit,
    });

    const formattedInvoices = invoices.data.map((invoice) => ({
      id: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: invoice.status,
      created: new Date(invoice.created * 1000),
      pdfUrl: invoice.invoice_pdf,
      hostedUrl: invoice.hosted_invoice_url,
    }));

    return {
      success: true,
      data: {
        invoices: formattedInvoices,
        hasMore: invoices.has_more,
      },
    };
  } catch (error: any) {
    console.error('Get invoices error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get invoices',
    };
  }
}

/**
 * Get upcoming invoice
 */
export async function getUpcomingInvoiceAction(): Promise<SubscriptionActionResponse> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true, stripeSubscriptionId: true },
    });

    if (!user || !user.stripeCustomerId || !user.stripeSubscriptionId) {
      return {
        success: false,
        error: 'No active subscription found',
      };
    }

    // Get upcoming invoice
    const invoice = await stripe.invoices.retrieveUpcoming({
      customer: user.stripeCustomerId,
      subscription: user.stripeSubscriptionId,
    });

    return {
      success: true,
      data: {
        amount: invoice.amount_due,
        currency: invoice.currency,
        periodEnd: new Date(invoice.period_end * 1000),
      },
    };
  } catch (error: any) {
    console.error('Get upcoming invoice error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get upcoming invoice',
    };
  }
}

/**
 * Check if user has active subscription
 */
export async function hasActiveSubscriptionAction(): Promise<SubscriptionActionResponse> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionStatus: true,
        stripeCurrentPeriodEnd: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    const hasActive =
      user.subscriptionStatus === 'active' &&
      user.stripeCurrentPeriodEnd &&
      user.stripeCurrentPeriodEnd > new Date();

    return {
      success: true,
      data: {
        hasActiveSubscription: hasActive,
      },
    };
  } catch (error: any) {
    console.error('Check active subscription error:', error);
    return {
      success: false,
      error: error.message || 'Failed to check subscription status',
    };
  }
}
