import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { db } from '@/lib/db/client';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

async function getSettings() {
  const generalSettings = await db.appSettings.findMany({
    where: { category: 'general' },
  });

  const featureFlags = await db.featureFlag.findMany({
    orderBy: { name: 'asc' },
  });

  const emailTemplates = await db.emailTemplate.findMany({
    orderBy: { name: 'asc' },
  });

  return {
    generalSettings,
    featureFlags,
    emailTemplates,
  };
}

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage application settings and configuration</p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="features">Feature Flags</TabsTrigger>
          <TabsTrigger value="email">Email Templates</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic application settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="app-name">Application Name</Label>
                <Input
                  id="app-name"
                  placeholder="SaaS Boilerplate"
                  defaultValue="SaaS Boilerplate"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="support-email">Support Email</Label>
                <Input id="support-email" type="email" placeholder="support@example.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Default Timezone</Label>
                <Input id="timezone" defaultValue="UTC" />
              </div>

              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Flags */}
        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Flags</CardTitle>
              <CardDescription>Enable or disable features across the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.featureFlags.length > 0 ? (
                settings.featureFlags.map((flag: any) => (
                  <div
                    key={flag.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{flag.name}</p>
                        {flag.enabled && <Badge variant="default">Enabled</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {flag.description || 'No description'}
                      </p>
                    </div>
                    <Switch checked={flag.enabled} />
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No feature flags configured
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Templates */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Manage transactional email templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.emailTemplates.length > 0 ? (
                settings.emailTemplates.map((template: any) => (
                  <div key={template.id} className="space-y-2 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium capitalize">{template.name.replace('-', ' ')}</p>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">Subject: {template.subject}</p>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No email templates configured
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing */}
        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Configuration</CardTitle>
              <CardDescription>Manage subscription plans and pricing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Pro Plan</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pro-price">Monthly Price ($)</Label>
                    <Input id="pro-price" type="number" defaultValue="29" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pro-stripe-id">Stripe Price ID</Label>
                    <Input id="pro-stripe-id" placeholder="price_..." />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Enterprise Plan</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="enterprise-price">Monthly Price ($)</Label>
                    <Input id="enterprise-price" type="number" defaultValue="99" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="enterprise-stripe-id">Stripe Price ID</Label>
                    <Input id="enterprise-stripe-id" placeholder="price_..." />
                  </div>
                </div>
              </div>

              <Button>Save Pricing</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
