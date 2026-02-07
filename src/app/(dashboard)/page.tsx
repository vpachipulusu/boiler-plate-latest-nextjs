import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import { db } from "@/lib/db/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Clock,
  Activity,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getUserData() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
      return null;
    }

    const decodedClaims = await adminAuth.verifySessionCookie(
      sessionCookie,
      true
    );

    const user = await db.user.findUnique({
      where: { firebaseUid: decodedClaims.uid },
      include: {
        settings: true,
        loginHistory: {
          orderBy: { loginAt: "desc" },
          take: 5,
        },
      },
    });

    return user;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

export default async function DashboardPage() {
  const user = await getUserData();

  if (!user) {
    return <div>Error loading user data</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.displayName || "User"}!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Account Status
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.emailVerified ? (
                <Badge variant="default">Verified</Badge>
              ) : (
                <Badge variant="destructive">Unverified</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Email verification status
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Subscription Plan
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {user.subscriptionTier}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {user.subscriptionStatus}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Login</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.lastLoginAt
                ? new Date(user.lastLoginAt).toLocaleDateString()
                : "Never"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {user.lastLoginAt
                ? new Date(user.lastLoginAt).toLocaleTimeString()
                : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Member Since
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.floor(
                (Date.now() - new Date(user.createdAt).getTime()) /
                  (1000 * 60 * 60 * 24)
              )}{" "}
              days ago
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Account Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>Your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
              </div>
              <span className="font-medium">{user.email}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Display Name:</span>
              </div>
              <span className="font-medium">
                {user.displayName || "Not set"}
              </span>
            </div>

            {user.location && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Location:
                </span>
                <span className="font-medium">{user.location}</span>
              </div>
            )}

            <div className="pt-4">
              <Button asChild className="w-full">
                <Link href="/dashboard/profile">Edit Profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Login Activity
            </CardTitle>
            <CardDescription>Your last 5 login sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {user.loginHistory && user.loginHistory.length > 0 ? (
              <div className="space-y-4">
                {user.loginHistory.map((login: any) => (
                  <div
                    key={login.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(login.loginAt).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {login.ipAddress || "Unknown IP"}
                      </p>
                    </div>
                    <Badge
                      variant={login.successful ? "default" : "destructive"}
                    >
                      {login.successful ? "Success" : "Failed"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No login history available
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage your account and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button asChild variant="outline">
              <Link href="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/settings">
                <Shield className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/security">
                <Shield className="mr-2 h-4 w-4" />
                Security
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/billing">
                <Activity className="mr-2 h-4 w-4" />
                Billing
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
