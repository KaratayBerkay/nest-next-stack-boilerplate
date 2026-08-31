"use client";

import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconHeadset,
  IconMailOpened,
  IconShoppingBag,
  IconUsers,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithStatsCardMessages } from "@/types/pages/stats-card/StatsCardMessages-types";

interface ComparisonCard {
  id: string;
  icon: Icon;
  labelKey: string;
  deltaKey: string;
  current: number;
  currentKey: string;
  previous: number;
  previousKey: string;
  trend: "up" | "down";
}

const CARDS: ComparisonCard[] = [
  {
    id: "compare-1",
    icon: IconShoppingBag,
    labelKey: "statsCard4Card1Label",
    deltaKey: "statsCard4Card1Delta",
    current: 86,
    currentKey: "statsCard4Card1CurrentValue",
    previous: 64,
    previousKey: "statsCard4Card1PreviousValue",
    trend: "up",
  },
  {
    id: "compare-2",
    icon: IconUsers,
    labelKey: "statsCard4Card2Label",
    deltaKey: "statsCard4Card2Delta",
    current: 72,
    currentKey: "statsCard4Card2CurrentValue",
    previous: 79,
    previousKey: "statsCard4Card2PreviousValue",
    trend: "down",
  },
  {
    id: "compare-3",
    icon: IconHeadset,
    labelKey: "statsCard4Card3Label",
    deltaKey: "statsCard4Card3Delta",
    current: 58,
    currentKey: "statsCard4Card3CurrentValue",
    previous: 41,
    previousKey: "statsCard4Card3PreviousValue",
    trend: "up",
  },
  {
    id: "compare-4",
    icon: IconMailOpened,
    labelKey: "statsCard4Card4Label",
    deltaKey: "statsCard4Card4Delta",
    current: 34,
    currentKey: "statsCard4Card4CurrentValue",
    previous: 51,
    previousKey: "statsCard4Card4PreviousValue",
    trend: "down",
  },
];

function getToneClasses(trend: ComparisonCard["trend"]) {
  return trend === "up"
    ? "bg-success/10 text-success"
    : "bg-error/10 text-error";
}

export function PeriodComparisonStatsCard() {
  const t = useMessages("pages") as unknown as PagesWithStatsCardMessages;
  const s = t.statsCard;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {s.statsCard4Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {s.statsCard4Heading}
          </h2>
          <p className="text-muted leading-relaxed">{s.statsCard4Intro}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card) => {
            const IconArrow =
              card.trend === "up" ? IconArrowUpRight : IconArrowDownRight;
            const max = Math.max(card.current, card.previous);
            return (
              <div
                key={card.id}
                className="border-border bg-surface flex flex-col gap-4 rounded-2xl border p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="border-border bg-bg flex size-9 shrink-0 items-center justify-center rounded-full border">
                    <card.icon
                      size={18}
                      aria-hidden="true"
                      className="text-fg"
                    />
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                      getToneClasses(card.trend),
                    )}
                  >
                    <IconArrow size={14} aria-hidden="true" />
                    {s[card.deltaKey]}
                  </span>
                </div>
                <span className="text-fg text-sm font-semibold">
                  {s[card.labelKey]}
                </span>
                <div className="flex flex-col gap-2.5">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted">
                        {s.statsCard4CurrentLegend}
                      </span>
                      <span className="text-fg font-medium tabular-nums">
                        {s[card.currentKey]}
                      </span>
                    </div>
                    <div className="bg-bg h-2 w-full overflow-hidden rounded-full">
                      <div
                        className="bg-brand h-full rounded-full"
                        style={{ width: `${(card.current / max) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted">
                        {s.statsCard4PreviousLegend}
                      </span>
                      <span className="text-muted font-medium tabular-nums">
                        {s[card.previousKey]}
                      </span>
                    </div>
                    <div className="bg-bg h-2 w-full overflow-hidden rounded-full">
                      <div
                        className="bg-muted/40 h-full rounded-full"
                        style={{ width: `${(card.previous / max) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
