"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

export function TabsDemo() {
  return (
    <div className="flex flex-col gap-4" data-testid="tabs-demo">
      <div>
        <h2 className="text-sm font-semibold">Tabs</h2>
        <p className="text-muted text-xs">
          A set of layered content panels shown one at a time.
        </p>
      </div>

      <div>
        <h3 className="text-muted text-xs font-medium">Default</h3>
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
      </div>
    </div>
  );
}
