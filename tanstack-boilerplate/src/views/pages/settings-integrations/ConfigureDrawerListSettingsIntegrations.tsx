"use client";

import { useState } from "react";
import {
  IconBrandGithub,
  IconBrandNotion,
  IconBrandSlack,
  IconBrandStripe,
  IconBrandZapier,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/Drawer";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSettingsIntegrationsMessages } from "@/types/pages/settings-integrations/SettingsIntegrationsMessages-types";

interface AppEntry {
  id: string;
  icon: Icon;
  nameKey: string;
  descKey: string;
  defaultConnected: boolean;
}

const APPS: AppEntry[] = [
  {
    id: "github",
    icon: IconBrandGithub,
    nameKey: "settingsIntegrations5App1Name",
    descKey: "settingsIntegrations5App1Desc",
    defaultConnected: true,
  },
  {
    id: "slack",
    icon: IconBrandSlack,
    nameKey: "settingsIntegrations5App2Name",
    descKey: "settingsIntegrations5App2Desc",
    defaultConnected: true,
  },
  {
    id: "stripe",
    icon: IconBrandStripe,
    nameKey: "settingsIntegrations5App3Name",
    descKey: "settingsIntegrations5App3Desc",
    defaultConnected: false,
  },
  {
    id: "notion",
    icon: IconBrandNotion,
    nameKey: "settingsIntegrations5App4Name",
    descKey: "settingsIntegrations5App4Desc",
    defaultConnected: true,
  },
  {
    id: "zapier",
    icon: IconBrandZapier,
    nameKey: "settingsIntegrations5App5Name",
    descKey: "settingsIntegrations5App5Desc",
    defaultConnected: false,
  },
];

interface AppConfig {
  connected: boolean;
  webhook: string;
  notify: boolean;
  autoSync: boolean;
}

function defaultConfig(app: AppEntry): AppConfig {
  return {
    connected: app.defaultConnected,
    webhook: "",
    notify: true,
    autoSync: app.defaultConnected,
  };
}

export function ConfigureDrawerListSettingsIntegrations() {
  const t = useMessages(
    "pages",
  ) as unknown as PagesWithSettingsIntegrationsMessages;
  const si = t.settingsIntegrations;

  const [configs, setConfigs] = useState<Record<string, AppConfig>>(() =>
    Object.fromEntries(APPS.map((app) => [app.id, defaultConfig(app)])),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedApp = APPS.find((app) => app.id === selectedId) ?? null;
  const selectedConfig = selectedId ? configs[selectedId] : null;

  function updateSelected(patch: Partial<AppConfig>) {
    if (!selectedId) return;
    setConfigs((prev) => ({
      ...prev,
      [selectedId]: { ...prev[selectedId], ...patch },
    }));
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 lg:px-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-fg text-2xl font-semibold tracking-tight lg:text-3xl">
            {si.settingsIntegrations5Heading}
          </h2>
          <p className="text-muted max-w-xl text-sm">
            {si.settingsIntegrations5Subheading}
          </p>
        </div>

        <ul aria-label={si.settingsIntegrations5ListAria} className="flex flex-col gap-2">
          {APPS.map((app) => {
            const config = configs[app.id];
            return (
              <li
                key={app.id}
                className="border-border bg-surface flex items-center justify-between gap-4 rounded-xl border p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="bg-surface-hover text-fg flex size-9 shrink-0 items-center justify-center rounded-lg">
                    <app.icon size={18} aria-hidden="true" />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="text-fg truncate text-sm font-medium">
                      {si[app.nameKey]}
                    </span>
                    <span className="text-muted truncate text-xs">
                      {si[app.descKey]}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={config.connected ? "success" : "outline"}>
                    {config.connected
                      ? si.settingsIntegrations5StatusConnectedLabel
                      : si.settingsIntegrations5StatusNotConnectedLabel}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedId(app.id)}
                    aria-label={si.settingsIntegrations5ConfigureButtonAriaTemplate.replace(
                      "{name}",
                      si[app.nameKey],
                    )}
                  >
                    {si.settingsIntegrations5ConfigureButtonLabel}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <Drawer
        open={selectedId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      >
        <DrawerContent>
          {selectedApp && selectedConfig && (
            <>
              <DrawerHeader>
                <DrawerTitle>
                  {si.settingsIntegrations5DrawerTitleTemplate.replace(
                    "{name}",
                    si[selectedApp.nameKey],
                  )}
                </DrawerTitle>
                <DrawerDescription>
                  {si.settingsIntegrations5DrawerDescription}
                </DrawerDescription>
              </DrawerHeader>

              <div className="flex flex-col gap-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-fg text-sm font-medium">
                    {si.settingsIntegrations5DrawerConnectionLabel}
                  </span>
                  <Switch
                    checked={selectedConfig.connected}
                    onChange={(event) =>
                      updateSelected({ connected: event.target.checked })
                    }
                    aria-label={si.settingsIntegrations5DrawerConnectSwitchLabel}
                  />
                </div>

                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="text-fg font-medium">
                    {si.settingsIntegrations5DrawerWebhookLabel}
                  </span>
                  <Input
                    value={selectedConfig.webhook}
                    onChange={(event) => updateSelected({ webhook: event.target.value })}
                    placeholder={si.settingsIntegrations5DrawerWebhookPlaceholder}
                  />
                </label>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-fg text-sm">
                    {si.settingsIntegrations5DrawerNotifyLabel}
                  </span>
                  <Switch
                    checked={selectedConfig.notify}
                    onChange={(event) => updateSelected({ notify: event.target.checked })}
                    aria-label={si.settingsIntegrations5DrawerNotifyLabel}
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-fg text-sm">
                    {si.settingsIntegrations5DrawerSyncLabel}
                  </span>
                  <Switch
                    checked={selectedConfig.autoSync}
                    onChange={(event) => updateSelected({ autoSync: event.target.checked })}
                    aria-label={si.settingsIntegrations5DrawerSyncLabel}
                  />
                </div>
              </div>

              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="primary">
                    {si.settingsIntegrations5DrawerSaveButtonLabel}
                  </Button>
                </DrawerClose>
                <DrawerClose asChild>
                  <Button variant="ghost">
                    {si.settingsIntegrations5DrawerCancelButtonLabel}
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </section>
  );
}
