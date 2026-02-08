'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { upsertAppSettingAction } from '@/app/actions/admin/settings-actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, DollarSign, Globe } from 'lucide-react';

interface GeneralSettingsFormProps {
  initialSettings: Record<string, any>;
}

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
];

export function GeneralSettingsForm({ initialSettings }: GeneralSettingsFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [appName, setAppName] = useState(initialSettings.app_name || 'SaaS Boilerplate');
  const [supportEmail, setSupportEmail] = useState(initialSettings.support_email || '');
  const [defaultTimezone, setDefaultTimezone] = useState(initialSettings.default_timezone || 'UTC');
  const [currency, setCurrency] = useState(initialSettings.currency || 'USD');
  const [language, setLanguage] = useState(initialSettings.language || 'en');

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Update all settings
      const updates = [
        {
          key: 'app_name',
          value: appName,
          category: 'general',
          description: 'Application name',
        },
        {
          key: 'support_email',
          value: supportEmail,
          category: 'general',
          description: 'Support contact email',
        },
        {
          key: 'default_timezone',
          value: defaultTimezone,
          category: 'general',
          description: 'Default timezone for the application',
        },
        {
          key: 'currency',
          value: currency,
          category: 'general',
          description: 'Default currency for pricing and billing',
        },
        {
          key: 'language',
          value: language,
          category: 'general',
          description: 'Default language for the application',
        },
      ];

      for (const update of updates) {
        const result = await upsertAppSettingAction(update);
        if (!result.success) {
          throw new Error(result.error || 'Failed to update setting');
        }
      }

      toast({
        title: 'Success',
        description: 'Settings updated successfully',
      });
    } catch (error: any) {
      console.error('Save settings error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="support-email">Support Email</Label>
          <Input
            id="support-email"
            type="email"
            placeholder="support@example.com"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Default Timezone</Label>
          <Input
            id="timezone"
            value={defaultTimezone}
            onChange={(e) => setDefaultTimezone(e.target.value)}
            placeholder="UTC"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="currency" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Default Currency
            </Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency" className="font-mono">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code} className="font-mono">
                    <span className="flex items-center gap-2">
                      <span className="text-base">{curr.symbol}</span>
                      <span className="font-semibold">{curr.code}</span>
                      <span className="text-muted-foreground">-</span>
                      <span>{curr.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Currency used for pricing and billing throughout the app
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Default Language
            </Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      <span className="font-medium">{lang.name}</span>
                      <span className="text-xs text-muted-foreground">({lang.code})</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Default language for the application interface
            </p>
          </div>
        </div>

        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}
