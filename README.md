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
- pnpm 9+
- PostgreSQL database
- Firebase project
- Stripe account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd boiler-plate-latest-nextjs
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Fill in your environment variables:
   - Database URL
   - Firebase credentials (client & admin)
   - Stripe keys
   - Other configuration

4. **Set up the database**
   ```bash
   pnpm db:generate
   pnpm db:push
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

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
- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm typecheck` - Type check with TypeScript

### Database
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:push` - Push schema to database
- `pnpm db:studio` - Open Prisma Studio
- `pnpm db:migrate` - Run migrations
- `pnpm db:seed` - Seed database

### Testing
- `pnpm test` - Run unit tests with Vitest
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Run tests with coverage
- `pnpm test:e2e` - Run E2E tests with Playwright
- `pnpm test:all` - Run all tests

### Mobile
- `pnpm cap:init` - Initialize Capacitor
- `pnpm cap:sync` - Sync web assets to native projects
- `pnpm cap:add:ios` - Add iOS platform
- `pnpm cap:add:android` - Add Android platform
- `pnpm ios:build` - Build for iOS
- `pnpm android:build` - Build for Android

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
3. Run `pnpm db:push` to create tables
4. Optionally run `pnpm db:seed` for sample data

## Testing

### Unit Tests
```bash
pnpm test:unit
```

### Integration Tests
```bash
pnpm test:integration
```

### E2E Tests
```bash
pnpm test:e2e
```

### Coverage Report
```bash
pnpm test:coverage
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

1. Build the web app: `pnpm build:mobile`
2. Open Xcode: `pnpm cap:open:ios`
3. Configure signing & capabilities
4. Archive and upload to App Store Connect

### Google Play Store

1. Build the web app: `pnpm build:mobile`
2. Open Android Studio: `pnpm cap:open:android`
3. Generate signed APK/AAB
4. Upload to Google Play Console

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
