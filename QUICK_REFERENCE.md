# Quick Reference Guide

## 🏗️ Project Structure

```
c:\MainData\NewSourceCode\boiler-plate-latest-nextjs\
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/               # Auth pages (login, signup, etc.)
│   │   ├── (dashboard)/          # Customer dashboard (TO DO)
│   │   ├── (admin)/              # Admin dashboard (TO DO)
│   │   ├── (marketing)/          # Marketing pages (TO DO)
│   │   ├── actions/              # Server Actions ✅
│   │   ├── api/                  # API Routes ✅
│   │   ├── layout.tsx            # Root layout ✅
│   │   ├── page.tsx              # Landing page ✅
│   │   └── globals.css           # Global styles ✅
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components ✅
│   │   ├── auth/                 # Auth components ✅
│   │   ├── providers/            # React providers ✅
│   │   ├── customer/             # Customer components (TO DO)
│   │   ├── admin/                # Admin components (TO DO)
│   │   └── layout/               # Layout components (TO DO)
│   ├── lib/
│   │   ├── db/                   # Database client ✅
│   │   ├── firebase/             # Firebase setup ✅
│   │   ├── stripe/               # Stripe integration ✅
│   │   ├── middleware/           # Middleware functions ✅
│   │   ├── stores/               # Zustand stores (TO DO)
│   │   ├── services/             # Service layer (TO DO)
│   │   └── utils/                # Utility functions ✅
│   ├── config/                   # Configuration files ✅
│   └── hooks/                    # Custom hooks ✅
├── prisma/
│   └── schema.prisma             # Database schema ✅
├── public/                       # Static assets
└── __tests__/                    # Tests (TO DO)
```

## 🔑 Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
# Database
DATABASE_URL="postgresql://..."

# Firebase (get from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
FIREBASE_ADMIN_PRIVATE_KEY="..."

# Stripe (get from Stripe Dashboard)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 📝 Common Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm db:generate      # Generate Prisma Client
pnpm db:push          # Push schema to database
pnpm db:studio        # Open Prisma Studio
pnpm db:migrate       # Run migrations

# Testing
pnpm test             # Run unit tests
pnpm test:e2e         # Run E2E tests
pnpm test:coverage    # Run with coverage

# Code Quality
pnpm lint             # Run ESLint
pnpm format           # Format with Prettier
pnpm typecheck        # Check TypeScript
```

## 🚀 Server Actions Reference

### Authentication Actions
```typescript
import { loginAction, signUpAction, logoutAction } from '@/app/actions/auth-actions';

// Login
const result = await loginAction(idToken);

// Sign up
const result = await signUpAction({ email, password });

// Logout
await logoutAction();
```

### User Actions
```typescript
import {
  getUserProfileAction,
  updateUserProfileAction,
  updateUserSettingsAction
} from '@/app/actions/user-actions';

// Get profile
const profile = await getUserProfileAction();

// Update profile
await updateUserProfileAction({ displayName: 'John' });

// Update settings
await updateUserSettingsAction({ theme: 'dark' });
```

### Subscription Actions
```typescript
import {
  createCheckoutSessionAction,
  getSubscriptionStatusAction
} from '@/app/actions/subscription-actions';

// Create checkout
const session = await createCheckoutSessionAction({ priceId });

// Get status
const status = await getSubscriptionStatusAction();
```

## 🔐 Firebase Auth Helpers

```typescript
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOut
} from '@/lib/firebase/auth-helpers';

// Email login
const { user, idToken, error } = await signInWithEmail(email, password);

// Email signup
const { user, idToken, error } = await signUpWithEmail(email, password);

// Google OAuth
const { user, idToken, error } = await signInWithGoogle();

// Sign out
await signOut();
```

## 💳 Stripe Integration

```typescript
import {
  createCheckoutSession,
  createBillingPortalSession,
  cancelSubscription
} from '@/lib/stripe/subscriptions';

// Create checkout session
const session = await createCheckoutSession({
  userId: 'user_id',
  priceId: process.env.STRIPE_PRICE_ID_PRO!,
  email: 'user@example.com',
});

// Billing portal
const portalSession = await createBillingPortalSession({
  customerId: 'cus_...',
});

// Cancel subscription
await cancelSubscription({
  subscriptionId: 'sub_...',
  cancelAtPeriodEnd: true,
});
```

## 🎨 UI Components Usage

```typescript
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

// Button variants
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Card
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content here</CardContent>
</Card>

// Form
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" />
</div>

// Toast
const { toast } = useToast();
toast({
  title: "Success!",
  description: "Your changes have been saved.",
});
```

## 📊 Database Queries (Prisma)

```typescript
import { db } from '@/lib/db/client';

// Find user
const user = await db.user.findUnique({
  where: { email: 'user@example.com' },
  include: { settings: true },
});

// Create user
const user = await db.user.create({
  data: {
    firebaseUid: 'uid',
    email: 'user@example.com',
    settings: {
      create: { theme: 'system' },
    },
  },
});

// Update user
await db.user.update({
  where: { id: 'user_id' },
  data: { displayName: 'New Name' },
});

// List users (admin)
const users = await db.user.findMany({
  take: 10,
  skip: 0,
  orderBy: { createdAt: 'desc' },
});
```

## 🛡️ Middleware & Auth

```typescript
// In middleware.ts - routes are automatically protected
// Protected routes: /dashboard/*, /settings/*, /profile/*, /admin/*

// In Server Actions - verify auth
import { adminAuth } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';

const sessionCookie = cookies().get('session')?.value;
const decodedToken = await adminAuth.verifySessionCookie(sessionCookie!);
```

## 🧪 Testing Patterns

```typescript
// Unit test example
import { describe, it, expect } from 'vitest';

describe('validateEmail', () => {
  it('should return true for valid email', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });
});

// E2E test example (Playwright)
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

## 🐛 Debugging Tips

```typescript
// Enable Prisma query logging
// In src/lib/db/client.ts, client is already configured with logs in dev

// Check Firebase token
import { adminAuth } from '@/lib/firebase/admin';
const decodedToken = await adminAuth.verifyIdToken(token);
console.log(decodedToken);

// Test Stripe webhooks locally
// Use Stripe CLI: stripe listen --forward-to localhost:3000/api/webhooks/stripe

// Check database directly
// Run: pnpm db:studio
```

## 📱 Mobile Development (Capacitor)

```bash
# Initialize Capacitor
pnpm cap:init

# Add platforms
pnpm cap:add:ios
pnpm cap:add:android

# Build and sync
pnpm build:mobile
pnpm cap:sync

# Open in IDE
pnpm cap:open:ios
pnpm cap:open:android
```

## 🚢 Deployment Checklist

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Update `NEXT_PUBLIC_APP_URL` to production domain
5. Deploy!

### Environment Variables to Set
- All Firebase credentials
- All Stripe keys (use production keys)
- Production database URL
- Update webhook URLs in Stripe Dashboard

### Post-Deployment
1. Update Firebase authorized domains
2. Update Stripe webhook URL
3. Update OAuth redirect URIs
4. Test authentication flow
5. Test payment flow

## 🔗 Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [TailwindCSS](https://tailwindcss.com)

## 💬 Support

Check these files for detailed information:
- `README.md` - Project overview
- `SETUP_GUIDE.md` - Complete setup instructions
- `IMPLEMENTATION_STATUS.md` - What's done and what's left

For issues, check the console errors and review the relevant documentation.

Happy coding! 🎉
