"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/Switch";
import { Badge } from "@/components/ui/Badge";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

function ExamplesTab() {
  const [settings, setSettings] = useState({
    notifications: true,
    sound: true,
    darkMode: false,
    autoSave: false,
  });

  const enabledCount = Object.values(settings).filter(Boolean).length;

  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Settings Panel</h3>
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
  );
}

const examples: UIExample[] = [
  {
    id: "components",
    title: "Settings Rows",
    description: "Labelled switch rows with htmlFor-linked labels.",
    render: () => (
      <>
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
      </>
    ),
  },
  {
    id: "examples",
    title: "Feature Flag",
    description: "Switch with live status text and description.",
    render: () => <ExamplesTab />,
  },
];

export default function SwitchPage() {
  return (
    <ExampleTabs
      title="Switch"
      intro="A toggle switch for binary settings with multiple stylish variants."
      examples={examples}
    />
  );
}
