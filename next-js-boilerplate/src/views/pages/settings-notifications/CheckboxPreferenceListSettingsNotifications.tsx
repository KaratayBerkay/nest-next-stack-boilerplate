"use client";

import { useState } from "react";
import {
  IconAt,
  IconChartBar,
  IconCheck,
  IconMessageCircle,
  IconReceipt2,
  IconRocket,
  IconShieldCheck,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSettingsNotificationsMessages } from "@/types/pages/settings-notifications/SettingsNotificationsMessages-types";

interface PrefRow {
  id: string;
  icon: Icon;
  labelKey: string;
  descKey: string;
  defaultChecked: boolean;
}

const ROWS: PrefRow[] = [
  {
    id: "product",
    icon: IconRocket,
    labelKey: "settingsNotifications1Item1Label",
    descKey: "settingsNotifications1Item1Desc",
    defaultChecked: true,
  },
  {
    id: "summary",
    icon: IconChartBar,
    labelKey: "settingsNotifications1Item2Label",
    descKey: "settingsNotifications1Item2Desc",
    defaultChecked: true,
  },
  {
    id: "comments",
    icon: IconMessageCircle,
    labelKey: "settingsNotifications1Item3Label",
    descKey: "settingsNotifications1Item3Desc",
    defaultChecked: false,
  },
  {
    id: "mentions",
    icon: IconAt,
    labelKey: "settingsNotifications1Item4Label",
    descKey: "settingsNotifications1Item4Desc",
    defaultChecked: true,
  },
  {
    id: "billing",
    icon: IconReceipt2,
    labelKey: "settingsNotifications1Item5Label",
    descKey: "settingsNotifications1Item5Desc",
    defaultChecked: true,
  },
  {
    id: "security",
    icon: IconShieldCheck,
    labelKey: "settingsNotifications1Item6Label",
    descKey: "settingsNotifications1Item6Desc",
    defaultChecked: true,
  },
];

const INITIAL_STATE: Record<string, boolean> = Object.fromEntries(
  ROWS.map((row) => [row.id, row.defaultChecked]),
);

export function CheckboxPreferenceListSettingsNotifications() {
  const t = useMessages(
    "pages",
  ) as unknown as PagesWithSettingsNotificationsMessages;
  const sn = t.settingsNotifications;

  const [baseline, setBaseline] =
    useState<Record<string, boolean>>(INITIAL_STATE);
  const [values, setValues] = useState<Record<string, boolean>>(INITIAL_STATE);
  const [justSaved, setJustSaved] = useState(false);

  const isDirty = ROWS.some((row) => values[row.id] !== baseline[row.id]);
  const enabledCount = ROWS.filter((row) => values[row.id]).length;

  function handleSave() {
    setBaseline(values);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-2xl px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>{sn.settingsNotifications1Heading}</CardTitle>
            <CardDescription>
              {sn.settingsNotifications1Subheading}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col">
            {ROWS.map((row) => (
              <div
                key={row.id}
                className="border-border flex items-start justify-between gap-4 border-b py-3 last:border-0"
              >
                <div className="flex items-start gap-3">
                  <row.icon
                    size={18}
                    className="text-muted mt-0.5 shrink-0"
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
                <Checkbox
                  checked={values[row.id]}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      [row.id]: e.target.checked,
                    }))
                  }
                  aria-label={sn[row.labelKey]}
                  className="mt-0.5"
                />
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-center justify-between gap-3">
              <Badge variant="soft" size="sm">
                {sn.settingsNotifications1CountLabel
                  .replace("{count}", String(enabledCount))
                  .replace("{total}", String(ROWS.length))}
              </Badge>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!isDirty}
                  onClick={() => setValues(baseline)}
                >
                  {sn.settingsNotifications1ResetLabel}
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={!isDirty}
                  onClick={handleSave}
                  leftIcon={
                    justSaved ? (
                      <IconCheck size={14} aria-hidden="true" />
                    ) : undefined
                  }
                >
                  {justSaved
                    ? sn.settingsNotifications1SavedLabel
                    : sn.settingsNotifications1SaveLabel}
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
