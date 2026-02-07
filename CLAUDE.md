# Project Instructions for Claude Code

## Project Overview

This is a production-ready **SaaS Boilerplate** built with modern web technologies. It's designed as a comprehensive starter template for building scalable SaaS applications with authentication, subscriptions, multi-platform support, and comprehensive testing.

### Core Purpose
- Provide a complete foundation for SaaS applications
- Support web, PWA, iOS, and Android platforms
- Include enterprise-ready features (auth, payments, admin panel)
- Maintain high code quality with testing and type safety

## Tech Stack

### Frontend
- **Next.js 16** (App Router, React Server Components, Server Actions)
- **React 19** (Latest features including React Compiler optimizations)
- **TypeScript 5.7** (Strict type checking)
- **Tailwind CSS v4** (Utility-first styling)
- **shadcn/ui** (Radix UI components with Tailwind)
- **TanStack Query v5** (Server state management)
- **Zustand v5** (Client state management)
- **React Hook Form** (Form handling with Zod validation)

### Backend
- **Next.js API Routes & Server Actions** (Backend API)
- **Prisma ORM v6** (Type-safe database access)
- **PostgreSQL** (Primary database)
- **Firebase Auth** (Authentication with email/password & OAuth)
- **Firebase Admin SDK** (Server-side auth verification)
- **Stripe** (Payment processing and subscriptions)
- **Resend** (Transactional emails)

### Testing
- **Vitest** (Unit & integration tests)
- **Playwright** (E2E testing)
- **React Testing Library** (Component testing)
- **MSW v2** (API mocking)

### Mobile
- **Capacitor v6** (Native iOS & Android apps)
- **PWA** (Progressive Web App support with next-pwa)

### Development Tools
- **Turbopack** (Fast development builds)
- **ESLint** (Code linting)
- **Prettier** (Code formatting with Tailwind plugin)
- **npm** (Package manager - not pnpm due to Next.js 16 module resolution issues)

## Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication pages (grouped route)
│   │   ├── login/           # Login page
│   │   ├── signup/          # Signup page
│   │   ├── verify-email/    # Email verification
│   │   └── reset-password/  # Password reset
│   ├── (dashboard)/         # Customer dashboard (to be implemented)
│   ├── (admin)/             # Admin panel (to be implemented)
│   ├── (marketing)/         # Public pages (to be implemented)
│   ├── api/                 # API routes
│   │   ├── auth/           # Auth endpoints
│   │   └── webhooks/       # Webhook handlers (Stripe)
│   ├── actions/            # Server Actions
│   │   ├── auth-actions.ts
│   │   ├── user-actions.ts
│   │   ├── subscription-actions.ts
│   │   └── admin/          # Admin-specific actions
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   ├── error.tsx           # Error boundary
│   ├── loading.tsx         # Loading state
│   └── not-found.tsx       # 404 page
│
├── components/
│   ├── ui/                 # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── auth/               # Authentication components
│   │   ├── login-form.tsx
│   │   ├── signup-form.tsx
│   │   ├── oauth-buttons.tsx
│   │   └── password-reset-form.tsx
│   ├── customer/           # Customer-facing components (to be added)
│   ├── admin/              # Admin components (to be added)
│   └── providers/          # Context providers
│       ├── theme-provider.tsx
│       ├── query-provider.tsx
│       └── toast-provider.tsx
│
├── lib/
│   ├── db/                 # Database
│   │   └── client.ts       # Prisma client singleton
│   ├── firebase/           # Firebase setup
│   │   ├── client.ts       # Client-side Firebase
│   │   ├── admin.ts        # Server-side Firebase Admin
│   │   └── auth-helpers.ts # Auth utility functions
│   ├── stripe/             # Stripe integration
│   │   ├── client.ts       # Stripe client
│   │   ├── subscriptions.ts
│   │   └── webhooks.ts
│   ├── middleware/         # Custom middleware
│   │   ├── rate-limit.ts
│   │   └── admin-auth.ts
│   └── utils/              # Utility functions
│       ├── cn.ts           # Class name utility
│       ├── validation.ts   # Validation schemas
│       └── utils.ts        # General utilities
│
├── config/                 # Configuration
│   ├── site.ts            # Site metadata
│   └── subscriptions.ts   # Subscription tiers
│
├── hooks/                  # Custom React hooks
│   └── use-toast.ts
│
├── __tests__/             # Test files
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── e2e/               # E2E tests
│
└── proxy.ts               # Next.js proxy (replaces middleware.ts in Next.js 16+)

prisma/
├── schema.prisma          # Database schema
└── seed.ts                # Database seeding

public/                    # Static assets
```

## Database Schema (Prisma)

### Core Models
1. **User** - Main user table (synced with Firebase Auth)
   - Firebase UID integration
   - Stripe customer linking
   - Profile information
   - Subscription details

2. **UserSettings** - User preferences (theme, notifications, language)
3. **LoginHistory** - Track login events for security
4. **Notification** - In-app notifications
5. **AdminUser** - Admin roles and permissions
6. **AuditLog** - System-wide audit trail
7. **SEOMeta** - SEO metadata per page
8. **URLRedirect** - URL redirection management
9. **AppSettings** - Application-wide settings
10. **FeatureFlag** - Feature toggling
11. **EmailTemplate** - Email template management

## Coding Standards & Conventions

### General Principles
1. **Type Safety First** - Always use TypeScript, avoid `any` types
2. **Server Components by Default** - Use Client Components only when needed
3. **Minimal Client JavaScript** - Prefer Server Components and Actions
4. **Composition over Props Drilling** - Use composition patterns
5. **Error Handling** - Always handle errors gracefully with proper user feedback

### File Naming
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Utilities**: kebab-case (e.g., `auth-helpers.ts`)
- **Server Actions**: kebab-case with `-actions` suffix (e.g., `user-actions.ts`)
- **API Routes**: kebab-case (e.g., `route.ts` in `/api/auth/login/`)

### Component Patterns

#### Server Components (Default)
```typescript
// src/app/dashboard/page.tsx
import { getUser } from '@/lib/auth';
import { db } from '@/lib/db/client';

export default async function DashboardPage() {
  const user = await getUser();
  const data = await db.user.findUnique({ where: { id: user.id } });

  return <div>{data.name}</div>;
}
```

#### Client Components (When Needed)
```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function InteractiveComponent() {
  const [count, setCount] = useState(0);
  return <Button onClick={() => setCount(count + 1)}>{count}</Button>;
}
```

#### Server Actions
```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/client';

export async function updateProfile(formData: FormData) {
  const name = formData.get('name') as string;

  try {
    await db.user.update({
      where: { id: userId },
      data: { displayName: name }
    });

    revalidatePath('/profile');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update profile' };
  }
}
```

### Form Handling
- Use **React Hook Form** with **Zod** validation
- Define schemas in `src/lib/utils/validation.ts`
- Use `@hookform/resolvers/zod` for integration

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export function LoginForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' }
  });

  // ... rest of form
}
```

### API Routes vs Server Actions
- **Prefer Server Actions** for form submissions and mutations
- **Use API Routes** for:
  - Webhooks (e.g., Stripe webhooks)
  - Third-party integrations
  - Public APIs
  - Non-form data mutations

### Database Access
- Always use Prisma client from `src/lib/db/client.ts`
- Use transactions for multi-step operations
- Include proper error handling
- Use typed Prisma models (no raw queries unless necessary)

```typescript
import { db } from '@/lib/db/client';

// Good
const user = await db.user.findUnique({ where: { id: userId } });

// For transactions
await db.$transaction(async (tx) => {
  await tx.user.update({ ... });
  await tx.auditLog.create({ ... });
});
```

### Authentication
- Firebase handles authentication
- Session tokens stored in cookies
- Verify tokens server-side using Firebase Admin SDK
- Proxy (src/proxy.ts) protects routes based on auth state

### Authorization
- Check user permissions in proxy middleware or Server Actions
- Use `AdminUser` model for role-based access
- Implement permission checks before sensitive operations
- Note: Middleware is now called "proxy" in Next.js 16

### Styling
- Use Tailwind CSS utility classes
- Use `cn()` utility from `src/lib/utils/cn.ts` for conditional classes
- Follow shadcn/ui patterns for component styling
- Use CSS variables for theme colors (defined in `globals.css`)

```typescript
import { cn } from '@/lib/utils/cn';

<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  className
)} />
```

### Error Handling
1. **Client-side**: Use toast notifications from `use-toast` hook
2. **Server-side**: Return structured error objects
3. **API Routes**: Return proper HTTP status codes
4. **Server Actions**: Return `{ success: boolean, error?: string }`

### Testing Strategy

#### Unit Tests (Vitest)
- Test utility functions
- Test validation schemas
- Test component logic (isolated)
- Location: `src/__tests__/unit/`

#### Integration Tests (Vitest + MSW)
- Test API routes
- Test Server Actions
- Test database operations
- Location: `src/__tests__/integration/`

#### E2E Tests (Playwright)
- Test critical user flows
- Test authentication flows
- Test payment flows
- Location: `src/__tests__/e2e/`

### Performance Optimization
1. **Use Server Components** to reduce client bundle
2. **Lazy load** Client Components when possible
3. **Optimize images** with Next.js Image component
4. **Enable caching** for static data
5. **Use React Query** for client-side data fetching
6. **Minimize client JavaScript** - only add `'use client'` when necessary

## Environment Variables

Required environment variables (see `.env.example`):

### Database
- `DATABASE_URL` - PostgreSQL connection string

### Firebase
- Client (public): `NEXT_PUBLIC_FIREBASE_*`
- Admin (private): `FIREBASE_ADMIN_*`

### Stripe
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_*` (for each tier)

### App Configuration
- `NEXT_PUBLIC_APP_URL` - Application URL
- `NEXT_PUBLIC_APP_NAME` - Application name

### Email
- `RESEND_API_KEY` - Resend API key for emails

### Security
- `NEXTAUTH_SECRET` - Used for session encryption

## Development Workflow

### Starting Development
```bash
npm run dev          # Start dev server with Turbopack
npm run dev:clean    # Clean cache and start dev server
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run typecheck    # Type check with TypeScript
npm run format       # Format with Prettier
```

### Database
```bash
npm run db:generate  # Generate Prisma client (after schema changes)
npm run db:push      # Push schema to database (dev)
npm run db:migrate   # Create migrations (production)
npm run db:studio    # Open Prisma Studio UI
npm run db:seed      # Seed database with test data
```

### Testing
```bash
npm test              # Run unit tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage report
npm run test:e2e          # Run E2E tests
npm run test:all          # Run all tests
```

### Mobile Development
```bash
npm run build:mobile      # Build for mobile
npm run cap:sync          # Sync web to native projects
npm run ios:build         # Build iOS app
npm run android:build     # Build Android app
```

### Building for Production
```bash
npm run build            # Build Next.js app
npm start                # Start production server
```

## Key Implementation Patterns

### Adding a New Feature
1. **Plan**: Determine if feature needs Client or Server Component
2. **Database**: Update Prisma schema if needed, run `npm run db:generate`
3. **Server Actions**: Create actions in `src/app/actions/`
4. **UI Components**: Build components in `src/components/`
5. **Routes**: Add pages in `src/app/`
6. **Tests**: Write tests in `src/__tests__/`
7. **Types**: Ensure full TypeScript coverage

### Adding a New Page
1. Create in appropriate route group: `(marketing)`, `(auth)`, `(dashboard)`, `(admin)`
2. Use Server Component by default
3. Add metadata export for SEO
4. Protect with middleware if auth required

```typescript
// src/app/(dashboard)/profile/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile | SaaS Boilerplate',
  description: 'Manage your profile'
};

export default async function ProfilePage() {
  // Server Component - can fetch data directly
  return <div>Profile</div>;
}
```

### Adding a New API Route
1. Create in `src/app/api/`
2. Export HTTP method handlers (GET, POST, etc.)
3. Validate input
4. Handle errors
5. Return proper status codes

```typescript
// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Your logic
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
```

### Adding a New Server Action
1. Create in `src/app/actions/`
2. Add `'use server'` directive
3. Validate input with Zod
4. Handle errors
5. Revalidate cache if needed
6. Return structured response

```typescript
// src/app/actions/example-actions.ts
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const schema = z.object({
  name: z.string().min(1)
});

export async function createExample(formData: FormData) {
  const validated = schema.safeParse({
    name: formData.get('name')
  });

  if (!validated.success) {
    return { success: false, error: 'Invalid input' };
  }

  try {
    // Your logic
    revalidatePath('/examples');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to create' };
  }
}
```

### Adding shadcn/ui Components
```bash
# Components are already installed, but to add more:
npx shadcn-ui@latest add [component-name]
```

## Important Notes

### ✅ Next.js 16 Proxy (Middleware Migration)

**IMPORTANT**: This project uses `proxy.ts` following Next.js 16+ conventions (migrated from deprecated `middleware.ts`).

**Current State**: Using `src/proxy.ts` ✅

**Key Information**:
- File name: `src/proxy.ts` (previously `middleware.ts`)
- Export name: **`proxy`** (previously `middleware` - MUST be renamed!)
- Configuration: `config` export defines matched routes
- Handles: Authentication, rate limiting, security headers, CORS

**CRITICAL**: The exported function MUST be named `proxy`, not `middleware`. Next.js 16 will fail to build if the function is named `middleware`.

**Learn More**: https://nextjs.org/docs/messages/middleware-to-proxy

**What the Proxy Does**:
1. Rate limiting for API routes (different limits for auth, webhooks, general API)
2. Authentication checks for protected routes (`/dashboard`, `/settings`, `/profile`, `/admin`)
3. Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
4. CORS configuration for API routes
5. Redirects unauthenticated users to login page

### Authentication Flow
1. User signs up/logs in via Firebase Auth (client-side)
2. Firebase returns ID token
3. Token sent to backend, verified with Admin SDK
4. User record created/updated in database
5. Session cookie set
6. Proxy (src/proxy.ts) protects routes

### Subscription Flow
1. User selects plan on pricing page
2. Redirect to Stripe Checkout
3. After payment, webhook triggers
4. Update user subscription in database
5. Grant access to premium features

### Multi-tenancy (Future)
- Currently single-tenant
- Can be extended to multi-tenant by adding `Organization` model
- Add `organizationId` foreign key to relevant models

### Mobile Considerations
- Capacitor wraps web app as native app
- Use `@capacitor/` plugins for native features
- Test PWA features separately
- Configure app IDs in `.env`

## Common Tasks for Claude Code

### When Adding Features
1. Always check existing patterns first
2. Maintain consistency with existing code style
3. Add proper TypeScript types
4. Write tests for new functionality
5. Update relevant documentation

### When Debugging
1. Check server logs in terminal
2. Check browser console for client errors
3. Verify environment variables are set
4. Check database with Prisma Studio
5. Review Stripe dashboard for payment issues

### When Refactoring
1. Ensure tests pass before and after
2. Run type check: `npm run typecheck`
3. Run linter: `npm run lint`
4. Consider impact on API contracts
5. Update affected tests

### When Optimizing
1. Profile before optimizing
2. Consider Server vs Client Component tradeoffs
3. Use React Query for client-side caching
4. Optimize database queries (use Prisma query analysis)
5. Monitor bundle size

## Security Considerations

1. **Never expose secrets** in client-side code
2. **Validate all inputs** server-side with Zod
3. **Use Firebase Admin SDK** for server-side auth
4. **Verify Stripe webhooks** with webhook secret
5. **Rate limit** sensitive endpoints
6. **Sanitize user input** before database storage
7. **Use HTTPS** in production
8. **Enable CORS** only for trusted origins
9. **Log security events** to AuditLog table
10. **Keep dependencies updated** regularly

## Deployment Checklist

### Pre-deployment
- [ ] All tests passing (`npm run test:all`)
- [ ] Type check passing (`npm run typecheck`)
- [ ] Lint check passing (`npm run lint`)
- [ ] Environment variables configured on hosting platform
- [ ] Database migrations applied
- [ ] Stripe webhooks configured
- [ ] Firebase production credentials set
- [ ] Build succeeds locally (`npm run build`)

### Post-deployment
- [ ] Test authentication flow
- [ ] Test payment flow
- [ ] Verify webhook endpoints
- [ ] Check error logging
- [ ] Monitor performance
- [ ] Verify email delivery

## Package Manager

**IMPORTANT**: This project uses **npm** as the package manager.

- Always use `npm install`, not pnpm
- The project switched from pnpm to npm due to module resolution issues with Next.js 16 and lucide-react
- See [PACKAGE_MANAGER_CHANGE.md](./PACKAGE_MANAGER_CHANGE.md) for details
- npm provides better compatibility with Next.js 16 and Turbopack

## Additional Resources

- [Next.js 16 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [Prisma Docs](https://www.prisma.io/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Capacitor Docs](https://capacitorjs.com/docs)

## Support

For questions or issues with the boilerplate, check:
1. This documentation first
2. Existing code patterns
3. Official documentation for each technology
4. GitHub issues if open source

---

**Remember**: This is a production-ready boilerplate. When making changes, maintain the same level of quality, type safety, and testing coverage. Always think about scalability, security, and user experience.
