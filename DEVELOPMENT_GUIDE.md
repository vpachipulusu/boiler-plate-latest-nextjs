# Development Guide

## Quick Start Commands

### Starting Development Server

```bash
npm run dev              # Automatically cleans lock files and starts dev server
npm run dev:clean        # Explicitly clean and start (same as above)
```

The `predev` hook automatically runs cleanup before starting the dev server, so you shouldn't encounter lock file issues anymore.

### Troubleshooting Dev Server Issues

If you encounter "Unable to acquire lock" error:

```bash
npm run dev:kill         # Kill all Next.js processes and clean lock files
npm run dev              # Start dev server
```

Or manually:

```bash
# Windows
taskkill /F /IM node.exe /FI "MEMUSAGE gt 50000"

# Unix/Mac/Linux
lsof -ti:3000 | xargs kill -9
```

## Common Issues & Solutions

### 1. Lock File Error

**Problem:**
```
⨯ Unable to acquire lock at .next\dev\lock
```

**Solution:**
```bash
npm run dev:kill    # Automatically kills processes and removes lock
npm run dev         # Start fresh
```

**What it does:**
- Terminates any running Node.js processes (Next.js dev servers)
- Kills processes using port 3000
- Removes stale `.next/dev/lock` file

### 2. Port Already in Use

**Problem:**
```
⚠ Port 3000 is in use, using port 3001 instead
```

**Solution:**
```bash
npm run dev:kill    # Free up port 3000
npm run dev
```

### 3. Build Errors After Dependency Changes

**Problem:**
Build errors or TypeScript errors after installing new packages.

**Solution:**
```bash
rm -rf .next node_modules
npm install
npm run dev
```

### 4. Stale Module Cache

**Problem:**
Changes not reflecting or module resolution issues.

**Solution:**
```bash
rm -rf .next
npm run dev
```

## Development Workflow

### 1. Starting Fresh Each Day

```bash
git pull                 # Get latest changes
npm install              # Update dependencies if needed
npm run dev              # Start dev server (auto-cleans)
```

### 2. Making Changes

- Edit files in `src/`
- Hot reload should work automatically
- If changes don't reflect, save the file again or restart dev server

### 3. Running Tests While Developing

```bash
# Terminal 1 - Dev server
npm run dev

# Terminal 2 - Tests in watch mode
npm run test:watch
```

### 4. Before Committing

```bash
npm run lint             # Check for linting errors
npm run typecheck        # Check TypeScript types
npm test -- --run        # Run all tests
npm run build            # Verify build works
```

## Scripts Reference

### Development
- `npm run dev` - Start dev server with auto-cleanup
- `npm run dev:clean` - Explicit clean and start
- `npm run dev:kill` - Kill all Next.js processes
- `npm run build` - Build for production
- `npm run start` - Start production server

### Code Quality
- `npm run lint` - Run ESLint
- `npm run typecheck` - Type check with TypeScript
- `npm run format` - Format code with Prettier

### Testing
- `npm test` - Run tests in watch mode
- `npm run test:unit` - Run unit tests
- `npm run test:integration` - Run integration tests
- `npm run test:e2e` - Run E2E tests
- `npm run test:coverage` - Generate coverage report
- `npm run test:all` - Run all test suites

### Database
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database

### Mobile
- `npm run cap:init` - Initialize Capacitor
- `npm run cap:sync` - Sync web assets
- `npm run cap:add:ios` - Add iOS platform
- `npm run cap:add:android` - Add Android platform
- `npm run ios:build` - Build for iOS
- `npm run android:build` - Build for Android

## Environment Setup

### Required Environment Variables

Create `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="..."

# Firebase Admin (Private - Server-side only)
FIREBASE_PROJECT_ID="..."
FIREBASE_CLIENT_EMAIL="..."
FIREBASE_PRIVATE_KEY="..."

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### Optional Environment Variables

```env
# Email (Resend)
RESEND_API_KEY="re_..."

# Analytics
NEXT_PUBLIC_GA_ID="G-..."

# Feature Flags
ENABLE_ADMIN_PANEL="true"
```

## Performance Tips

### 1. Turbopack (Enabled by Default)

The project uses Turbopack for faster builds:
```bash
npm run dev    # Uses --turbo flag
```

### 2. Incremental Static Regeneration

Use ISR for pages that don't change often:
```typescript
export const revalidate = 3600; // Revalidate every hour
```

### 3. Server Components

Use Server Components by default, Client Components only when needed:
```typescript
// Server Component (default)
export default function Page() { ... }

// Client Component (only when needed)
'use client';
export default function InteractiveComponent() { ... }
```

## Debugging

### 1. VS Code Debugger

Add to `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

### 2. React DevTools

Install React DevTools browser extension for debugging React components.

### 3. Console Logging

Server-side logs appear in terminal, client-side logs in browser console.

```typescript
// Server-side (Terminal)
console.log('Server log:', data);

// Client-side (Browser Console)
'use client';
console.log('Client log:', data);
```

## Git Workflow

### 1. Feature Branch

```bash
git checkout -b feature/my-feature
# Make changes
git add .
git commit -m "feat: add my feature"
git push origin feature/my-feature
```

### 2. Before Pushing

```bash
npm run lint
npm run typecheck
npm test -- --run
npm run build
```

### 3. Commit Message Convention

Follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## Best Practices

### 1. File Organization

- Put shared components in `src/components/`
- Put page-specific components in the same directory as the page
- Use `lib/` for utilities and business logic
- Keep Server Actions in `app/actions/`

### 2. Naming Conventions

- Components: `PascalCase` (e.g., `MyComponent.tsx`)
- Utilities: `camelCase` (e.g., `formatDate.ts`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRIES`)
- Types: `PascalCase` with `Type` suffix (e.g., `UserType`)

### 3. Import Order

```typescript
// 1. React and Next.js
import { useState } from 'react';
import Link from 'next/link';

// 2. External libraries
import { z } from 'zod';

// 3. Internal absolute imports
import { Button } from '@/components/ui/button';
import { validateEmail } from '@/lib/utils/validation';

// 4. Relative imports
import { FeatureComponent } from './FeatureComponent';

// 5. Types
import type { User } from '@/types';
```

### 4. Error Handling

Always handle errors gracefully:
```typescript
try {
  const result = await riskyOperation();
  return { success: true, data: result };
} catch (error) {
  console.error('Operation failed:', error);
  return { success: false, error: 'Failed to complete operation' };
}
```

## Troubleshooting Checklist

When things go wrong, try in this order:

1. ✅ **Clean restart dev server**
   ```bash
   npm run dev:kill
   npm run dev
   ```

2. ✅ **Clear Next.js cache**
   ```bash
   rm -rf .next
   npm run dev
   ```

3. ✅ **Reinstall dependencies**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. ✅ **Check environment variables**
   - Verify `.env.local` exists
   - Check all required variables are set
   - Restart dev server after changes

5. ✅ **Update dependencies**
   ```bash
   npm update
   npm audit fix
   ```

6. ✅ **Check TypeScript**
   ```bash
   npm run typecheck
   ```

7. ✅ **Verify Git status**
   ```bash
   git status
   git diff
   ```

## Getting Help

- Check [TESTING.md](./TESTING.md) for testing issues
- Check [PROJECT_STATUS.md](./PROJECT_STATUS.md) for implementation status
- Review Next.js docs: https://nextjs.org/docs
- Open an issue if problem persists

---

**Happy Coding!** 🚀
