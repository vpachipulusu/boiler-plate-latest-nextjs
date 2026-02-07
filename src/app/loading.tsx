import { Loader2 } from "lucide-react";

/**
 * Loading Component
 *
 * Global loading state for the application
 * Displayed during page transitions and data fetching
 * Uses Next.js 16 App Router loading conventions
 */
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
