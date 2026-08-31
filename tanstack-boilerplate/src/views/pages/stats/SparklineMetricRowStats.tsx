"use client";

import {
  IconShoppingCart,
  IconTrendingDown,
  IconTrendingUp,
  IconUserPlus,
  IconWallet,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Area, Chart } from "@/components/ui/Chart";
import { Card } from "@/components/ui/Card";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithStatsMessages } from "@/types/pages/stats/StatsMessages-types";

interface SparklineCard {
  id: string;
  icon: Icon;
  labelKey: string;
  valueKey: string;
  deltaKey: string;
  periodKey: string;
  trend: "up" | "down";
  points: number[];
}

const CARDS: SparklineCard[] = [
  {
    id: "revenue",
    icon: IconWallet,
    labelKey: "stats3Card1Label",
    valueKey: "stats3Card1Value",
    deltaKey: "stats3Card1Delta",
    periodKey: "stats3Card1Period",
    trend: "up",
    points: [32, 36, 34, 40, 44, 42, 50, 55, 53, 60, 64, 70],
  },
  {
    id: "signups",
    icon: IconUserPlus,
    labelKey: "stats3Card2Label",
    valueKey: "stats3Card2Value",
    deltaKey: "stats3Card2Delta",
    periodKey: "stats3Card2Period",
    trend: "up",
    points: [18, 22, 20, 26, 24, 30, 28, 34, 32, 38, 36, 44],
  },
  {
    id: "refunds",
    icon: IconShoppingCart,
    labelKey: "stats3Card3Label",
    valueKey: "stats3Card3Value",
    deltaKey: "stats3Card3Delta",
    periodKey: "stats3Card3Period",
    trend: "down",
    points: [30, 28, 31, 26, 27, 22, 24, 19, 21, 16, 17, 12],
  },
];

function toSeries(points: number[]): Record<string, unknown>[] {
  return points.map((value) => ({ value }));
}

export function SparklineMetricRowStats() {
  const t = useMessages("pages") as unknown as PagesWithStatsMessages;
  const sk = t.stats;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {sk.stats3Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {sk.stats3Heading}
          </h2>
          <p className="text-muted leading-relaxed">{sk.stats3Intro}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {CARDS.map((card) => {
            const TrendIcon = card.trend === "up" ? IconTrendingUp : IconTrendingDown;
            return (
              <Card key={card.id} variant="default">
                <div className="flex flex-col gap-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="border-border bg-surface flex size-9 items-center justify-center rounded-full border">
                      <card.icon size={18} aria-hidden="true" className="text-fg" />
                    </span>
                    <span
                      className={
                        card.trend === "up"
                          ? "bg-success/10 text-success inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                          : "bg-error/10 text-error inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                      }
                    >
                      <TrendIcon size={13} aria-hidden="true" />
                      {sk[card.deltaKey]}
                    </span>
                  </div>
                  <div>
                    <p className="text-muted text-xs">{sk[card.labelKey]}</p>
                    <p className="text-fg text-2xl font-semibold tracking-tight">
                      {sk[card.valueKey]}
                    </p>
                    <p className="text-muted text-xs">{sk[card.periodKey]}</p>
                  </div>
                  <Chart type="area" data={toSeries(card.points)} height={48}>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={card.trend === "up" ? "var(--success)" : "var(--error)"}
                      strokeWidth={2}
                      fill="none"
                    />
                  </Chart>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
