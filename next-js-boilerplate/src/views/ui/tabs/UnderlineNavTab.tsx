"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/Tabs";
import { ActiveTabDisplay } from "@/views/ui/tabs/ActiveTabDisplay";

export function UnderlineNavTab() {
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
              <div className="bg-surface rounded p-2 text-center text-xs">
                Cell 1
              </div>
              <div className="bg-surface rounded p-2 text-center text-xs">
                Cell 2
              </div>
              <div className="bg-surface rounded p-2 text-center text-xs">
                Cell 3
              </div>
              <div className="bg-surface rounded p-2 text-center text-xs">
                Cell 4
              </div>
            </div>
          </TabsContent>
          <ActiveTabDisplay />
        </Tabs>
      </section>
    </div>
  );
}
