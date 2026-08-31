"use client";

import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconClock,
  IconTicket,
  IconUsers,
  IconWallet,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Chart, Line } from "@/components/ui/Chart";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithStatsCardMessages } from "@/types/pages/stats-card/StatsCardMessages-types";

const BRAND = "var(--brand)" as const;

interface TrendCard {
  id: string;
  icon: Icon;
  labelKey: string;
  valueKey: string;
  deltaKey: string;
  trend: "up" | "down";
  spark: number[];
}

const CARDS: TrendCard[] = [
  {
    id: "trend-1",
    icon: IconWallet,
    labelKey: "statsCard1Card1Label",
    valueKey: "statsCard1Card1Value",
    deltaKey: "statsCard1Card1Delta",
    trend: "up",
    spark: [14, 16, 15, 19, 22, 21, 27, 30],
  },
  {
    id: "trend-2",
    icon: IconUsers,
    labelKey: "statsCard1Card2Label",
    valueKey: "statsCard1Card2Value",
    deltaKey: "statsCard1Card2Delta",
    trend: "up",
    spark: [9, 10, 12, 11, 14, 15, 15, 18],
  },
  {
    id: "trend-3",
    icon: IconClock,
    labelKey: "statsCard1Card3Label",
    valueKey: "statsCard1Card3Value",
    deltaKey: "statsCard1Card3Delta",
    trend: "down",
    spark: [12, 11, 13, 10, 9, 10, 8, 7],
  },
  {
    id: "trend-4",
    icon: IconTicket,
    labelKey: "statsCard1Card4Label",
    valueKey: "statsCard1Card4Value",
    deltaKey: "statsCard1Card4Delta",
    trend: "down",
    spark: [20, 19, 18, 20, 16, 14, 13, 11],
  },
];

function getSparkData(spark: number[]): Record<string, unknown>[] {
  return spark.map((value) => ({ value }));
}

function getToneClasses(trend: TrendCard["trend"]) {
  return trend === "up"
    ? "bg-success/10 text-success"
    : "bg-error/10 text-error";
}

export function TrendSparklineStatsCard() {
  const t = useMessages("pages") as unknown as PagesWithStatsCardMessages;
  const s = t.statsCard;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {s.statsCard1Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {s.statsCard1Heading}
          </h2>
          <p className="text-muted leading-relaxed">{s.statsCard1Intro}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card) => {
            const IconArrow =
              card.trend === "up" ? IconArrowUpRight : IconArrowDownRight;
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
                <div className="flex flex-col gap-1">
                  <span className="text-muted text-sm">{s[card.labelKey]}</span>
                  <span className="text-fg text-2xl font-semibold tracking-tight">
                    {s[card.valueKey]}
                  </span>
                </div>
                <div
                  role="img"
                  aria-label={s.statsCard1SparklineAriaTemplate.replace(
                    "{label}",
                    s[card.labelKey],
                  )}
                >
                  <Chart
                    type="line"
                    data={getSparkData(card.spark)}
                    height={56}
                  >
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={BRAND}
                      strokeWidth={2}
                      dot={false}
                    />
                  </Chart>
                </div>
                <span className="text-muted text-xs">
                  {s.statsCard1PeriodCaption}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
