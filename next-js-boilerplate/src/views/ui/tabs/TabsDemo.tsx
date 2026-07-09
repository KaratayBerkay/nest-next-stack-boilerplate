"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/Tabs";

export function TabsDemo() {
  return (
    <div className="flex flex-col gap-4" data-testid="tabs-demo">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Tabs</h2>
        <p className="text-muted text-sm">
          A set of layered content panels shown one at a time.
        </p>
      </div>

      <Tabs defaultValue="components">
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="components">
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
            </Tabs>
          </section>
        </TabsContent>

        <TabsContent value="examples">
          <section className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold">Settings Page Layout</h3>
            <Tabs defaultValue="profile">
              <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
              </TabsList>
              <TabsContent value="profile">
                <div className="surface space-y-3 p-4">
                  <p className="text-sm font-medium">Profile Settings</p>
                  <div className="space-y-1.5">
                    <p className="text-muted text-xs">Name: Jane Doe</p>
                    <p className="text-muted text-xs">Email: jane@example.com</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="notifications">
                <div className="surface space-y-3 p-4">
                  <p className="text-sm font-medium">Notification Preferences</p>
                  <p className="text-muted text-xs">Manage which notifications you receive.</p>
                </div>
              </TabsContent>
              <TabsContent value="billing">
                <div className="surface space-y-3 p-4">
                  <p className="text-sm font-medium">Billing & Plan</p>
                  <p className="text-muted text-xs">Current plan: Free. Upgrade to Pro for more features.</p>
                </div>
              </TabsContent>
            </Tabs>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
