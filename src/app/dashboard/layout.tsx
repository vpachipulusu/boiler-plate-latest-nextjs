import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin';
import { db } from '@/lib/db/client';
import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';
import { SessionProvider } from '@/components/providers/session-provider';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';

export const metadata = {
  title: 'Dashboard',
  description: 'Manage your account and settings',
};

async function getUser() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
      return null;
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);

    // Get user from database for additional data
    const dbUser = await db.user.findUnique({
      where: { firebaseUid: decodedClaims.uid },
      select: { id: true, displayName: true, avatarUrl: true },
    });

    // Get unread notification count and recent notifications
    const [unreadNotificationCount, recentNotifications] = dbUser
      ? await Promise.all([
          db.notification.count({
            where: { userId: dbUser.id, read: false },
          }),
          db.notification.findMany({
            where: { userId: dbUser.id },
            orderBy: { createdAt: 'desc' },
            take: 10,
          }),
        ])
      : [0, []];

    return {
      ...decodedClaims,
      dbDisplayName: dbUser?.displayName,
      dbAvatarUrl: dbUser?.avatarUrl,
      unreadNotificationCount,
      recentNotifications,
    };
  } catch (error) {
    // Expired/invalid session — clear cookies via route handler and redirect to login
    redirect('/api/auth/clear-session');
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <LayoutDashboard className="h-6 w-6" />
              <span className="hidden font-bold sm:inline-block">Dashboard</span>
            </Link>

            <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
              <Link href="/dashboard" className="transition-colors hover:text-foreground/80">
                Home
              </Link>
              <Link
                href="/dashboard/profile"
                className="transition-colors hover:text-foreground/80"
              >
                Profile
              </Link>
              <Link
                href="/dashboard/settings"
                className="transition-colors hover:text-foreground/80"
              >
                Settings
              </Link>
              <Link
                href="/dashboard/security"
                className="transition-colors hover:text-foreground/80"
              >
                Security
              </Link>
            </nav>
          </div>

          <DashboardHeader
            user={{
              email: user.email,
              picture: user.picture,
              dbDisplayName: user.dbDisplayName,
              dbAvatarUrl: user.dbAvatarUrl,
              unreadNotificationCount: user.unreadNotificationCount,
              recentNotifications: user.recentNotifications,
            }}
          />
        </div>
      </header>

      {/* Main Content */}
      <SessionProvider>
        <main className="flex-1">
          <div className="container py-6">{children}</div>
        </main>
      </SessionProvider>
    </div>
  );
}
