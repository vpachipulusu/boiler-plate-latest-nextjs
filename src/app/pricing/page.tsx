import Link from 'next/link';
import { cookies } from 'next/headers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PricingCard } from '@/components/pricing/pricing-card';
import { adminAuth } from '@/lib/firebase/admin';
import { db } from '@/lib/db/client';

const tiers = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for trying out our platform',
    features: [
      'Up to 3 projects',
      'Basic analytics',
      'Community support',
      '1 GB storage',
      'Basic features',
    ],
    limitations: [
      'No priority support',
      'No advanced features',
      'No team collaboration',
      'Limited API access',
    ],
    cta: 'Get Started',
    href: '/signup',
    popular: false,
  },
  {
    name: 'Pro',
    price: 29,
    description: 'For professionals and growing teams',
    features: [
      'Unlimited projects',
      'Advanced analytics',
      'Priority email support',
      '50 GB storage',
      'All features included',
      'Team collaboration',
      'Advanced API access',
      'Custom integrations',
    ],
    limitations: [],
    cta: 'Start Free Trial',
    href: '/signup?plan=pro',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 99,
    description: 'For large organizations with custom needs',
    features: [
      'Everything in Pro',
      'Unlimited storage',
      '24/7 phone support',
      'Dedicated account manager',
      'Custom SLA',
      'Advanced security',
      'SSO & SAML',
      'Audit logs',
      'Custom contracts',
    ],
    limitations: [],
    cta: 'Contact Sales',
    href: '/contact?plan=enterprise',
    popular: false,
  },
];

async function getUserSession() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
      return { isAuthenticated: false };
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const user = await db.user.findUnique({
      where: { firebaseUid: decodedClaims.uid },
      select: {
        id: true,
        subscriptionTier: true,
      },
    });

    return {
      isAuthenticated: true,
      userTier: user?.subscriptionTier || 'free',
    };
  } catch (error) {
    return { isAuthenticated: false };
  }
}

export default async function PricingPage() {
  const session = await getUserSession();

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight">Simple, Transparent Pricing</h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Choose the plan that's right for you. All plans include a 14-day free trial.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mb-12 grid gap-8 md:grid-cols-3">
          {tiers.map((tier) => (
            <PricingCard
              key={tier.name}
              tier={tier}
              isAuthenticated={session.isAuthenticated}
              userTier={session.userTier}
            />
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-3xl font-bold">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change my plan later?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! You can upgrade or downgrade your plan at any time. Changes will be prorated
                  based on your current billing cycle.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We accept all major credit cards (Visa, MasterCard, American Express, Discover)
                  through our secure payment processor, Stripe.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you offer refunds?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes, we offer a 30-day money-back guarantee. If you're not satisfied with our
                  service, contact us for a full refund.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! All paid plans come with a 14-day free trial. No credit card required to
                  start.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="py-12">
              <h2 className="mb-4 text-3xl font-bold">Ready to get started?</h2>
              <p className="mb-6 text-lg opacity-90">
                Join thousands of satisfied customers today.
              </p>
              <div className="flex justify-center gap-4">
                <Button asChild size="lg" variant="secondary">
                  <Link href="/signup">Start Free Trial</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-transparent">
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
