export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const;

export type SubscriptionTier = typeof SUBSCRIPTION_TIERS[keyof typeof SUBSCRIPTION_TIERS];

export interface SubscriptionPlan {
  name: string;
  description: string;
  features: string[];
  price: {
    monthly: number;
    yearly: number;
  };
  stripePriceId: {
    monthly: string;
    yearly: string;
  };
  tier: SubscriptionTier;
  popular?: boolean;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    name: 'Free',
    description: 'Perfect for getting started',
    features: [
      'Up to 3 projects',
      'Basic analytics',
      'Community support',
      '1 GB storage',
    ],
    price: {
      monthly: 0,
      yearly: 0,
    },
    stripePriceId: {
      monthly: '',
      yearly: '',
    },
    tier: SUBSCRIPTION_TIERS.FREE,
  },
  {
    name: 'Pro',
    description: 'For professionals and growing teams',
    features: [
      'Unlimited projects',
      'Advanced analytics',
      'Priority support',
      '50 GB storage',
      'Custom domains',
      'API access',
    ],
    price: {
      monthly: 29,
      yearly: 290,
    },
    stripePriceId: {
      monthly: process.env.STRIPE_PRICE_ID_PRO_MONTHLY || '',
      yearly: process.env.STRIPE_PRICE_ID_PRO_YEARLY || '',
    },
    tier: SUBSCRIPTION_TIERS.PRO,
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For large organizations',
    features: [
      'Everything in Pro',
      'Dedicated account manager',
      '24/7 phone support',
      'Unlimited storage',
      'Advanced security',
      'SLA guarantee',
      'Custom integrations',
    ],
    price: {
      monthly: 99,
      yearly: 990,
    },
    stripePriceId: {
      monthly: process.env.STRIPE_PRICE_ID_ENTERPRISE_MONTHLY || '',
      yearly: process.env.STRIPE_PRICE_ID_ENTERPRISE_YEARLY || '',
    },
    tier: SUBSCRIPTION_TIERS.ENTERPRISE,
  },
];
