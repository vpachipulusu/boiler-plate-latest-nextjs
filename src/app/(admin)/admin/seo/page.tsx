import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { db } from '@/lib/db/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

async function getSEOData() {
  const metaTags = await db.sEOMeta.findMany({
    orderBy: { page: 'asc' },
  });

  const redirects = await db.uRLRedirect.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return {
    metaTags,
    redirects,
  };
}

export default async function AdminSEOPage() {
  const data = await getSEOData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SEO Management</h1>
        <p className="text-muted-foreground">Manage meta tags, redirects, and SEO configuration</p>
      </div>

      {/* SEO Tabs */}
      <Tabs defaultValue="meta-tags" className="space-y-4">
        <TabsList>
          <TabsTrigger value="meta-tags">Meta Tags</TabsTrigger>
          <TabsTrigger value="redirects">URL Redirects</TabsTrigger>
          <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
        </TabsList>

        {/* Meta Tags */}
        <TabsContent value="meta-tags" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Page Meta Tags</CardTitle>
                  <CardDescription>Configure SEO meta tags for each page</CardDescription>
                </div>
                <Button>Add Page</Button>
              </div>
            </CardHeader>
            <CardContent>
              {data.metaTags.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Page</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Index</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.metaTags.map((meta: any) => (
                      <TableRow key={meta.id}>
                        <TableCell className="font-medium">{meta.page}</TableCell>
                        <TableCell className="max-w-xs truncate">{meta.title}</TableCell>
                        <TableCell className="max-w-md truncate text-sm text-muted-foreground">
                          {meta.description}
                        </TableCell>
                        <TableCell>
                          {meta.noindex ? (
                            <Badge variant="destructive">No Index</Badge>
                          ) : (
                            <Badge variant="default">Indexed</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No meta tags configured. Add pages to get started
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* URL Redirects */}
        <TabsContent value="redirects" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>URL Redirects</CardTitle>
                  <CardDescription>Manage 301/302 redirects for old URLs</CardDescription>
                </div>
                <Button>Add Redirect</Button>
              </div>
            </CardHeader>
            <CardContent>
              {data.redirects.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.redirects.map((redirect: any) => (
                      <TableRow key={redirect.id}>
                        <TableCell className="font-mono text-sm">{redirect.fromPath}</TableCell>
                        <TableCell className="font-mono text-sm">{redirect.toPath}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{redirect.statusCode}</Badge>
                        </TableCell>
                        <TableCell>
                          {redirect.enabled ? (
                            <Badge variant="default">Enabled</Badge>
                          ) : (
                            <Badge variant="secondary">Disabled</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No redirects configured
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sitemap */}
        <TabsContent value="sitemap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sitemap Management</CardTitle>
              <CardDescription>Generate and manage XML sitemaps</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">sitemap.xml</p>
                  <p className="text-sm text-muted-foreground">
                    Last generated: {new Date().toLocaleString()}
                  </p>
                </div>
                <Button>Regenerate</Button>
              </div>

              <div className="space-y-2">
                <Label>Sitemap URL</Label>
                <Input readOnly value="https://yourapp.com/sitemap.xml" className="font-mono" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
