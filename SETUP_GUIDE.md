# Setup Guide - SaaS Boilerplate

This guide will help you set up and run the SaaS boilerplate application.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v20.0.0 or higher
- **pnpm** v9.0.0 or higher (run `npm install -g pnpm` to install)
- **PostgreSQL** database (local or cloud-hosted)
- **Firebase** project
- **Stripe** account

## Step 1: Install Dependencies

```bash
cd c:\MainData\NewSourceCode\boiler-plate-latest-nextjs
pnpm install
```

## Step 2: Set Up PostgreSQL Database

### Option A: Local PostgreSQL

1. Install PostgreSQL if not already installed
2. Create a new database:
```sql
CREATE DATABASE saas_db;
```

3. Note your connection string:
```
postgresql://username:password@localhost:5432/saas_db
```

### Option B: Cloud Database (Recommended)

Use a managed PostgreSQL service like:
- **Neon** (https://neon.tech) - Serverless Postgres
- **Supabase** (https://supabase.com) - Includes auth & storage
- **Railway** (https://railway.app) - Easy deployment
- **Vercel Postgres** (https://vercel.com/storage/postgres)

## Step 3: Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use existing)
3. Enable Authentication:
   - Go to **Authentication** → **Sign-in method**
   - Enable **Email/Password**
   - Enable **Google** (add OAuth client ID)
   - Enable **GitHub** (add OAuth app credentials)

4. Get Web App Credentials:
   - Go to **Project Settings** → **General**
   - Under "Your apps", add a web app
   - Copy the configuration values

5. Generate Service Account Key:
   - Go to **Project Settings** → **Service accounts**
   - Click "Generate new private key"
   - Download the JSON file
   - Copy the values from this file

## Step 4: Set Up Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create an account (or use existing)
3. Get API Keys:
   - Go to **Developers** → **API keys**
   - Copy **Publishable key** and **Secret key**

4. Create Products and Prices:
   - Go to **Products** → **Add product**
   - Create three products: Free, Pro, Enterprise
   - For each product, create monthly and yearly prices
   - Note the price IDs (they start with `price_`)

5. Set Up Webhook:
   - Go to **Developers** → **Webhooks**
   - Click "Add endpoint"
   - Endpoint URL: `https://yourdomain.com/api/webhooks/stripe` (use ngrok for local testing)
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.subscription.trial_will_end`
   - Copy the **Signing secret**

## Step 5: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and fill in your values:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/saas_db?schema=public"

# Firebase Client (from Firebase Web App config)
NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="yourproject.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="yourproject"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="yourproject.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abc123"

# Firebase Admin (from Service Account JSON)
FIREBASE_ADMIN_PROJECT_ID="yourproject"
FIREBASE_ADMIN_CLIENT_EMAIL="firebase-adminsdk-xyz@yourproject.iam.gserviceaccount.com"
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Stripe Price IDs
STRIPE_PRICE_ID_FREE=""
STRIPE_PRICE_ID_PRO="price_..."
STRIPE_PRICE_ID_ENTERPRISE="price_..."

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="SaaS Boilerplate"

# Email (Optional - for production)
RESEND_API_KEY=""

# Capacitor (for mobile apps)
APP_ID="com.yourcompany.app"
APP_NAME="Your SaaS App"

# Security
NEXTAUTH_SECRET="generate-a-random-secret-here"

# Environment
NODE_ENV="development"
```

**Important Notes:**
- For `FIREBASE_ADMIN_PRIVATE_KEY`, make sure to include the actual line breaks (`\n`)
- Generate `NEXTAUTH_SECRET` with: `openssl rand -base64 32`
- Never commit `.env` to version control

## Step 6: Set Up Database Schema

1. Generate Prisma Client:
```bash
pnpm db:generate
```

2. Push schema to database:
```bash
pnpm db:push
```

3. (Optional) Seed database with sample data:
```bash
pnpm db:seed
```

4. (Optional) Open Prisma Studio to view data:
```bash
pnpm db:studio
```

## Step 7: Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 8: Test Authentication

1. Go to [http://localhost:3000/signup](http://localhost:3000/signup)
2. Create an account with email and password
3. Check your email for verification link
4. Log in at [http://localhost:3000/login](http://localhost:3000/login)

## Step 9: Test Stripe Integration (Optional)

1. Make sure Stripe webhook is configured (use ngrok for local testing):
   ```bash
   ngrok http 3000
   # Update webhook URL in Stripe to: https://your-ngrok-url.ngrok.io/api/webhooks/stripe
   ```

2. Go to pricing page and try creating a subscription
3. Use Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`

## Local Testing with ngrok

For testing webhooks and OAuth locally:

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok
ngrok http 3000

# Update these URLs:
# - Stripe webhook endpoint
# - Firebase authorized domains
# - OAuth redirect URIs
```

## Common Issues

### Database Connection Issues

If you see "Can't reach database server":
- Check PostgreSQL is running
- Verify `DATABASE_URL` is correct
- Check firewall settings

### Firebase Authentication Issues

If authentication doesn't work:
- Verify all Firebase environment variables are correct
- Check authorized domains in Firebase Console
- Make sure authentication methods are enabled

### Stripe Webhook Issues

If webhooks don't work:
- Verify webhook secret is correct
- Check webhook is active in Stripe Dashboard
- Use ngrok for local testing
- Check webhook logs in Stripe Dashboard

## Next Steps

1. **Customize the app**:
   - Update branding in `src/config/site.ts`
   - Customize subscription plans in `src/config/subscriptions.ts`
   - Modify theme colors in `tailwind.config.ts`

2. **Add your features**:
   - Create new pages in `src/app/(dashboard)/`
   - Add components in `src/components/`
   - Create server actions in `src/app/actions/`

3. **Set up testing**:
   - Run tests: `pnpm test`
   - Run E2E tests: `pnpm test:e2e`
   - Check coverage: `pnpm test:coverage`

4. **Deploy to production**:
   - See deployment guide in README.md
   - Use Vercel for easy deployment

## Getting Help

If you encounter issues:
1. Check the console for error messages
2. Review the logs
3. Consult the documentation links in README.md
4. Open an issue on GitHub

## Development Tools

- **Prisma Studio**: `pnpm db:studio` - Visual database editor
- **TypeScript Check**: `pnpm typecheck` - Check for type errors
- **Linting**: `pnpm lint` - Check code quality
- **Formatting**: `pnpm format` - Format code with Prettier

Happy coding! 🚀
