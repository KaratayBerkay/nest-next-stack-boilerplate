"use client";

import {
  IconAlarm,
  IconCloudCheck,
  IconScale,
  IconServerBolt,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { BadgeVariant } from "@/types/ui/Badge-types";
import type { PagesWithStatsCardMessages } from "@/types/pages/stats-card/StatsCardMessages-types";

type Tone = "success" | "warning" | "info" | "error";

interface AccentCard {
  id: string;
  icon: Icon;
  tone: Tone;
  badgeVariant: BadgeVariant;
  labelKey: string;
  valueKey: string;
  deltaKey: string;
  statusKey: string;
  statusLabelKey: string;
}

const CARDS: AccentCard[] = [
  {
    id: "accent-1",
    icon: IconServerBolt,
    tone: "success",
    badgeVariant: "success",
    labelKey: "statsCard5Card1Label",
    valueKey: "statsCard5Card1Value",
    deltaKey: "statsCard5Card1Delta",
    statusKey: "statsCard5Card1Status",
    statusLabelKey: "statsCard5Card1StatusLabel",
  },
  {
    id: "accent-2",
    icon: IconAlarm,
    tone: "warning",
    badgeVariant: "warning",
    labelKey: "statsCard5Card2Label",
    valueKey: "statsCard5Card2Value",
    deltaKey: "statsCard5Card2Delta",
    statusKey: "statsCard5Card2Status",
    statusLabelKey: "statsCard5Card2StatusLabel",
  },
  {
    id: "accent-3",
    icon: IconCloudCheck,
    tone: "info",
    badgeVariant: "info",
    labelKey: "statsCard5Card3Label",
    valueKey: "statsCard5Card3Value",
    deltaKey: "statsCard5Card3Delta",
    statusKey: "statsCard5Card3Status",
    statusLabelKey: "statsCard5Card3StatusLabel",
  },
  {
    id: "accent-4",
    icon: IconScale,
    tone: "error",
    badgeVariant: "error",
    labelKey: "statsCard5Card4Label",
    valueKey: "statsCard5Card4Value",
    deltaKey: "statsCard5Card4Delta",
    statusKey: "statsCard5Card4Status",
    statusLabelKey: "statsCard5Card4StatusLabel",
  },
];

const accentBar: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  info: "bg-info",
  error: "bg-error",
};

const iconTone: Record<Tone, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
  error: "bg-error/10 text-error",
};

export function StatusAccentStatsCard() {
  const t = useMessages("pages") as unknown as PagesWithStatsCardMessages;
  const s = t.statsCard;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {s.statsCard5Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {s.statsCard5Heading}
          </h2>
          <p className="text-muted leading-relaxed">{s.statsCard5Intro}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card) => (
            <div
              key={card.id}
              className="border-border bg-surface relative flex flex-col gap-4 overflow-hidden rounded-2xl border py-6 pr-6 pl-7"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-y-0 left-0 w-1.5",
                  accentBar[card.tone],
                )}
              />
              <div className="flex items-center justify-between gap-3">
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full",
                    iconTone[card.tone],
                  )}
                >
                  <card.icon size={18} aria-hidden="true" />
                </span>
                <Badge variant={card.badgeVariant} size="sm">
                  {s[card.statusLabelKey]}
                </Badge>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted text-sm">{s[card.labelKey]}</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-fg text-2xl font-semibold tracking-tight">
                    {s[card.valueKey]}
                  </span>
                  <span className="text-muted text-xs font-medium">
                    {s[card.deltaKey]}
                  </span>
                </div>
              </div>
              <p className="text-muted text-xs leading-relaxed">
                {s[card.statusKey]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
