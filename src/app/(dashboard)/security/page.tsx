"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  changePasswordAction,
  deleteAccountAction,
  exportUserDataAction,
  getLoginHistoryAction,
} from "@/app/actions/user-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Key,
  AlertTriangle,
  Download,
  Trash2,
  Smartphone,
  Loader2,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SecurityPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  useEffect(() => {
    loadLoginHistory();
  }, []);

  async function loadLoginHistory() {
    try {
      setIsLoading(true);
      const result = await getLoginHistoryAction();

      if (result.success && result.data) {
        setLoginHistory(result.data.history || []);
      }
    } catch (error) {
      console.error("Load login history error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleChangePassword() {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsChangingPassword(true);

      const result = await changePasswordAction(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to change password",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Password changed successfully",
      });

      setShowChangePassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Change password error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmation !== "DELETE") {
      toast({
        title: "Error",
        description: 'Please type "DELETE" to confirm',
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDeletingAccount(true);

      const result = await deleteAccountAction();

      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to delete account",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Account deleted successfully",
      });

      router.push("/");
    } catch (error) {
      console.error("Delete account error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAccount(false);
    }
  }

  async function handleExportData() {
    try {
      const result = await exportUserDataAction();

      if (!result.success || !result.data) {
        toast({
          title: "Error",
          description: result.error || "Failed to export data",
          variant: "destructive",
        });
        return;
      }

      // Create a downloadable JSON file
      const dataStr = JSON.stringify(result.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `user-data-${new Date().toISOString()}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Data exported successfully",
      });
    } catch (error) {
      console.error("Export data error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security</h1>
        <p className="text-muted-foreground">
          Manage your account security and privacy settings
        </p>
      </div>

      {/* Password Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
            <DialogTrigger asChild>
              <Button>Change Password</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
                <DialogDescription>
                  Enter your current password and choose a new one
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowChangePassword(false)}
                  disabled={isChangingPassword}
                >
                  Cancel
                </Button>
                <Button onClick={handleChangePassword} disabled={isChangingPassword}>
                  {isChangingPassword && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Change Password
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <div className="font-medium">2FA Status</div>
              <div className="text-sm text-muted-foreground">
                Two-factor authentication is not enabled
              </div>
            </div>
            <Badge variant="secondary">Coming Soon</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Two-factor authentication (2FA) adds an additional layer of
            protection to your account. Once enabled, you'll need to enter both
            your password and an authentication code from your mobile device to
            sign in.
          </p>
          <Button disabled>
            <Shield className="mr-2 h-4 w-4" />
            Enable 2FA (Coming Soon)
          </Button>
        </CardContent>
      </Card>

      {/* Login History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Login History
          </CardTitle>
          <CardDescription>
            Review recent activity on your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : loginHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loginHistory.map((login) => (
                  <TableRow key={login.id}>
                    <TableCell>
                      {new Date(login.loginAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {login.ipAddress || "Unknown"}
                    </TableCell>
                    <TableCell>{login.location || "Unknown"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={login.successful ? "default" : "destructive"}
                      >
                        {login.successful ? "Success" : "Failed"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">
              No login history available
            </p>
          )}
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Export
          </CardTitle>
          <CardDescription>
            Download a copy of your personal data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Export all your account data including profile information,
            settings, and activity history.
          </p>
          <Button onClick={handleExportData} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export My Data
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={showDeleteAccount} onOpenChange={setShowDeleteAccount}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-destructive">
                  Delete Account
                </DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="delete-confirmation">
                    Type <span className="font-bold">DELETE</span> to confirm
                  </Label>
                  <Input
                    id="delete-confirmation"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="DELETE"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteAccount(false);
                    setDeleteConfirmation("");
                  }}
                  disabled={isDeletingAccount}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount || deleteConfirmation !== "DELETE"}
                >
                  {isDeletingAccount && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Delete Account
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
