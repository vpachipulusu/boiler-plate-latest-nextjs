# Pricing Page Functionality Fix

This document outlines the changes made to make the pricing page CTAs (Call-To-Action buttons) fully functional.

## Problem Statement

The pricing page had three tiers (Free, Pro, Enterprise) with CTA buttons, but the buttons weren't properly wired to handle user actions:

- "Get Started" and "Start Free Trial" buttons didn't preserve plan selection during signup
- "Contact Sales" button led to a non-existent contact page
- Signup flow didn't capture or store which plan the user selected from pricing

## Solution Overview

The fix involved creating a complete flow from pricing page → signup/contact → user creation with plan preference stored in the database.

## Changes Made

### 1. Contact Page Creation

**File**: `src/app/contact/page.tsx`

- Created a new contact page for Enterprise plan inquiries
- Accepts `plan` query parameter from URL (`/contact?plan=enterprise`)
- Displays selected plan in a read-only field when present
- Includes contact form with fields: firstName, lastName, email, company, subject, message
- Shows contact information cards (Email, Phone, Address)
- Displays business hours

### 2. Signup Page Enhancement

**File**: `src/app/(auth)/signup/page.tsx`

**Changes**:

- Updated function signature to accept `searchParams` prop
- Extracts `plan` parameter from URL query string
- Displays selected plan as a badge at the top of signup form
- Passes `selectedPlan` to `SignupForm` component

```typescript
export default function SignupPage({
  searchParams,
}: {
  searchParams: { plan?: string };
}) {
  const selectedPlan = searchParams.plan;

  return (
    // ... displays badge if plan selected
    <SignupForm selectedPlan={selectedPlan} />
  );
}
```

### 3. SignupForm Component Update

**File**: `src/components/auth/signup-form.tsx`

**Changes**:

- Added `SignupFormProps` interface with `selectedPlan` prop
- Updated component to accept and use `selectedPlan`
- Modified `onSubmit` to pass plan to `verifyTokenAction`

```typescript
interface SignupFormProps {
  selectedPlan?: string;
}

export function SignupForm({ selectedPlan }: SignupFormProps) {
  // ...
  const result = await verifyTokenAction(idToken, {
    selectedPlan: selectedPlan || 'free',
  });
}
```

### 4. Auth Actions Update

**File**: `src/app/actions/auth-actions.ts`

**Changes**:

- Modified `verifyTokenAction` to accept optional `metadata` parameter
- Extracts `selectedPlan` from metadata
- Sets user's `subscriptionTier` when creating new user in database
- Defaults to 'free' tier if no plan specified

```typescript
export async function verifyTokenAction(
  idToken: string,
  metadata?: { selectedPlan?: string }
): Promise<AuthActionResponse> {
  // ...
  if (!user) {
    const subscriptionTier = metadata?.selectedPlan || 'free';

    user = await db.user.create({
      data: {
        // ...
        subscriptionTier,
      },
    });
  }
}
```

## User Flow

### Scenario 1: Pro Plan Signup

1. User visits `/pricing`
2. Clicks "Start Free Trial" on Pro tier → redirects to `/signup?plan=pro`
3. Signup page displays "Selected Plan: pro" badge
4. User fills signup form and submits
5. `SignupForm` passes `selectedPlan: 'pro'` to `verifyTokenAction`
6. User is created with `subscriptionTier: 'pro'` in database
7. User redirected to `/verify-email`

### Scenario 2: Enterprise Inquiry

1. User visits `/pricing`
2. Clicks "Contact Sales" on Enterprise tier → redirects to `/contact?plan=enterprise`
3. Contact page shows "Interested in the Enterprise plan"
4. Contact form displays readonly field "Interested Plan: Enterprise"
5. User submits inquiry to sales team

### Scenario 3: Free Plan Signup

1. User visits `/pricing`
2. Clicks "Get Started" on Free tier → redirects to `/signup`
3. Signup page shows no plan badge (defaults to free)
4. User completes signup
5. User created with `subscriptionTier: 'free'` (default)

## Database Schema

The selected plan is stored in the `User` model's `subscriptionTier` field:

```prisma
model User {
  // ...
  subscriptionTier       String    @default("free")
  subscriptionStatus     String    @default("inactive")
  // ...
}
```

**Valid values**: 'free', 'pro', 'starter', 'enterprise'

## Pricing Page Structure

The pricing page (`src/app/pricing/page.tsx`) defines three tiers:

| Tier       | Price  | CTA Button       | Link                       |
| ---------- | ------ | ---------------- | -------------------------- |
| Free       | $0     | Get Started      | `/signup`                  |
| Pro        | $29/mo | Start Free Trial | `/signup?plan=pro`         |
| Enterprise | $99/mo | Contact Sales    | `/contact?plan=enterprise` |

## Testing Checklist

- [ ] Click "Get Started" on Free tier → lands on signup with no plan badge → creates user with tier 'free'
- [ ] Click "Start Free Trial" on Pro tier → lands on signup with "pro" badge → creates user with tier 'pro'
- [ ] Click "Contact Sales" on Enterprise → lands on contact page with enterprise plan pre-filled
- [ ] Verify database shows correct `subscriptionTier` after signup
- [ ] Test direct navigation to `/signup?plan=enterprise` shows correct badge
- [ ] Test signup without plan parameter defaults to 'free' tier

## Future Enhancements

1. **Stripe Integration**: Connect plan selection to Stripe subscription creation
2. **Plan Enforcement**: Implement middleware to enforce plan limits (storage, projects, etc.)
3. **Plan Upgrade Flow**: Build UI for upgrading/downgrading plans
4. **Contact Form Submission**: Add server action to send contact form emails
5. **Analytics**: Track which plans users select (conversion funnel)
6. **Trial Period**: Implement 14-day free trial logic with expiration handling

## Related Files

- `src/app/pricing/page.tsx` - Pricing page with tier cards
- `src/app/contact/page.tsx` - Contact form for sales inquiries
- `src/app/(auth)/signup/page.tsx` - Signup page wrapper
- `src/components/auth/signup-form.tsx` - Signup form component
- `src/app/actions/auth-actions.ts` - Authentication server actions
- `prisma/schema.prisma` - Database schema with User.subscriptionTier

## Notes

- Plan selection is currently stored but not enforced - you'll need to add subscription logic
- The free tier doesn't require payment, but Pro/Enterprise will need Stripe integration
- Email verification is still required after signup (existing flow)
- Admin users can view subscription tiers in the admin portal at `/admin/users`
