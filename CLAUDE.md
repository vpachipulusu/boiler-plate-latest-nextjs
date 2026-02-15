# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript 5.7
- **Package Manager**: pnpm (not npm/yarn)
- **Database**: Prisma ORM 6 + PostgreSQL
- **Auth**: Firebase Auth (email/password + Google/GitHub OAuth)
- **Payments**: Stripe (subscriptions with Free/Pro/Enterprise tiers)
- **UI**: shadcn/ui (new-york style) + Tailwind CSS 3 + Radix UI + Lucide icons
- **State**: TanStack React Query v5 (client caching), server-side via Prisma
- **Mobile**: Capacitor 6 (iOS/Android)
- **Testing**: Vitest (unit/integration) + Playwright (e2e)
- **Email**: Resend
- **2FA**: TOTP via otpauth

## Commands

```bash
# Development
pnpm dev                    # Start dev server (webpack)
pnpm dev:turbo              # Start dev server (turbo)
pnpm dev:kill               # Kill stuck dev processes + remove lock files
pnpm build                  # Production build

# Testing
pnpm test                   # Run Vitest (all unit/integration)
pnpm test:watch             # Vitest in watch mode
pnpm vitest run path/to/file.test.ts  # Run a single test file
pnpm test:unit              # Unit tests only (src/__tests__/unit)
pnpm test:integration       # Integration tests only (src/__tests__/integration)
pnpm test:e2e               # Playwright E2E tests
pnpm test:e2e:ui            # Playwright with UI
pnpm test:coverage          # Vitest with coverage (80% thresholds)

# Code Quality
pnpm lint                   # ESLint
pnpm typecheck              # TypeScript type checking (tsc --noEmit)
pnpm format                 # Prettier

# Database
pnpm db:generate            # Generate Prisma client
pnpm db:push                # Push schema to DB (no migration)
pnpm db:migrate             # Create and run migration
pnpm db:studio              # Open Prisma Studio GUI
pnpm db:seed                # Seed database

# Mobile (Capacitor)
pnpm build:mobile           # Build + cap sync
pnpm cap:sync               # Sync web assets to native
pnpm cap:run:ios             # Run on iOS device/sim
pnpm cap:run:android         # Run on Android device/emulator
```

## Next.js 16 Proxy (Critical)

Next.js 16 replaced `middleware.ts` with `proxy.ts`:
- File: **`src/proxy.ts`** (NOT `src/middleware.ts`)
- Export: **`export async function proxy(request)`** (NOT `middleware`)
- Build **will fail** if the function is named `middleware`
- The `config` export and matcher patterns remain the same

The proxy handles: rate limiting (token bucket), auth redirects, protected route enforcement, email verification checks, admin route guarding, security headers, and CORS.

## Architecture

### Route Groups & Layouts

The app uses Next.js route groups for layout segmentation:

- **`src/app/layout.tsx`** — Root layout: ThemeProvider > QueryProvider > ToastProvider, Inter font
- **`src/app/(auth)/layout.tsx`** — Auth pages (login, signup, reset-password, verify-email): centered card, no nav
- **`src/app/dashboard/layout.tsx`** — Dashboard: server-side auth check, fetches user data, sticky header with nav, SessionProvider for token refresh
- **`src/app/(admin)/admin/layout.tsx`** — Admin portal: server-side admin check, sidebar nav with 7 sections

### Auth Flow

1. Firebase handles authentication (client-side SDK in `src/lib/firebase/client.ts`)
2. On login, Firebase ID token is sent to `/api/auth/login` which sets a `session` cookie
3. `src/proxy.ts` checks the `session` cookie for protected routes
4. `SessionProvider` (`src/components/providers/session-provider.tsx`) auto-refreshes tokens every 50 minutes via `onIdTokenChanged`
5. Server actions use `firebase-admin` (`src/lib/firebase/admin.ts`) to verify tokens
6. Admin access is checked via `AdminUser` model with role-based permissions (`src/lib/helpers/admin-helpers.ts`)

### Server Actions Pattern

Server actions live in `src/app/actions/` and follow this structure:
- `auth-actions.ts` — login, signup, logout, session management
- `user-actions.ts` — profile, settings, 2FA, account deletion
- `notification-actions.ts` — notification CRUD
- `subscription-actions.ts` — user subscription management
- `admin/*.ts` — admin-only actions (users, subscriptions, SEO, settings)

All return `{ success: boolean, error?: string, data?: T }`.

### Stripe Integration

- `src/lib/stripe/client.ts` — Client-side Stripe.js loader
- `src/lib/stripe/subscriptions.ts` — Checkout sessions, billing portal, subscription CRUD
- `src/lib/stripe/webhooks.ts` — Webhook verification and event handlers
- `src/app/api/webhooks/stripe/route.ts` — Webhook endpoint
- `src/config/subscriptions.ts` — Tier definitions, prices fetched from Stripe and cached via `unstable_cache` (1hr revalidation)

### Key Paths

| Purpose | Path |
|---------|------|
| Prisma schema | `prisma/schema.prisma` |
| DB client (singleton) | `src/lib/db/client.ts` |
| Zod schemas | `src/lib/utils/validation.ts` |
| Rate limiter | `src/lib/middleware/rate-limit.ts` |
| Admin auth helpers | `src/lib/helpers/admin-helpers.ts` |
| Audit logging | `src/lib/services/audit-log.service.ts` |
| Site config | `src/config/site.ts` |
| Subscription tiers | `src/config/subscriptions.ts` |
| shadcn/ui components | `src/components/ui/` |
| Test fixtures | `src/__tests__/fixtures/users.ts` |
| Test utils (RTL wrapper) | `src/__tests__/helpers/test-utils.tsx` |

### Prisma Models

Core: `User` (with Firebase UID, Stripe fields, 2FA), `UserSettings`, `LoginHistory`, `Notification`
Admin: `AdminUser` (role + JSON permissions), `AuditLog`
CMS: `SEOMeta`, `URLRedirect`, `AppSettings`, `FeatureFlag`, `EmailTemplate`

All models use `@@map()` for snake_case table names. User is the central model linked via `firebaseUid` and `stripeCustomerId`.

### Testing Structure

```
src/__tests__/
  unit/           # Vitest — components, utils
  integration/    # Vitest — API endpoints
  e2e/            # Playwright — full user flows
  fixtures/       # Mock data (users.ts)
  helpers/        # RTL render wrapper with providers
```

Vitest uses jsdom, excludes `**/*.spec.ts` (Playwright files). Coverage targets `src/lib/`, `src/components/`, `src/app/actions/`. Playwright runs against `http://localhost:3000` with auth setup project.

### Path Alias

`@/*` maps to `./src/*` (configured in both `tsconfig.json` and `vitest.config.ts`).

## Code Conventions

### Server Components (Default)
- No `'use client'` directive needed
- Fetch data directly in components using Prisma or server actions

### Client Components
- Add `'use client'` at top of file
- Only when using hooks, event handlers, or browser APIs

### Forms
- React Hook Form + Zod validation
- Define schemas in `src/lib/utils/validation.ts`
- Use `@hookform/resolvers` for Zod integration

### Styling
- Tailwind CSS with `cn()` utility from `src/lib/utils/cn.ts` (clsx + tailwind-merge)
- shadcn/ui component config in `components.json` (new-york style, slate base, CSS variables)
- Dark mode via `next-themes` with class strategy
- Prettier auto-sorts Tailwind classes (`prettier-plugin-tailwindcss`)

### ESLint
- Extends `next/core-web-vitals` and `next/typescript`
- Warns on `@typescript-eslint/no-explicit-any` and unused vars

## Agent Skills

**IMPORTANT**: This project has agent skills in `.agents/skills/`. Consult the relevant skill BEFORE working in that domain.

| Skill | When to Use |
|-------|-------------|
| **next-best-practices** | ANY Next.js code — RSC boundaries, data patterns, async APIs, metadata, error handling, route handlers |
| **frontend-design** | Building UI components, pages, layouts, dashboards, styling |
| **capacitor-best-practices** | Capacitor/mobile code — plugins, performance, deployment |
| **vercel-react-native-skills** | React Native/Expo components, animations, native modules |
| **browser-use** | Browser automation — testing, screenshots, form filling |
| **find-skills** | Discovering or installing new agent skills |

Read `.agents/skills/<skill-name>/SKILL.md` before starting work. When multiple skills apply, read ALL relevant ones.
