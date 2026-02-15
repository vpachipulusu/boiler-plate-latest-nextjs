# Project Instructions

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.7, React 19
- **Package Manager**: pnpm (not npm/yarn)
- **Database**: Prisma ORM + PostgreSQL
- **Auth**: Firebase Auth + Stripe subscriptions
- **Mobile**: Capacitor (iOS/Android)
- **Testing**: Vitest (unit) + Playwright (e2e)

## Next.js 16 Proxy (Middleware Migration)

Next.js 16 replaced `middleware.ts` with `proxy.ts`:
- File: `src/proxy.ts` (NOT `src/middleware.ts`)
- Export: `export async function proxy(request)` (NOT `middleware`)
- The `config` export and all functionality remain the same

## Agent Skills

**IMPORTANT**: This project has agent skills installed in `.agents/skills/`. You MUST consult and apply the relevant skill when working on tasks in that domain.

### Available Skills

| Skill | Path | When to Use |
|-------|------|-------------|
| **next-best-practices** | `.agents/skills/next-best-practices/` | When writing/reviewing ANY Next.js code — file conventions, RSC boundaries, data patterns, async APIs, metadata, error handling, route handlers, image/font optimization, bundling |
| **frontend-design** | `.agents/skills/frontend-design/` | When building UI components, pages, layouts, dashboards, or styling/beautifying any web interface |
| **capacitor-best-practices** | `.agents/skills/capacitor-best-practices/` | When working on Capacitor/mobile code — project setup, plugins, performance, security, deployment |
| **vercel-react-native-skills** | `.agents/skills/vercel-react-native-skills/` | When building React Native/Expo components, optimizing list performance, animations, or native modules |
| **browser-use** | `.agents/skills/browser-use/` | When the user needs browser automation — web testing, screenshots, form filling, data extraction |
| **find-skills** | `.agents/skills/find-skills/` | When the user asks to discover or install new agent skills |

### How to Apply Skills

1. **Before writing Next.js code**: Read `.agents/skills/next-best-practices/SKILL.md` and the relevant sub-file (e.g., `rsc-boundaries.md`, `async-patterns.md`, `data-patterns.md`) for the specific topic
2. **Before building UI**: Read `.agents/skills/frontend-design/SKILL.md` for design guidelines
3. **Before Capacitor work**: Read `.agents/skills/capacitor-best-practices/SKILL.md`
4. **Before React Native work**: Read `.agents/skills/vercel-react-native-skills/SKILL.md`
5. **For browser automation**: Read `.agents/skills/browser-use/SKILL.md`

When multiple skills apply (e.g., building a Next.js page with good design), read and apply ALL relevant skills.

## Code Conventions

### Server Components (Default)
- No `'use client'` directive needed
- Fetch data directly in components

### Client Components
- Add `'use client'` at top of file
- Only when using hooks, event handlers, or browser APIs

### Server Actions
- Add `'use server'` directive
- Return `{ success: boolean, error?: string }`
- Revalidate with `revalidatePath()`

### Forms
- React Hook Form + Zod validation
- Schemas in `src/lib/utils/validation.ts`
