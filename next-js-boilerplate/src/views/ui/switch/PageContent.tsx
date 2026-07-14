"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/Switch";
import type { SwitchVariant, SwitchSize } from "@/types/ui/Switch-types";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

function SettingsPanel() {
  const [settings, setSettings] = useState({
    notifications: true,
    sound: true,
    darkMode: false,
    autoSave: false,
  });

  const enabledCount = Object.values(settings).filter(Boolean).length;

  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Quick Settings</h3>
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

function ToggleExamplesTab() {
  return (
    <div className="flex flex-col gap-8">
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

      <SettingsPanel />
    </div>
  );
}

function NotificationSettingsTab() {
  const [prefs, setPrefs] = useState({
    push: true,
    emailDigest: false,
    sms: true,
    marketing: false,
  });

  return (
    <div className="max-w-md space-y-6">
      <div className="surface divide-border divide-y overflow-hidden rounded-lg">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="space-y-0.5">
            <Label htmlFor="push">Push Notifications</Label>
            <p className="text-muted text-xs">Get instant alerts for important updates and mentions</p>
          </div>
          <Switch
            id="push"
            checked={prefs.push}
            onChange={(e) =>
              setPrefs((s) => ({ ...s, push: e.target.checked }))
            }
          />
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <div className="space-y-0.5">
            <Label htmlFor="emailDigest">Email Digest</Label>
            <p className="text-muted text-xs">Receive a weekly summary of your activity and top stories</p>
          </div>
          <Switch
            id="emailDigest"
            checked={prefs.emailDigest}
            onChange={(e) =>
              setPrefs((s) => ({ ...s, emailDigest: e.target.checked }))
            }
          />
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <div className="space-y-0.5">
            <Label htmlFor="sms">SMS Alerts</Label>
            <p className="text-muted text-xs">Get text messages for critical system alerts and outages</p>
          </div>
          <Switch
            id="sms"
            checked={prefs.sms}
            onChange={(e) =>
              setPrefs((s) => ({ ...s, sms: e.target.checked }))
            }
          />
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <div className="space-y-0.5">
            <Label htmlFor="marketing">Marketing Emails</Label>
            <p className="text-muted text-xs">Stay informed about new features, tips, and promotions</p>
          </div>
          <Switch
            id="marketing"
            checked={prefs.marketing}
            onChange={(e) =>
              setPrefs((s) => ({ ...s, marketing: e.target.checked }))
            }
          />
        </div>
      </div>
      <Separator />
      <div className="flex justify-end">
        <Button>Save Preferences</Button>
      </div>
    </div>
  );
}

function VariantGalleryTab() {
  return (
    <VariantGallery
      variants={["default", "shiny", "glass", "neon", "gradient"]}
      sizes={["sm", "md", "lg"]}
      render={(variant, size) => (
        <Switch variant={variant as SwitchVariant} switchSize={size as SwitchSize} defaultChecked />
      )}
    />
  );
}

const examples: UIExample[] = [
  {
    id: "toggle-examples",
    title: "Toggle Examples",
    description: "Basic switch examples across states and a quick-settings panel demo.",
    render: () => <ToggleExamplesTab />,
  },
  {
    id: "notification-settings",
    title: "Notification Settings",
    description: "A grouped notification-preferences panel with individual toggle controls.",
    render: () => <NotificationSettingsTab />,
  },
  {
    id: "variant-gallery",
    title: "Variant Gallery",
    description: "All switch variants and sizes in a side-by-side comparison table.",
    render: () => <VariantGalleryTab />,
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
