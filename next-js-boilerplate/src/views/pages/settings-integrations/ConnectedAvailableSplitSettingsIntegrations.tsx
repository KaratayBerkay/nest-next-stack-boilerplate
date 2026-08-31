"use client";

import { useState } from "react";
import {
  IconBrandAsana,
  IconBrandDiscord,
  IconBrandDropbox,
  IconBrandStripe,
  IconBrandTrello,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSettingsIntegrationsMessages } from "@/types/pages/settings-integrations/SettingsIntegrationsMessages-types";

interface AppEntry {
  id: string;
  icon: Icon;
  nameKey: string;
  descKey: string;
  syncedKey: string;
}

const APPS: AppEntry[] = [
  {
    id: "stripe",
    icon: IconBrandStripe,
    nameKey: "settingsIntegrations2App1Name",
    descKey: "settingsIntegrations2App1Desc",
    syncedKey: "settingsIntegrations2App1Synced",
  },
  {
    id: "trello",
    icon: IconBrandTrello,
    nameKey: "settingsIntegrations2App2Name",
    descKey: "settingsIntegrations2App2Desc",
    syncedKey: "settingsIntegrations2App2Synced",
  },
  {
    id: "discord",
    icon: IconBrandDiscord,
    nameKey: "settingsIntegrations2App3Name",
    descKey: "settingsIntegrations2App3Desc",
    syncedKey: "settingsIntegrations2App3Synced",
  },
  {
    id: "dropbox",
    icon: IconBrandDropbox,
    nameKey: "settingsIntegrations2App4Name",
    descKey: "settingsIntegrations2App4Desc",
    syncedKey: "settingsIntegrations2App4Synced",
  },
  {
    id: "asana",
    icon: IconBrandAsana,
    nameKey: "settingsIntegrations2App5Name",
    descKey: "settingsIntegrations2App5Desc",
    syncedKey: "settingsIntegrations2App5Synced",
  },
];

const INITIAL_CONNECTED = ["stripe", "trello"];

export function ConnectedAvailableSplitSettingsIntegrations() {
  const t = useMessages(
    "pages",
  ) as unknown as PagesWithSettingsIntegrationsMessages;
  const si = t.settingsIntegrations;

  const [connectedIds, setConnectedIds] = useState<string[]>(INITIAL_CONNECTED);

  const connectedApps = APPS.filter((app) => connectedIds.includes(app.id));
  const availableApps = APPS.filter((app) => !connectedIds.includes(app.id));

  function connect(id: string) {
    setConnectedIds((prev) => [...prev, id]);
  }

  function disconnect(id: string) {
    setConnectedIds((prev) => prev.filter((entry) => entry !== id));
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-4xl flex-col gap-10 px-6 lg:px-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-fg text-2xl font-semibold tracking-tight lg:text-3xl">
            {si.settingsIntegrations2Heading}
          </h2>
          <p className="text-muted max-w-xl text-sm">
            {si.settingsIntegrations2Subheading}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-fg text-sm font-semibold">
            {si.settingsIntegrations2ConnectedHeading}
          </h3>
          <p className="text-muted text-xs">
            {si.settingsIntegrations2ConnectedSubheading}
          </p>
          {connectedApps.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {connectedApps.map((app) => (
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
                        {si.settingsIntegrations2LastSyncedTemplate.replace(
                          "{time}",
                          si[app.syncedKey],
                        )}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => disconnect(app.id)}
                    aria-label={`${si.settingsIntegrations2DisconnectAriaPrefix} ${si[app.nameKey]}`}
                  >
                    {si.settingsIntegrations2DisconnectButtonLabel}
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted border-border rounded-xl border border-dashed px-4 py-6 text-center text-xs">
              {si.settingsIntegrations2EmptyConnected}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-fg text-sm font-semibold">
            {si.settingsIntegrations2AvailableHeading}
          </h3>
          <p className="text-muted text-xs">
            {si.settingsIntegrations2AvailableSubheading}
          </p>
          {availableApps.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {availableApps.map((app) => (
                <li
                  key={app.id}
                  className="border-border flex items-center justify-between gap-4 rounded-xl border border-dashed p-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="bg-surface-hover text-muted flex size-9 shrink-0 items-center justify-center rounded-lg">
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
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => connect(app.id)}
                    aria-label={`${si.settingsIntegrations2ConnectAriaPrefix} ${si[app.nameKey]}`}
                  >
                    {si.settingsIntegrations2ConnectButtonLabel}
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted border-border rounded-xl border border-dashed px-4 py-6 text-center text-xs">
              {si.settingsIntegrations2EmptyAvailable}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
