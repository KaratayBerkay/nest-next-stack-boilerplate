"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Switch } from "@/components/ui/Switch";
import { Badge } from "@/components/ui/Badge";

export default function SwitchPage() {
  const [settings, setSettings] = useState({
    notifications: true,
    sound: true,
    darkMode: false,
    autoSave: false,
  });

  const enabledCount = Object.values(settings).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-6 w-full" data-testid="switch-demo">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Switch</h2>
        <p className="text-muted text-sm">
          A toggle switch for binary settings with multiple stylish variants.
        </p>
      </div>

      <Tabs defaultValue="components">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="space-y-6">
          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Default</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Switch data-testid="switch-default" />
              <Switch defaultChecked data-testid="switch-checked" />
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Disabled</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Switch disabled data-testid="switch-disabled" />
              <Switch disabled defaultChecked />
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">With Label</h3>
            <Switch label="Enable notifications" data-testid="switch-labeled" />
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Shiny Variant</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Switch variant="shiny" label="Shiny unchecked" />
              <Switch variant="shiny" defaultChecked label="Shiny checked" />
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Glass Variant</h3>
            <div className="bg-slate-950 p-6 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Switch variant="glass" label="Glass unchecked" />
                <Switch variant="glass" defaultChecked label="Glass checked" />
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Neon Variant</h3>
            <div className="bg-slate-950 p-6 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Switch variant="neon" label="Neon unchecked" />
                <Switch variant="neon" defaultChecked label="Neon checked" />
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Gradient Variant</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Switch variant="gradient" label="Gradient unchecked" />
              <Switch variant="gradient" defaultChecked label="Gradient checked" />
            </div>
          </section>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Settings Panel (Default)</h3>
            <div className="surface divide-border max-w-sm divide-y overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <span className="text-sm font-medium">Notifications</span>
                  <p className="text-muted text-xs">Receive push notifications</p>
                </div>
                <Switch
                  checked={settings.notifications}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      notifications: e.target.checked,
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <span className="text-sm font-medium">Sound</span>
                  <p className="text-muted text-xs">Play sounds for events</p>
                </div>
                <Switch
                  checked={settings.sound}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, sound: e.target.checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <span className="text-sm font-medium">Dark Mode</span>
                  <p className="text-muted text-xs">Use dark color scheme</p>
                </div>
                <Switch
                  checked={settings.darkMode}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, darkMode: e.target.checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <span className="text-sm font-medium">Auto Save</span>
                  <p className="text-muted text-xs">Save changes automatically</p>
                </div>
                <Switch
                  checked={settings.autoSave}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, autoSave: e.target.checked }))
                  }
                />
              </div>
              <div className="border-border flex items-center justify-between border-t bg-transparent px-4 py-2">
                <span className="text-muted text-xs">
                  {enabledCount} of 4 enabled
                </span>
                <Badge
                  variant={enabledCount >= 3 ? "success" : "default"}
                  className="text-[10px]"
                >
                  {enabledCount >= 3
                    ? "Mostly on"
                    : enabledCount > 0
                      ? "Partial"
                      : "All off"}
                </Badge>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Settings Panel (Shiny)</h3>
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 divide-slate-700 max-w-sm divide-y overflow-hidden rounded-xl">
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <span className="text-sm font-medium text-white">Airplane Mode</span>
                  <p className="text-slate-400 text-xs">Disable all wireless connections</p>
                </div>
                <Switch variant="shiny" defaultChecked />
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <span className="text-sm font-medium text-white">Wi-Fi</span>
                  <p className="text-slate-400 text-xs">Connect to wireless networks</p>
                </div>
                <Switch variant="shiny" />
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <span className="text-sm font-medium text-white">Bluetooth</span>
                  <p className="text-slate-400 text-xs">Enable Bluetooth connectivity</p>
                </div>
                <Switch variant="shiny" defaultChecked />
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Settings Panel (Neon)</h3>
            <div className="bg-slate-950 border border-cyan-500/20 max-w-sm overflow-hidden rounded-xl">
              <div className="px-4 py-2 border-b border-cyan-500/20">
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">System</span>
              </div>
              <div className="divide-y divide-cyan-500/10">
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <span className="text-sm font-medium text-white">Night Vision</span>
                    <p className="text-slate-500 text-xs">Enhanced low-light display</p>
                  </div>
                  <Switch variant="neon" defaultChecked />
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <span className="text-sm font-medium text-white">HUD Overlay</span>
                    <p className="text-slate-500 text-xs">Heads-up display elements</p>
                  </div>
                  <Switch variant="neon" />
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <span className="text-sm font-medium text-white">Stealth Mode</span>
                    <p className="text-slate-500 text-xs">Disable all tracking</p>
                  </div>
                  <Switch variant="neon" defaultChecked />
                </div>
              </div>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
