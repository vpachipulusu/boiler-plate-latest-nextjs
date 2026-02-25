# GitHub Copilot Instructions

## Agent Skills

This project includes specialized agent skills for enhanced development workflows. Skills are automatically loaded from `.agents/skills/`.

### Available Skills

<skills>
<skill>
<name>browser-use</name>
<description>Automates browser interactions for web testing, form filling, screenshots, and data extraction. Use when the user needs to navigate websites, interact with web pages, fill forms, take screenshots, or extract information from web pages.</description>
<file>c:\MainData\NewSourceCode\boiler-plate-latest-nextjs\.agents\skills\browser-use\SKILL.md</file>
</skill>
<skill>
<name>capacitor-best-practices</name>
<description>Best practices for Capacitor app development including project structure, plugin usage, performance optimization, security, and deployment. Use this skill when reviewing Capacitor code, setting up new projects, or optimizing existing apps.</description>
<file>c:\MainData\NewSourceCode\boiler-plate-latest-nextjs\.agents\skills\capacitor-best-practices\SKILL.md</file>
</skill>
<skill>
<name>find-skills</name>
<description>Helps users discover and install agent skills when they ask questions like "how do I do X", "find a skill for X", "is there a skill that can...", or express interest in extending capabilities. This skill should be used when the user is looking for functionality that might exist as an installable skill.</description>
<file>c:\MainData\NewSourceCode\boiler-plate-latest-nextjs\.agents\skills\find-skills\SKILL.md</file>
</skill>
<skill>
<name>frontend-design</name>
<description>Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.</description>
<file>c:\MainData\NewSourceCode\boiler-plate-latest-nextjs\.agents\skills\frontend-design\SKILL.md</file>
</skill>
<skill>
<name>next-best-practices</name>
<description>Next.js best practices - file conventions, RSC boundaries, data patterns, async APIs, metadata, error handling, route handlers, image/font optimization, bundling</description>
<file>c:\MainData\NewSourceCode\boiler-plate-latest-nextjs\.agents\skills\next-best-practices\SKILL.md</file>
</skill>
<skill>
<name>vercel-react-native-skills</name>
<description>React Native and Expo best practices for building performant mobile apps. Use</description>
<file>c:\MainData\NewSourceCode\boiler-plate-latest-nextjs\.agents\skills\vercel-react-native-skills\SKILL.md</file>
</skill>
</skills>

### Usage

**IMPORTANT**: When working in specific domains, GitHub Copilot MUST first read the corresponding skill file using the `read_file` tool before proceeding:

| When working with...                                                  | Read this skill file                                 |
| --------------------------------------------------------------------- | ---------------------------------------------------- |
| Next.js code, server components, route handlers, metadata, async APIs | `.agents/skills/next-best-practices/SKILL.md`        |
| UI components, pages, layouts, designs, dashboards, styling           | `.agents/skills/frontend-design/SKILL.md`            |
| Capacitor, mobile builds, iOS/Android deployment                      | `.agents/skills/capacitor-best-practices/SKILL.md`   |
| React Native, Expo components, mobile development                     | `.agents/skills/vercel-react-native-skills/SKILL.md` |
| Browser automation, web scraping, screenshots                         | `.agents/skills/browser-use/SKILL.md`                |
| Finding or installing new skills                                      | `.agents/skills/find-skills/SKILL.md`                |

**Example**: If asked to create a Next.js page, Copilot should:

1. Read `.agents/skills/next-best-practices/SKILL.md`
2. Read `.agents/skills/frontend-design/SKILL.md` (since it involves UI)
3. Follow all patterns and rules from both skills
4. Implement the solution

Multiple skills may apply to a single task - read ALL relevant skill files before starting work.

## Project Context

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · Prisma (PostgreSQL) · Firebase Auth · Stripe · Capacitor (iOS/Android) · Vitest · Playwright · Sentry · Winston

---

## Commands

```bash
# Development
npm run dev           # Webpack dev server
npm run dev:turbo     # Turbopack dev server

# Build & type check
npm run build
npm run typecheck
npm run lint
npm run format

# Database
npm run db:generate   # Regenerate Prisma client after schema changes
npm run db:push       # Push schema changes to DB (dev)
npm run db:migrate    # Create a named migration
npm run db:seed       # Seed database
npm run db:studio     # Open Prisma Studio UI

# Testing
npm run test               # Vitest (watch mode)
npm run test:unit          # Unit tests only (src/__tests__/unit)
npm run test:integration   # Integration tests only
npm run test:coverage      # Coverage report (80% threshold)
npm run test:e2e           # Playwright E2E
npm run test:ci            # Full suite for CI

# Single test file
npx vitest run src/__tests__/unit/my-file.test.ts
npx playwright test src/__tests__/e2e/my-test.spec.ts

# Mobile
npm run cap:sync      # Sync web build to native
npm run ios:build
npm run android:build
```

---

## Architecture

### Route Groups

```
src/app/
├── (auth)/        # Unauthenticated: login, signup, verify-email, reset-password
├── (admin)/       # Admin panel — requires admin role + permissions
├── dashboard/     # Authenticated user area (profile, security, settings/billing)
├── pricing/       # Public pricing page
├── contact/       # Public contact form
├── api/           # Route handlers (auth/*, webhooks/stripe)
└── actions/       # Server Actions ('use server')
```

### Auth Flow

Authentication uses **Firebase + session cookies** (not NextAuth):

1. Client authenticates with Firebase (email/password or Google/GitHub OAuth)
2. Firebase ID token POSTed to `/api/auth/login`
3. Server verifies token with Firebase Admin SDK, creates an httpOnly session cookie
4. All server actions and admin middleware extract the user from this session cookie

- **Client SDK:** `src/lib/firebase/client.ts` — used in React components
- **Admin SDK:** `src/lib/firebase/admin.ts` — used in server actions and API routes
- **Session extraction helper:** defined in `src/app/actions/` — call it at the top of every server action that requires auth

### Database

- Prisma client exported as `db` from `src/lib/db/`
- Global singleton pattern prevents connection leaks during hot reload
- Key models: `User` (linked to Firebase via `firebaseUid`), `UserSettings`, `LoginHistory`, `Notification`
- Subscription state is stored directly on `User`: `stripeCustomerId`, `subscriptionTier`, `subscriptionStatus`, `stripeCurrentPeriodEnd`

### Stripe / Subscriptions

- Tiers: `free`, `pro`, `enterprise` — defined in `src/config/subscriptions.ts`
- `getStripePrices()` is cached with `unstable_cache` (1-hour TTL); use it for public pricing display
- Stripe webhooks (`/api/webhooks/stripe`) sync subscription state back to the `User` model
- Checkout and billing portal flows live in `src/lib/stripe/subscriptions.ts`

### Admin Access Control

- `verifyAdminAuth()` in `src/lib/middleware/admin-auth.ts` verifies the Firebase token, checks the `AdminUser` relation, and validates granular permissions
- Permissions are CRUD-style per resource; `super_admin` role uses wildcard `*`
- Call `verifyAdminAuth(request, ['permission:action'])` at the start of any admin API route

### Component Organization

```
src/components/
├── ui/         # Shadcn/ui primitives — do not modify directly; extend via className
├── auth/       # Auth forms and OAuth buttons
├── dashboard/  # Dashboard-specific components
├── admin/      # Admin panel components
└── pricing/    # Pricing table components
```

---

## Key Conventions

### Server Actions
- Always include `'use server'` directive
- Extract authenticated user ID via the session cookie helper at the start of the action
- Return typed `{ success: boolean; data?: T; error?: string }` response objects
- Log errors with the Winston-based logger (`src/lib/utils/logger` or similar), don't throw to the client

### Data Fetching
- Mark pages that read user data with `export const dynamic = 'force-dynamic'` to prevent stale caching
- Use `unstable_cache` (with appropriate tags/TTL) for shared, non-user-specific data (e.g., pricing)

### Environment Variables
- Public (browser-accessible) vars use `NEXT_PUBLIC_` prefix
- See `.env.example` for the full required set: `DATABASE_URL`, `NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_ADMIN_*`, `STRIPE_*`, `RESEND_API_KEY`, `NEXT_PUBLIC_SENTRY_DSN`
- `APP_ID` / `APP_NAME` are used by Capacitor — must match `capacitor.config.ts`

### Styling
- Tailwind with HSL CSS variables for theming; dark mode is `class`-based
- Custom animations available: `accordion`, `reveal`, `scale`, `shimmer`, `float`
- Custom fonts configured in `src/config/fonts.ts` — use the exported font variables
