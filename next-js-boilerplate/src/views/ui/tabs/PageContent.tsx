"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger, useTabsContext } from "@/components/ui/Tabs";

function ActiveTabDisplay() {
  const { activeValue } = useTabsContext();
  return (
    <div className="bg-surface flex items-center justify-between rounded border border-border px-3 py-2">
      <span className="text-sm">Active tab: <strong>{activeValue}</strong></span>
    </div>
  );
}

export default function Page() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Tabs</h2>
        <p className="text-muted text-sm">
          A set of layered content panels shown one at a time.
        </p>
      </div>

      <Tabs defaultValue="components">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="components">
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
                      <span className="text-green-500">✓</span> Item one
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span> Item two
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span> Item three
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
        </TabsContent>

        <TabsContent value="examples">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
