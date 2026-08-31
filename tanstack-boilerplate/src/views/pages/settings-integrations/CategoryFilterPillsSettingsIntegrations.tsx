"use client";

import { useState } from "react";
import {
  IconBrandAsana,
  IconBrandDiscord,
  IconBrandGithub,
  IconBrandJira,
  IconBrandNotion,
  IconBrandSlack,
  IconBrandZapier,
  IconWebhook,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSettingsIntegrationsMessages } from "@/types/pages/settings-integrations/SettingsIntegrationsMessages-types";

type CategoryId = "communication" | "productivity" | "developer" | "automation";

const FILTERS: { id: CategoryId | "all"; labelKey: string }[] = [
  { id: "all", labelKey: "settingsIntegrations4FilterAllLabel" },
  { id: "communication", labelKey: "settingsIntegrations4FilterCommunicationLabel" },
  { id: "productivity", labelKey: "settingsIntegrations4FilterProductivityLabel" },
  { id: "developer", labelKey: "settingsIntegrations4FilterDeveloperLabel" },
  { id: "automation", labelKey: "settingsIntegrations4FilterAutomationLabel" },
];

interface AppEntry {
  id: string;
  icon: Icon;
  nameKey: string;
  descKey: string;
  category: CategoryId;
  connected: boolean;
}

const APPS: AppEntry[] = [
  {
    id: "slack",
    icon: IconBrandSlack,
    nameKey: "settingsIntegrations4App1Name",
    descKey: "settingsIntegrations4App1Desc",
    category: "communication",
    connected: true,
  },
  {
    id: "discord",
    icon: IconBrandDiscord,
    nameKey: "settingsIntegrations4App2Name",
    descKey: "settingsIntegrations4App2Desc",
    category: "communication",
    connected: false,
  },
  {
    id: "notion",
    icon: IconBrandNotion,
    nameKey: "settingsIntegrations4App3Name",
    descKey: "settingsIntegrations4App3Desc",
    category: "productivity",
    connected: true,
  },
  {
    id: "asana",
    icon: IconBrandAsana,
    nameKey: "settingsIntegrations4App4Name",
    descKey: "settingsIntegrations4App4Desc",
    category: "productivity",
    connected: false,
  },
  {
    id: "github",
    icon: IconBrandGithub,
    nameKey: "settingsIntegrations4App5Name",
    descKey: "settingsIntegrations4App5Desc",
    category: "developer",
    connected: true,
  },
  {
    id: "jira",
    icon: IconBrandJira,
    nameKey: "settingsIntegrations4App6Name",
    descKey: "settingsIntegrations4App6Desc",
    category: "developer",
    connected: false,
  },
  {
    id: "zapier",
    icon: IconBrandZapier,
    nameKey: "settingsIntegrations4App7Name",
    descKey: "settingsIntegrations4App7Desc",
    category: "automation",
    connected: false,
  },
  {
    id: "webhook",
    icon: IconWebhook,
    nameKey: "settingsIntegrations4App8Name",
    descKey: "settingsIntegrations4App8Desc",
    category: "automation",
    connected: true,
  },
];

export function CategoryFilterPillsSettingsIntegrations() {
  const t = useMessages(
    "pages",
  ) as unknown as PagesWithSettingsIntegrationsMessages;
  const si = t.settingsIntegrations;

  const [active, setActive] = useState<CategoryId | "all">("all");

  const filtered = APPS.filter((app) => active === "all" || app.category === active);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 lg:px-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-fg text-2xl font-semibold tracking-tight lg:text-3xl">
            {si.settingsIntegrations4Heading}
          </h2>
          <p className="text-muted max-w-xl text-sm">
            {si.settingsIntegrations4Subheading}
          </p>
        </div>

        <div
          role="group"
          aria-label={si.settingsIntegrations4FilterGroupAria}
          className="flex flex-wrap gap-2"
        >
          {FILTERS.map((filter) => {
            const isActive = active === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActive(filter.id)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand text-brand-fg"
                    : "bg-surface text-muted hover:text-fg border-border border",
                )}
              >
                {si[filter.labelKey]}
              </button>
            );
          })}
        </div>

        <span className="text-muted text-xs">
          {si.settingsIntegrations4ResultsCountTemplate.replace(
            "{count}",
            String(filtered.length),
          )}
        </span>

        {filtered.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {filtered.map((app) => (
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
                {app.connected ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="soft">
                      {si.settingsIntegrations4ConnectedBadgeLabel}
                    </Badge>
                    <Button variant="outline" size="sm">
                      {si.settingsIntegrations4ManageButtonLabel}
                    </Button>
                  </div>
                ) : (
                  <Button variant="primary" size="sm" className="shrink-0">
                    {si.settingsIntegrations4ConnectButtonLabel}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted border-border rounded-xl border border-dashed px-4 py-10 text-center text-sm">
            {si.settingsIntegrations4EmptyStateLabel}
          </p>
        )}
      </div>
    </section>
  );
}
