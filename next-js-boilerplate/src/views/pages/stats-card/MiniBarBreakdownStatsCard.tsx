"use client";

import {
  IconBug,
  IconDeviceAnalytics,
  IconRocket,
  IconUserPlus,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Bar, Chart } from "@/components/ui/Chart";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithStatsCardMessages } from "@/types/pages/stats-card/StatsCardMessages-types";

const BRAND = "var(--brand)" as const;
const INFO = "var(--info)" as const;
const SUCCESS = "var(--success)" as const;
const WARNING = "var(--warning)" as const;

interface BarCard {
  id: string;
  icon: Icon;
  labelKey: string;
  valueKey: string;
  deltaKey: string;
  color: string;
  bars: number[];
}

const CARDS: BarCard[] = [
  {
    id: "bar-1",
    icon: IconUserPlus,
    labelKey: "statsCard3Card1Label",
    valueKey: "statsCard3Card1Value",
    deltaKey: "statsCard3Card1Delta",
    color: BRAND,
    bars: [18, 24, 21, 29, 26, 33],
  },
  {
    id: "bar-2",
    icon: IconBug,
    labelKey: "statsCard3Card2Label",
    valueKey: "statsCard3Card2Value",
    deltaKey: "statsCard3Card2Delta",
    color: WARNING,
    bars: [12, 9, 14, 8, 6, 5],
  },
  {
    id: "bar-3",
    icon: IconRocket,
    labelKey: "statsCard3Card3Label",
    valueKey: "statsCard3Card3Value",
    deltaKey: "statsCard3Card3Delta",
    color: SUCCESS,
    bars: [3, 4, 3, 5, 6, 7],
  },
  {
    id: "bar-4",
    icon: IconDeviceAnalytics,
    labelKey: "statsCard3Card4Label",
    valueKey: "statsCard3Card4Value",
    deltaKey: "statsCard3Card4Delta",
    color: INFO,
    bars: [41, 38, 45, 52, 49, 57],
  },
];

function getBarData(bars: number[]): Record<string, unknown>[] {
  return bars.map((value, index) => ({ index, value }));
}

export function MiniBarBreakdownStatsCard() {
  const t = useMessages("pages") as unknown as PagesWithStatsCardMessages;
  const s = t.statsCard;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {s.statsCard3Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {s.statsCard3Heading}
          </h2>
          <p className="text-muted leading-relaxed">{s.statsCard3Intro}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card) => (
            <div
              key={card.id}
              className="border-border bg-surface flex flex-col gap-4 rounded-2xl border p-6"
            >
              <div className="flex items-center gap-3">
                <span className="border-border bg-bg flex size-9 shrink-0 items-center justify-center rounded-full border">
                  <card.icon size={18} aria-hidden="true" className="text-fg" />
                </span>
                <span className="text-muted text-sm">{s[card.labelKey]}</span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-fg text-2xl font-semibold tracking-tight">
                  {s[card.valueKey]}
                </span>
                <span className="text-muted text-xs font-medium">
                  {s[card.deltaKey]}
                </span>
              </div>
              <div
                role="img"
                aria-label={s.statsCard3ChartAriaTemplate.replace(
                  "{label}",
                  s[card.labelKey],
                )}
              >
                <Chart type="bar" data={getBarData(card.bars)} height={56}>
                  <Bar
                    dataKey="value"
                    fill={card.color}
                    radius={[3, 3, 0, 0]}
                  />
                </Chart>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
