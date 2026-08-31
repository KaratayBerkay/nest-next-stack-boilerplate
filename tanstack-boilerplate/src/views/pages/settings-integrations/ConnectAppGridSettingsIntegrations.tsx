"use client";

import { useState } from "react";
import {
  IconBrandFigma,
  IconBrandGithub,
  IconBrandGoogleDrive,
  IconBrandNotion,
  IconBrandSlack,
  IconBrandZapier,
  IconSearch,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSettingsIntegrationsMessages } from "@/types/pages/settings-integrations/SettingsIntegrationsMessages-types";

interface AppEntry {
  id: string;
  icon: Icon;
  nameKey: string;
  descKey: string;
  categoryKey: string;
  defaultConnected: boolean;
}

const APPS: AppEntry[] = [
  {
    id: "github",
    icon: IconBrandGithub,
    nameKey: "settingsIntegrations1App1Name",
    descKey: "settingsIntegrations1App1Desc",
    categoryKey: "settingsIntegrations1App1Category",
    defaultConnected: true,
  },
  {
    id: "slack",
    icon: IconBrandSlack,
    nameKey: "settingsIntegrations1App2Name",
    descKey: "settingsIntegrations1App2Desc",
    categoryKey: "settingsIntegrations1App2Category",
    defaultConnected: true,
  },
  {
    id: "google-drive",
    icon: IconBrandGoogleDrive,
    nameKey: "settingsIntegrations1App3Name",
    descKey: "settingsIntegrations1App3Desc",
    categoryKey: "settingsIntegrations1App3Category",
    defaultConnected: false,
  },
  {
    id: "notion",
    icon: IconBrandNotion,
    nameKey: "settingsIntegrations1App4Name",
    descKey: "settingsIntegrations1App4Desc",
    categoryKey: "settingsIntegrations1App4Category",
    defaultConnected: true,
  },
  {
    id: "figma",
    icon: IconBrandFigma,
    nameKey: "settingsIntegrations1App5Name",
    descKey: "settingsIntegrations1App5Desc",
    categoryKey: "settingsIntegrations1App5Category",
    defaultConnected: false,
  },
  {
    id: "zapier",
    icon: IconBrandZapier,
    nameKey: "settingsIntegrations1App6Name",
    descKey: "settingsIntegrations1App6Desc",
    categoryKey: "settingsIntegrations1App6Category",
    defaultConnected: false,
  },
];

export function ConnectAppGridSettingsIntegrations() {
  const t = useMessages(
    "pages",
  ) as unknown as PagesWithSettingsIntegrationsMessages;
  const si = t.settingsIntegrations;

  const [connected, setConnected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(APPS.map((app) => [app.id, app.defaultConnected])),
  );
  const [query, setQuery] = useState("");

  const filtered = APPS.filter((app) =>
    si[app.nameKey].toLowerCase().includes(query.trim().toLowerCase()),
  );
  const connectedCount = Object.values(connected).filter(Boolean).length;

  function toggle(id: string) {
    setConnected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <span className="text-brand text-xs font-semibold tracking-wide uppercase">
            {si.settingsIntegrations1Eyebrow}
          </span>
          <h2 className="text-fg text-2xl font-semibold tracking-tight lg:text-3xl">
            {si.settingsIntegrations1Heading}
          </h2>
          <p className="text-muted max-w-xl text-sm">
            {si.settingsIntegrations1Subheading}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={si.settingsIntegrations1SearchPlaceholder}
            aria-label={si.settingsIntegrations1SearchAria}
            leftIcon={<IconSearch size={15} aria-hidden="true" />}
            className="sm:max-w-64"
          />
          <span className="text-muted text-xs">
            {si.settingsIntegrations1CountTemplate
              .replace("{count}", String(connectedCount))
              .replace("{total}", String(APPS.length))}
          </span>
        </div>

        {filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((app) => {
              const isOn = connected[app.id];
              return (
                <Card key={app.id} variant="outline">
                  <CardContent className="flex flex-col gap-4 pt-5 @sm:pt-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="bg-surface-hover text-fg flex size-10 shrink-0 items-center justify-center rounded-lg">
                        <app.icon size={20} aria-hidden="true" />
                      </div>
                      <Switch
                        checked={isOn}
                        onChange={() => toggle(app.id)}
                        aria-label={si.settingsIntegrations1ToggleAriaTemplate.replace(
                          "{name}",
                          si[app.nameKey],
                        )}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-fg text-sm font-semibold">
                        {si[app.nameKey]}
                      </span>
                      <span className="text-muted text-xs">{si[app.descKey]}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted text-xs">{si[app.categoryKey]}</span>
                      <span
                        className={
                          isOn
                            ? "text-success text-xs font-medium"
                            : "text-muted text-xs font-medium"
                        }
                      >
                        {isOn
                          ? si.settingsIntegrations1ConnectedLabel
                          : si.settingsIntegrations1DisconnectedLabel}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="border-border flex flex-col items-center gap-1 rounded-2xl border border-dashed py-16 text-center">
            <span className="text-fg text-sm font-medium">
              {si.settingsIntegrations1EmptyTitle}
            </span>
            <span className="text-muted text-xs">
              {si.settingsIntegrations1EmptyDesc}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
