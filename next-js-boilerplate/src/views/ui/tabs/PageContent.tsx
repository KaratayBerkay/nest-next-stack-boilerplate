"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger, useTabsContext } from "@/components/ui/Tabs";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import type { TabsTriggerVariant } from "@/types/ui/TabsTrigger-types";

function ActiveTabDisplay() {
  const { activeValue } = useTabsContext();
  return (
    <div className="bg-surface flex items-center justify-between rounded border border-border px-3 py-2">
      <span className="text-sm">Active tab: <strong>{activeValue}</strong></span>
    </div>
  );
}

function ComponentsTab() {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Default</h3>
        <Tabs defaultValue="account" data-testid="tabs-root">
          <TabsList>
            <TabsTrigger value="account" data-testid="tab-account">
              Account
            </TabsTrigger>
            <TabsTrigger value="password" data-testid="tab-password">
              Password
            </TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">
              Settings
            </TabsTrigger>
          </TabsList>
          <TabsContent value="account" data-testid="tabpanel-account">
            <p className="text-muted text-xs">
              Account settings content goes here.
            </p>
          </TabsContent>
          <TabsContent value="password" data-testid="tabpanel-password">
            <p className="text-muted text-xs">
              Password change form goes here.
            </p>
          </TabsContent>
          <TabsContent value="settings" data-testid="tabpanel-settings">
            <p className="text-muted text-xs">
              General settings content goes here.
            </p>
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
                Tabs can display any type of content including text, forms,
                tables, and custom components.
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

function ExamplesTab() {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Settings Page</h3>
        <p className="text-muted text-xs">
          A settings page layout using tabs.
        </p>
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <div className="space-y-3">
              <p className="text-sm font-medium">Profile Settings</p>
              <div className="space-y-1.5">
                <p className="text-muted text-xs">Name: Jane Doe</p>
                <p className="text-muted text-xs">Email: jane@example.com</p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="notifications">
            <div className="space-y-3">
              <p className="text-sm font-medium">Notification Preferences</p>
              <p className="text-muted text-xs">
                Manage which notifications you receive.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="billing">
            <div className="space-y-3">
              <p className="text-sm font-medium">Billing & Plan</p>
              <p className="text-muted text-xs">
                Current plan: Free. Upgrade to Pro for more features.
              </p>
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
            <p className="text-sm font-medium">Writing</p>
            <p className="text-muted text-xs">Technical writing and documentation articles.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Underline Nav",
    description: "Tabs with underline variant for navigation.",
    render: () => <ComponentsTab />,
  },
  {
    id: "variants",
    title: "Vertical Settings",
    description: "Vertical orientation tabs for a settings panel.",
    render: () => <ExamplesTab />,
  },
  {
    id: "pill-filters",
    title: "Pill Filters",
    description: "Tabs with pill-shaped active state for category filtering.",
    render: () => <PillFiltersTab />,
  },
  {
    id: "variant-gallery",
    title: "Variant Gallery",
    description: "All variants and sizes.",
    render: () => (
      <VariantGallery
        variants={["default", "underline", "pills", "shiny", "glass", "neon", "gradient"]}
        sizes={[]}
        render={(variant) => (
          <Tabs defaultValue="tab1">
            <TabsList>
              <TabsTrigger value="tab1" variant={variant as TabsTriggerVariant}>Tab 1</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">Content</TabsContent>
          </Tabs>
        )}
      />
    ),
  },
];

export default function Page() {
  return (
    <ExampleTabs
      title="Tabs"
      intro="A set of layered content panels shown one at a time."
      examples={examples}
    />
  );
}
