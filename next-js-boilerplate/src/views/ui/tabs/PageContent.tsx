"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

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
              </Tabs>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Shiny</h3>
              <Tabs defaultValue="overview" variant="shiny">
                <TabsList variant="shiny">
                  <TabsTrigger variant="shiny" value="overview">Overview</TabsTrigger>
                  <TabsTrigger variant="shiny" value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger variant="shiny" value="reports">Reports</TabsTrigger>
                </TabsList>
                <TabsContent variant="shiny" value="overview">
                  <p className="text-slate-300 text-xs">
                    Dashboard overview with shiny gradient styling.
                  </p>
                </TabsContent>
                <TabsContent variant="shiny" value="analytics">
                  <p className="text-slate-300 text-xs">
                    Analytics data with enhanced visual effects.
                  </p>
                </TabsContent>
                <TabsContent variant="shiny" value="reports">
                  <p className="text-slate-300 text-xs">
                    Generated reports with premium appearance.
                  </p>
                </TabsContent>
              </Tabs>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Glass</h3>
              <div className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-6">
                <Tabs defaultValue="profile" variant="glass">
                  <TabsList variant="glass">
                    <TabsTrigger variant="glass" value="profile">Profile</TabsTrigger>
                    <TabsTrigger variant="glass" value="security">Security</TabsTrigger>
                    <TabsTrigger variant="glass" value="integrations">Integrations</TabsTrigger>
                  </TabsList>
                  <TabsContent variant="glass" value="profile">
                    <p className="text-slate-300 text-xs">
                      Profile settings with frosted glass effect.
                    </p>
                  </TabsContent>
                  <TabsContent variant="glass" value="security">
                    <p className="text-slate-300 text-xs">
                      Security configuration with translucent panels.
                    </p>
                  </TabsContent>
                  <TabsContent variant="glass" value="integrations">
                    <p className="text-slate-300 text-xs">
                      Third-party integrations management.
                    </p>
                  </TabsContent>
                </Tabs>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Neon</h3>
              <div className="rounded-xl bg-slate-950 p-6">
                <Tabs defaultValue="live" variant="neon">
                  <TabsList variant="neon">
                    <TabsTrigger variant="neon" value="live">Live</TabsTrigger>
                    <TabsTrigger variant="neon" value="history">History</TabsTrigger>
                    <TabsTrigger variant="neon" value="alerts">Alerts</TabsTrigger>
                  </TabsList>
                  <TabsContent variant="neon" value="live">
                    <p className="text-cyan-400/70 text-xs">
                      Live monitoring with neon glow effects.
                    </p>
                  </TabsContent>
                  <TabsContent variant="neon" value="history">
                    <p className="text-cyan-400/70 text-xs">
                      Historical data with cyberpunk styling.
                    </p>
                  </TabsContent>
                  <TabsContent variant="neon" value="alerts">
                    <p className="text-cyan-400/70 text-xs">
                      Alert management with illuminated borders.
                    </p>
                  </TabsContent>
                </Tabs>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Gradient</h3>
              <Tabs defaultValue="design" variant="gradient">
                <TabsList variant="gradient">
                  <TabsTrigger variant="gradient" value="design">Design</TabsTrigger>
                  <TabsTrigger variant="gradient" value="code">Code</TabsTrigger>
                  <TabsTrigger variant="gradient" value="deploy">Deploy</TabsTrigger>
                </TabsList>
                <TabsContent variant="gradient" value="design">
                  <p className="text-slate-400 text-xs">
                    Design workspace with gradient text effects.
                  </p>
                </TabsContent>
                <TabsContent variant="gradient" value="code">
                  <p className="text-slate-400 text-xs">
                    Code editor with deep gradient backgrounds.
                  </p>
                </TabsContent>
                <TabsContent variant="gradient" value="deploy">
                  <p className="text-slate-400 text-xs">
                    Deployment pipeline with premium styling.
                  </p>
                </TabsContent>
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
              </Tabs>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="examples">
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Settings Page (Glass)</h3>
              <p className="text-muted text-xs">
                A settings page layout using glass-styled tabs.
              </p>
              <div className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-6">
                <Tabs defaultValue="profile" variant="glass">
                  <TabsList variant="glass">
                    <TabsTrigger variant="glass" value="profile">Profile</TabsTrigger>
                    <TabsTrigger variant="glass" value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger variant="glass" value="billing">Billing</TabsTrigger>
                  </TabsList>
                  <TabsContent variant="glass" value="profile">
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-white">Profile Settings</p>
                      <div className="space-y-1.5">
                        <p className="text-slate-300 text-xs">Name: Jane Doe</p>
                        <p className="text-slate-300 text-xs">Email: jane@example.com</p>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent variant="glass" value="notifications">
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-white">Notification Preferences</p>
                      <p className="text-slate-300 text-xs">
                        Manage which notifications you receive.
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent variant="glass" value="billing">
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-white">Billing & Plan</p>
                      <p className="text-slate-300 text-xs">
                        Current plan: Free. Upgrade to Pro for more features.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Dashboard (Neon)</h3>
              <p className="text-muted text-xs">
                A dashboard layout using neon-styled tabs.
              </p>
              <div className="rounded-xl bg-slate-950 p-6">
                <Tabs defaultValue="metrics" variant="neon">
                  <TabsList variant="neon">
                    <TabsTrigger variant="neon" value="metrics">Metrics</TabsTrigger>
                    <TabsTrigger variant="neon" value="traffic">Traffic</TabsTrigger>
                    <TabsTrigger variant="neon" value="revenue">Revenue</TabsTrigger>
                  </TabsList>
                  <TabsContent variant="neon" value="metrics">
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-cyan-300">Key Metrics</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded border border-cyan-500/20 p-3">
                          <p className="text-cyan-400 text-lg font-bold">1,234</p>
                          <p className="text-cyan-400/60 text-xs">Active Users</p>
                        </div>
                        <div className="rounded border border-cyan-500/20 p-3">
                          <p className="text-cyan-400 text-lg font-bold">567</p>
                          <p className="text-cyan-400/60 text-xs">Conversions</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent variant="neon" value="traffic">
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-cyan-300">Traffic Sources</p>
                      <p className="text-cyan-400/70 text-xs">
                        Direct: 45% | Organic: 32% | Referral: 23%
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent variant="neon" value="revenue">
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-cyan-300">Revenue Breakdown</p>
                      <p className="text-cyan-400/70 text-xs">
                        Subscriptions: $12,340 | One-time: $5,670 | Total: $18,010
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </section>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
