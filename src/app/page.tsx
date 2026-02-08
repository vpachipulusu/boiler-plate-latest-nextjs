import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Code, Zap, Shield, Rocket } from 'lucide-react';

/**
 * Home Page Component
 *
 * Landing page showcasing the boilerplate features
 * Uses modern React 19 patterns and Next.js 16 App Router
 */
export default function HomePage() {
  return (
    <div className="container relative">
      {/* Hero Section */}
      <section className="mx-auto flex max-w-[980px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20">
        <div className="flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
          <Rocket className="h-4 w-4" />
          <span>Next.js 16 + React 19 + TypeScript</span>
        </div>
        <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]">
          Build modern web apps
          <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {' '}
            faster than ever
          </span>
        </h1>
        <p className="max-w-[750px] text-center text-lg text-muted-foreground sm:text-xl">
          A production-ready boilerplate with everything you need to build amazing applications.
          TypeScript, Tailwind CSS, Prisma, NextAuth, and more.
        </p>
        <div className="flex w-full items-center justify-center space-x-4 py-4 md:pb-10">
          <Button size="lg" asChild>
            <Link href="/signup">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link
              href="https://github.com/yourusername/your-repo"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 py-8 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <Code className="mb-2 h-10 w-10 text-primary" />
            <CardTitle>Type Safe</CardTitle>
            <CardDescription>
              Built with TypeScript for full type safety and better developer experience
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Zap className="mb-2 h-10 w-10 text-primary" />
            <CardTitle>Blazing Fast</CardTitle>
            <CardDescription>
              Optimized with Next.js 16 App Router and React 19 for lightning fast performance
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Shield className="mb-2 h-10 w-10 text-primary" />
            <CardTitle>Secure by Default</CardTitle>
            <CardDescription>
              NextAuth.js integration with multiple authentication providers
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Rocket className="mb-2 h-10 w-10 text-primary" />
            <CardTitle>Production Ready</CardTitle>
            <CardDescription>
              Pre-configured with testing, linting, formatting, and deployment setup
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      {/* Tech Stack Section */}
      <section className="mx-auto max-w-[980px] py-8 md:py-12">
        <h2 className="mb-8 text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl">
          Powered by Modern Technologies
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>What's Included</CardTitle>
            <CardDescription>
              Everything you need to build production-ready applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <TechItem name="Next.js 16" description="App Router with Server Components" />
              <TechItem name="React 19" description="Latest features and optimizations" />
              <TechItem name="TypeScript" description="Type-safe development" />
              <TechItem name="Tailwind CSS" description="Utility-first styling" />
              <TechItem name="Prisma" description="Type-safe database ORM" />
              <TechItem name="NextAuth.js" description="Authentication made easy" />
              <TechItem name="React Query" description="Powerful data fetching" />
              <TechItem name="Zod" description="Schema validation" />
              <TechItem name="Vitest" description="Fast unit testing" />
              <TechItem name="Playwright" description="End-to-end testing" />
              <TechItem name="ESLint + Prettier" description="Code quality tools" />
              <TechItem name="Capacitor" description="Native mobile support" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-[980px] py-8 md:py-12 md:pb-8 lg:py-24">
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Ready to start building?</CardTitle>
            <CardDescription className="text-lg">
              Get started with this boilerplate and ship your next project faster
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">
                Create an Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

/**
 * Tech Item Component
 * Displays a technology with its description
 */
function TechItem({ name, description }: { name: string; description: string }) {
  return (
    <div className="flex flex-col space-y-1">
      <p className="font-semibold">{name}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
