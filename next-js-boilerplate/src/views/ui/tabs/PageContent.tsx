"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger, useTabsContext } from "@/components/ui/Tabs";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import type { TabsTriggerVariant } from "@/types/ui/TabsTrigger-types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/cn";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

function ActiveTabDisplay() {
  const { activeValue } = useTabsContext();
  return (
    <div className="bg-surface flex items-center justify-between rounded border border-border px-3 py-2">
      <span className="text-sm">Active tab: <strong>{activeValue}</strong></span>
    </div>
  );
}

function UnderlineNavTab() {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Default</h3>
        <Tabs defaultValue="account" data-testid="tabs-root">
          <TabsList>
            <TabsTrigger value="account" data-testid="tab-account">Account</TabsTrigger>
            <TabsTrigger value="password" data-testid="tab-password">Password</TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="account" data-testid="tabpanel-account">
            <p className="text-muted text-xs">Account settings content goes here.</p>
          </TabsContent>
          <TabsContent value="password" data-testid="tabpanel-password">
            <p className="text-muted text-xs">Password change form goes here.</p>
          </TabsContent>
          <TabsContent value="settings" data-testid="tabpanel-settings">
            <p className="text-muted text-xs">General settings content goes here.</p>
          </TabsContent>
          <ActiveTabDisplay />
        </Tabs>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">With Different Content</h3>
        <Tabs defaultValue="text">
          <TabsList>
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="grid">Grid</TabsTrigger>
          </TabsList>
          <TabsContent value="text">
            <div className="space-y-2">
              <p className="text-sm font-medium">Documentation</p>
              <p className="text-muted text-xs">
                Tabs can display any type of content including text, forms, tables, and custom components.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="list">
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-center gap-2">
                <span className="text-success">✓</span> Item one
              </li>
              <li className="flex items-center gap-2">
                <span className="text-success">✓</span> Item two
              </li>
              <li className="flex items-center gap-2">
                <span className="text-success">✓</span> Item three
              </li>
            </ul>
          </TabsContent>
          <TabsContent value="grid">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-surface rounded p-2 text-center text-xs">Cell 1</div>
              <div className="bg-surface rounded p-2 text-center text-xs">Cell 2</div>
              <div className="bg-surface rounded p-2 text-center text-xs">Cell 3</div>
              <div className="bg-surface rounded p-2 text-center text-xs">Cell 4</div>
            </div>
          </TabsContent>
          <ActiveTabDisplay />
        </Tabs>
      </section>
    </div>
  );
}

function PillFiltersTab() {
  return (
    <div className="flex flex-col gap-4">
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all" variant="pills">All</TabsTrigger>
          <TabsTrigger value="design" variant="pills">Design</TabsTrigger>
          <TabsTrigger value="dev" variant="pills">Development</TabsTrigger>
          <TabsTrigger value="marketing" variant="pills">Marketing</TabsTrigger>
          <TabsTrigger value="writing" variant="pills">Writing</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="space-y-2 py-2">
            <p className="text-sm font-medium">All Articles</p>
            <p className="text-muted text-xs">Showing content from all categories.</p>
          </div>
        </TabsContent>
        <TabsContent value="design">
          <div className="space-y-2 py-2">
            <p className="text-sm font-medium">Design</p>
            <p className="text-muted text-xs">UI/UX, graphic design, and prototyping articles.</p>
          </div>
        </TabsContent>
        <TabsContent value="dev">
          <div className="space-y-2 py-2">
            <p className="text-sm font-medium">Development</p>
            <p className="text-muted text-xs">Frontend, backend, and DevOps articles.</p>
          </div>
        </TabsContent>
        <TabsContent value="marketing">
          <div className="space-y-2 py-2">
            <p className="text-sm font-medium">Marketing</p>
            <p className="text-muted text-xs">Growth, SEO, and content strategy articles.</p>
          </div>
        </TabsContent>
        <TabsContent value="writing">
          <div className="space-y-2 py-2">
            <p className="text-sm font-medium">Technical Writing</p>
            <p className="text-muted text-xs">Technical writing and documentation articles.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProfilePanel() {
  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="settings-name">Name</Label>
        <Input id="settings-name" defaultValue="Jane Doe" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="settings-email">Email</Label>
        <Input id="settings-email" type="email" defaultValue="jane@example.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="settings-avatar">Avatar</Label>
        <Input id="settings-avatar" type="file" />
      </div>
    </div>
  );
}

function SecurityPanel() {
  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="settings-current-password">Current Password</Label>
        <Input id="settings-current-password" type="password" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="settings-new-password">New Password</Label>
        <Input id="settings-new-password" type="password" />
      </div>
      <Button>Update Password</Button>
    </div>
  );
}

function NotificationsPanel() {
  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="settings-email-notif">Email notifications</Label>
        <Switch id="settings-email-notif" defaultChecked />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="settings-push-notif">Push notifications</Label>
        <Switch id="settings-push-notif" defaultChecked />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="settings-sms-notif">SMS notifications</Label>
        <Switch id="settings-sms-notif" />
      </div>
    </div>
  );
}

function SettingsSectionsTab() {
  return (
    <Tabs defaultValue="profile">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <ProfilePanel />
      </TabsContent>
      <TabsContent value="security">
        <SecurityPanel />
      </TabsContent>
      <TabsContent value="notifications">
        <NotificationsPanel />
      </TabsContent>
    </Tabs>
  );
}

const codeString = `function StatCard({ title, value, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        {trend && (
          <span className={trend > 0 ? "text-success" : "text-error"}>
            {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </CardContent>
    </Card>
  );
}`;

function CodePreviewTab() {
  const [mode, setMode] = useState<"preview" | "code">("preview");

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={mode === "preview" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("preview")}
        >
          Preview
        </Button>
        <Button
          variant={mode === "code" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("code")}
        >
          Code
        </Button>
      </div>
      {mode === "preview" ? (
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-lg font-semibold">Styled Card Component</p>
            <p className="text-muted text-sm">
              This is a preview of the rendered component. Toggle to Code to see the source.
            </p>
            <div className="bg-surface-hover inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm">
              <span className="text-success">●</span> Live preview
            </div>
          </div>
        </Card>
      ) : (
        <pre className="bg-surface-hover font-mono rounded-md p-4 text-sm overflow-x-auto">
          {codeString}
        </pre>
      )}
    </div>
  );
}

interface StatTile {
  label: string;
  value: string;
  trend: number;
}

const periodData: Record<string, StatTile[]> = {
  day: [
    { label: "Revenue", value: "$1,234", trend: 12 },
    { label: "Users", value: "56", trend: 8 },
    { label: "Orders", value: "23", trend: -3 },
  ],
  week: [
    { label: "Revenue", value: "$8,901", trend: 15 },
    { label: "Users", value: "412", trend: 22 },
    { label: "Orders", value: "178", trend: 10 },
  ],
  month: [
    { label: "Revenue", value: "$34,567", trend: 24 },
    { label: "Users", value: "1,890", trend: 18 },
    { label: "Orders", value: "745", trend: 31 },
  ],
};

function DashboardPeriodsTab() {
  const [period, setPeriod] = useState("day");
  const tiles = periodData[period] ?? [];

  return (
    <div className="space-y-4">
      <div className="flex gap-1">
        {["day", "week", "month"].map((p) => (
          <Button
            key={p}
            variant={period === p ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod(p)}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {tiles.map((tile) => (
          <Card key={tile.label}>
            <CardHeader>
              <CardTitle>{tile.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{tile.value}</p>
              <span
                className={cn(
                  "text-sm",
                  tile.trend > 0 ? "text-success" : "text-error",
                )}
              >
                {tile.trend > 0 ? "↑" : "↓"} {Math.abs(tile.trend)}%
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Underline Nav",
    description: "Tabs with underline variant for navigation.",
    render: () => <UnderlineNavTab />,
  },
  {
    id: "pill-filters",
    title: "Pill Filters",
    description: "Tabs with pill-shaped active state for category filtering.",
    render: () => <PillFiltersTab />,
  },
  {
    id: "settings-sections",
    title: "Settings Sections",
    description: "Profile, security, and notifications settings with real form controls.",
    render: () => <SettingsSectionsTab />,
  },
  {
    id: "code-preview",
    title: "Code Preview",
    description: "Toggle between a rendered preview and the source code.",
    render: () => <CodePreviewTab />,
  },
  {
    id: "dashboard-periods",
    title: "Dashboard Periods",
    description: "Day, week, and month KPI tiles with trend indicators.",
    render: () => <DashboardPeriodsTab />,
  },
  {
    id: "variant-gallery",
    title: "Variant Gallery",
    description: "All trigger variants including the global styles.",
    render: () => (
      <VariantGallery
        variants={["default", "underline", "pills", "shiny", "glass", "neon", "gradient"]}
        sizes={[]}
        render={(variant) => (
          <Tabs defaultValue="tab1">
            <TabsList>
              <TabsTrigger value="tab1" variant={variant as TabsTriggerVariant}>Tab 1</TabsTrigger>
              <TabsTrigger value="tab2" variant={variant as TabsTriggerVariant}>Tab 2</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">
              <p className="text-muted text-xs">Panel content</p>
            </TabsContent>
            <TabsContent value="tab2">
              <p className="text-muted text-xs">Second panel</p>
            </TabsContent>
          </Tabs>
        )}
      />
    ),
  },
];

export default function Page({ initialTab }: { initialTab?: string }) {
  return (
    <ExampleTabs
      title="Tabs"
      intro="A set of layered content panels shown one at a time."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
