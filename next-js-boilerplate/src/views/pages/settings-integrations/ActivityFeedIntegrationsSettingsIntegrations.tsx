"use client";

import { useState } from "react";
import {
  IconBrandGithub,
  IconBrandGoogleDrive,
  IconBrandSlack,
  IconBrandStripe,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSettingsIntegrationsMessages } from "@/types/pages/settings-integrations/SettingsIntegrationsMessages-types";

interface AppEntry {
  id: string;
  icon: Icon;
  nameKey: string;
}

const CONNECTED_APPS: AppEntry[] = [
  {
    id: "github",
    icon: IconBrandGithub,
    nameKey: "settingsIntegrations6App1Name",
  },
  {
    id: "slack",
    icon: IconBrandSlack,
    nameKey: "settingsIntegrations6App2Name",
  },
  {
    id: "stripe",
    icon: IconBrandStripe,
    nameKey: "settingsIntegrations6App3Name",
  },
  {
    id: "drive",
    icon: IconBrandGoogleDrive,
    nameKey: "settingsIntegrations6App4Name",
  },
];

interface ActivityItem {
  id: string;
  appId: string;
  textKey: string;
  timeKey: string;
}

const ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    appId: "github",
    textKey: "settingsIntegrations6Activity1Text",
    timeKey: "settingsIntegrations6Activity1Time",
  },
  {
    id: "a2",
    appId: "stripe",
    textKey: "settingsIntegrations6Activity2Text",
    timeKey: "settingsIntegrations6Activity2Time",
  },
  {
    id: "a3",
    appId: "slack",
    textKey: "settingsIntegrations6Activity3Text",
    timeKey: "settingsIntegrations6Activity3Time",
  },
  {
    id: "a4",
    appId: "drive",
    textKey: "settingsIntegrations6Activity4Text",
    timeKey: "settingsIntegrations6Activity4Time",
  },
  {
    id: "a5",
    appId: "github",
    textKey: "settingsIntegrations6Activity5Text",
    timeKey: "settingsIntegrations6Activity5Time",
  },
  {
    id: "a6",
    appId: "slack",
    textKey: "settingsIntegrations6Activity6Text",
    timeKey: "settingsIntegrations6Activity6Time",
  },
];

const COLLAPSED_COUNT = 4;

export function ActivityFeedIntegrationsSettingsIntegrations() {
  const t = useMessages(
    "pages",
  ) as unknown as PagesWithSettingsIntegrationsMessages;
  const si = t.settingsIntegrations;

  const [expanded, setExpanded] = useState(false);
  const visibleActivity = expanded
    ? ACTIVITY
    : ACTIVITY.slice(0, COLLAPSED_COUNT);

  function findApp(appId: string) {
    return CONNECTED_APPS.find((app) => app.id === appId) ?? CONNECTED_APPS[0];
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-fg text-2xl font-semibold tracking-tight lg:text-3xl">
            {si.settingsIntegrations6Heading}
          </h2>
          <p className="text-muted max-w-xl text-sm">
            {si.settingsIntegrations6Subheading}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-fg text-sm font-semibold">
            {si.settingsIntegrations6ConnectedSectionLabel}
          </span>
          <div className="flex flex-wrap gap-3">
            {CONNECTED_APPS.map((app) => (
              <div
                key={app.id}
                className="border-border bg-surface flex items-center gap-2 rounded-full border py-1.5 pr-4 pl-2"
              >
                <div className="bg-surface-hover text-fg flex size-7 shrink-0 items-center justify-center rounded-full">
                  <app.icon size={14} aria-hidden="true" />
                </div>
                <span className="text-fg text-sm font-medium">
                  {si[app.nameKey]}
                </span>
                <Badge variant="soft" size="sm">
                  {si.settingsIntegrations6StatusActiveLabel}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-fg text-sm font-semibold">
            {si.settingsIntegrations6ActivitySectionLabel}
          </span>
          <ol className="border-border flex flex-col gap-4 border-l pl-5">
            {visibleActivity.map((item) => {
              const app = findApp(item.appId);
              return (
                <li key={item.id} className="relative flex flex-col gap-1">
                  <span className="bg-brand absolute top-1.5 -left-[26px] size-2 rounded-full" />
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-muted flex items-center gap-1.5">
                      <app.icon size={14} aria-hidden="true" />
                      <span className="text-fg text-xs font-semibold">
                        {si[app.nameKey]}
                      </span>
                    </div>
                    <span className="text-muted text-xs">
                      {si[item.timeKey]}
                    </span>
                  </div>
                  <p className="text-fg text-sm">{si[item.textKey]}</p>
                </li>
              );
            })}
          </ol>
          {ACTIVITY.length > COLLAPSED_COUNT && (
            <Button
              variant="ghost"
              size="sm"
              className="w-fit"
              onClick={() => setExpanded((prev) => !prev)}
            >
              {expanded
                ? si.settingsIntegrations6ShowLessLabel
                : si.settingsIntegrations6ShowMoreLabel}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
