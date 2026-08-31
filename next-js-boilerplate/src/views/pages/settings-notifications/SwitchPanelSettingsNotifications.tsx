"use client";

import { useState } from "react";
import {
  IconAt,
  IconMail,
  IconRocket,
  IconSpeakerphone,
  IconUserPlus,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Switch } from "@/components/ui/Switch";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSettingsNotificationsMessages } from "@/types/pages/settings-notifications/SettingsNotificationsMessages-types";

type CategoryBadgeVariant = "info" | "success" | "soft" | "outline";

interface ChannelRow {
  id: string;
  icon: Icon;
  labelKey: string;
  descKey: string;
  categoryKey: string;
  badgeVariant: CategoryBadgeVariant;
  defaultChecked: boolean;
}

const ROWS: ChannelRow[] = [
  {
    id: "dm",
    icon: IconMail,
    labelKey: "settingsNotifications2Item1Label",
    descKey: "settingsNotifications2Item1Desc",
    categoryKey: "settingsNotifications2CategoryAccount",
    badgeVariant: "info",
    defaultChecked: true,
  },
  {
    id: "mentions",
    icon: IconAt,
    labelKey: "settingsNotifications2Item2Label",
    descKey: "settingsNotifications2Item2Desc",
    categoryKey: "settingsNotifications2CategoryAccount",
    badgeVariant: "info",
    defaultChecked: true,
  },
  {
    id: "followers",
    icon: IconUserPlus,
    labelKey: "settingsNotifications2Item3Label",
    descKey: "settingsNotifications2Item3Desc",
    categoryKey: "settingsNotifications2CategorySocial",
    badgeVariant: "success",
    defaultChecked: false,
  },
  {
    id: "product",
    icon: IconRocket,
    labelKey: "settingsNotifications2Item4Label",
    descKey: "settingsNotifications2Item4Desc",
    categoryKey: "settingsNotifications2CategoryProduct",
    badgeVariant: "soft",
    defaultChecked: true,
  },
  {
    id: "marketing",
    icon: IconSpeakerphone,
    labelKey: "settingsNotifications2Item5Label",
    descKey: "settingsNotifications2Item5Desc",
    categoryKey: "settingsNotifications2CategoryMarketing",
    badgeVariant: "outline",
    defaultChecked: false,
  },
];

const INITIAL_STATE: Record<string, boolean> = Object.fromEntries(
  ROWS.map((row) => [row.id, row.defaultChecked]),
);

export function SwitchPanelSettingsNotifications() {
  const t = useMessages(
    "pages",
  ) as unknown as PagesWithSettingsNotificationsMessages;
  const sn = t.settingsNotifications;

  const [values, setValues] = useState<Record<string, boolean>>(INITIAL_STATE);
  const allOn = ROWS.every((row) => values[row.id]);

  function toggleAll() {
    const next = !allOn;
    setValues(Object.fromEntries(ROWS.map((row) => [row.id, next])));
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-2xl px-6 lg:px-8">
        <div className="border-border bg-surface rounded-xl border">
          <div className="border-border flex items-center justify-between gap-4 border-b p-6">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-fg text-base font-semibold">
                {sn.settingsNotifications2Heading}
              </h3>
              <p className="text-muted text-sm">
                {sn.settingsNotifications2Subheading}
              </p>
            </div>
            <Switch
              checked={allOn}
              onChange={toggleAll}
              aria-label={sn.settingsNotifications2AllAria}
            />
          </div>
          <div className="flex flex-col">
            {ROWS.map((row) => (
              <div
                key={row.id}
                className="border-border flex items-center justify-between gap-4 border-b px-6 py-4 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <row.icon
                    size={18}
                    className="text-muted shrink-0"
                    aria-hidden="true"
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-fg text-sm font-medium">
                      {sn[row.labelKey]}
                    </span>
                    <span className="text-muted text-xs">
                      {sn[row.descKey]}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline-flex">
                    <Badge variant={row.badgeVariant} size="sm">
                      {sn[row.categoryKey]}
                    </Badge>
                  </span>
                  <Switch
                    checked={values[row.id]}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        [row.id]: e.target.checked,
                      }))
                    }
                    switchSize="sm"
                    aria-label={sn[row.labelKey]}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
