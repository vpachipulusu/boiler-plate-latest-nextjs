# SaaS Boilerplate - Next.js 16

A production-ready SaaS boilerplate built with Next.js 16, React 19, Prisma, Firebase Auth, Stripe, and comprehensive testing.

## Features

- ⚡ **Next.js 16** with App Router and Server Actions
- 🎨 **shadcn/ui** + Tailwind CSS for beautiful UI
- 🔐 **Firebase Authentication** with email/password and OAuth
- 💳 **Stripe** integration for subscriptions
- 🗄️ **Prisma ORM** with PostgreSQL
- 📱 **Mobile-ready** with Capacitor (iOS & Android)
- 🧪 **Comprehensive testing** with Vitest & Playwright
- 🚀 **Vercel-optimized** deployment

## Tech Stack

### Frontend
- Next.js 16 (App Router)
- React 19 (Server & Client Components)
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Radix UI
- TanStack Query v5
- Zustand v5

### Backend
- Next.js API Routes & Server Actions
- Prisma ORM v6
- PostgreSQL
- Firebase Admin SDK
- Stripe

### Testing
- Vitest (unit & integration)
- Playwright (E2E)
- React Testing Library
- MSW v2 (API mocking)

### Mobile
- Capacitor v6
- PWA support
- iOS & Android deployment

## Getting Started

### Prerequisites

- Node.js 20+
- npm (comes with Node.js)
- PostgreSQL database
- Firebase project
- Stripe account

> **Note**: This project uses npm instead of pnpm due to better module resolution with Next.js and lucide-react icons.

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd boiler-plate-latest-nextjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create both `.env` (for Prisma) and `.env.local` (for Next.js):
   
   ```bash
   cp .env.example .env
   cp .env.example .env.local
   ```

   Fill in your environment variables in **both files**:
   - Database URL (required for Prisma to work)
   - Firebase credentials (client & admin)
   - Stripe keys
   - Other configuration
   
   > ℹ️ **Why two files?**
   > - `.env` - Used by Prisma CLI for database operations
   > - `.env.local` - Used by Next.js at runtime
   > - Both files need the same `DATABASE_URL` value

4. **Set up the database**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Configure Firebase Authentication** 🔥
   
   **⚠️ IMPORTANT**: Enable OAuth providers to avoid `auth/configuration-not-found` errors
   
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project → **Authentication** → **Sign-in method**
   - Enable **Google** provider (required for OAuth)
   - Enable **GitHub** provider (optional)
   
   > 📖 See [FIREBASE_OAUTH_SETUP.md](FIREBASE_OAUTH_SETUP.md) for step-by-step instructions

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open [http://localhost:3000](http://localhost:3000)**

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (marketing)/        # Public pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Customer dashboard
│   ├── (admin)/           # Admin dashboard
│   ├── api/               # API routes
│   └── actions/           # Server Actions
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── customer/         # Customer components
│   ├── admin/            # Admin components
│   └── auth/             # Auth components
├── lib/                   # Utilities & libraries
│   ├── db/               # Database client
│   ├── firebase/         # Firebase setup
│   ├── stripe/           # Stripe integration
│   └── utils/            # Utility functions
└── __tests__/            # Test files
    ├── unit/             # Unit tests
    ├── integration/      # Integration tests
    └── e2e/              # E2E tests
```

## Available Scripts

### Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Type check with TypeScript

### Database
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio
- `npm run db:migrate` - Run migrations
- `npm run db:seed` - Seed database

### Testing
- `npm test` - Run unit tests with Vitest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run test:e2e` - Run E2E tests with Playwright
- `npm run test:all` - Run all tests

### Mobile
- `npm run cap:init` - Initialize Capacitor
- `npm run cap:sync` - Sync web assets to native projects
- `npm run cap:add:ios` - Add iOS platform
- `npm run cap:add:android` - Add Android platform
- `npm run ios:build` - Build for iOS
- `npm run android:build` - Build for Android

## Firebase Setup

1. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication methods (Email/Password, Google, GitHub)
3. Get your web app configuration
4. Generate a service account key for Admin SDK
5. Add credentials to `.env`

## Stripe Setup

1. Create a Stripe account at [https://stripe.com](https://stripe.com)
2. Get your API keys from the dashboard
3. Create subscription products and prices
4. Set up webhooks pointing to `/api/webhooks/stripe`
5. Add credentials to `.env`

## Database Setup

1. Create a PostgreSQL database
2. Update `DATABASE_URL` in `.env`
3. Run `npm run db:push` to create tables
4. Optionally run `npm run db:seed` for sample data

## Testing

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

### Coverage Report
```bash
npm run test:coverage
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Other Platforms

This project can be deployed to any platform that supports Next.js:
- AWS Amplify
- Google Cloud Run
- Azure
- Railway
- etc.

## Mobile Deployment

### iOS App Store

1. Build the web app: `npm run build:mobile`
2. Open Xcode: `npm run cap:open:ios`
3. Configure signing & capabilities
4. Archive and upload to App Store Connect

### Google Play Store

1. Build the web app: `npm run build:mobile`
2. Open Android Studio: `npm run cap:open:android`
3. Generate signed APK/AAB
4. Upload to Google Play Console

## Troubleshooting

### Firebase OAuth Errors

**Error: `auth/configuration-not-found`**

This error occurs when OAuth providers are not enabled in Firebase Console.

**Solution:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Authentication** → **Sign-in method**
3. Enable **Google** and/or **GitHub** providers
4. See [FIREBASE_OAUTH_SETUP.md](FIREBASE_OAUTH_SETUP.md) for detailed setup

**Quick Links:**
- Your Firebase project: `https://console.firebase.google.com/project/YOUR_PROJECT_ID/authentication/providers`
- [Complete OAuth Setup Guide](FIREBASE_OAUTH_SETUP.md)

### Database Errors

**Error: `Environment variable not found: DATABASE_URL`**

This occurs when running Prisma commands without a `.env` file.

**Solution:**
1. Create `.env` file: `cp .env.example .env`
2. Add your database URL to both `.env` and `.env.local`
3. Run `npm run db:push` again

**Why this happens:**
- Prisma CLI reads `.env` file
- Next.js reads `.env.local` file
- You need both files with the same `DATABASE_URL`

### Module Resolution Errors

**Error: `Module not found: lucide-react`**

This occurs when using pnpm instead of npm.

**Solution:**
- Use npm instead of pnpm: `npm install`
- See [PACKAGE_MANAGER_CHANGE.md](PACKAGE_MANAGER_CHANGE.md) for details

### Turbopack Cache Issues

**Error: Turbopack panics or cache corruption**

**Solution:**
1. Kill all Node processes: `npm run dev:kill`
2. Clear cache: `Remove-Item -Path .next -Recurse -Force` (Windows) or `rm -rf .next` (Mac/Linux)
3. Use webpack instead: `npm run dev` (Turbopack disabled by default)
4. See [TURBOPACK_ISSUES.md](TURBOPACK_ISSUES.md) for details

## Environment Variables

See [`.env.example`](.env.example) for all required environment variables.

## Documentation

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Capacitor Documentation](https://capacitorjs.com/docs)

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
