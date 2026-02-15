'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createCheckoutSessionAction } from '@/app/actions/subscription-actions';
import { useState } from 'react';

interface PricingCardProps {
  tier: {
    name: string;
    price: number;
    description: string;
    features: string[];
    limitations: string[];
    cta: string;
    href: string;
    popular: boolean;
  };
  isAuthenticated: boolean;
  userTier?: string;
}

export function PricingCard({ tier, isAuthenticated, userTier }: PricingCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCTAClick = async (e: React.MouseEvent) => {
    // Enterprise - always go to contact
    if (tier.name === 'Enterprise') {
      return; // Let the Link handle it
    }

    // Free tier - go to signup or dashboard
    if (tier.name === 'Free') {
      return; // Let the Link handle it
    }

    // Pro tier with authenticated user
    if (isAuthenticated && tier.name === 'Pro') {
      e.preventDefault();
      setIsLoading(true);

      try {
        // Create checkout session - price ID is resolved server-side
        const result = await createCheckoutSessionAction(
          'pro',
          'monthly',
          `${window.location.origin}/dashboard?upgrade=success`,
          `${window.location.origin}/pricing?upgrade=cancelled`
        );

        if (result.success && result.data?.url) {
          // Redirect to Stripe Checkout
          window.location.href = result.data.url;
        } else {
          throw new Error(result.error || 'Failed to create checkout session');
        }
      } catch (error) {
        console.error('Checkout error:', error);
        alert('Failed to start checkout. Please try again or contact support.');
        setIsLoading(false);
      }
    }
  };

  // Determine CTA text and state
  const getCTAConfig = () => {
    if (tier.name === 'Free') {
      if (isAuthenticated) {
        return { text: 'Current Plan', disabled: userTier === 'free', href: '/dashboard' };
      }
      return { text: tier.cta, disabled: false, href: tier.href };
    }

    if (tier.name === 'Pro') {
      if (isAuthenticated) {
        if (userTier === 'pro') {
          return { text: 'Current Plan', disabled: true, href: '#' };
        }
        if (userTier === 'enterprise') {
          return { text: 'Downgrade', disabled: true, href: '/settings' };
        }
        return { text: 'Upgrade to Pro', disabled: false, href: '#' };
      }
      return { text: tier.cta, disabled: false, href: tier.href };
    }

    if (tier.name === 'Enterprise') {
      if (isAuthenticated && userTier === 'enterprise') {
        return { text: 'Current Plan', disabled: true, href: '#' };
      }
      return { text: tier.cta, disabled: false, href: tier.href };
    }

    return { text: tier.cta, disabled: false, href: tier.href };
  };

  const ctaConfig = getCTAConfig();

  return (
    <Card className={tier.popular ? 'scale-105 border-primary shadow-lg' : ''}>
      <CardHeader>
        <div className="mb-4 flex items-center justify-between">
          <CardTitle className="text-2xl">{tier.name}</CardTitle>
          {tier.popular && <Badge variant="default">Most Popular</Badge>}
          {isAuthenticated && userTier === tier.name.toLowerCase() && (
            <Badge variant="secondary">Active</Badge>
          )}
        </div>
        <div className="mb-4">
          <span className="text-4xl font-bold">${tier.price}</span>
          {tier.price > 0 && <span className="text-muted-foreground">/month</span>}
        </div>
        <CardDescription>{tier.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Features */}
        <div className="space-y-3">
          {tier.features.map((feature) => (
            <div key={feature} className="flex items-start gap-2">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}

          {tier.limitations.map((limitation) => (
            <div key={limitation} className="flex items-start gap-2 text-muted-foreground">
              <X className="mt-0.5 h-5 w-5 shrink-0" />
              <span className="text-sm">{limitation}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Button
          asChild={tier.name !== 'Pro' || !isAuthenticated}
          className="w-full"
          variant={tier.popular ? 'default' : 'outline'}
          size="lg"
          disabled={ctaConfig.disabled || isLoading}
          onClick={tier.name === 'Pro' && isAuthenticated ? handleCTAClick : undefined}
        >
          {tier.name !== 'Pro' || !isAuthenticated ? (
            <Link href={ctaConfig.href}>{isLoading ? 'Processing...' : ctaConfig.text}</Link>
          ) : (
            <span>{isLoading ? 'Processing...' : ctaConfig.text}</span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
