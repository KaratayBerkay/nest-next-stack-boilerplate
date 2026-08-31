"use client";

import { useState } from "react";
import {
  IconChartDots,
  IconCreditCard,
  IconGauge,
  IconStar,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Card } from "@/components/ui/Card";
import { Chart, Line } from "@/components/ui/Chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithStatsCardMessages } from "@/types/pages/stats-card/StatsCardMessages-types";

type Period = "day" | "week" | "month";

const BRAND = "var(--brand)" as const;

interface PeriodData {
  valueKey: string;
  deltaKey: string;
  spark: number[];
}

interface ToggleCardConfig {
  id: string;
  icon: Icon;
  labelKey: string;
  periods: Record<Period, PeriodData>;
}

const CARDS: ToggleCardConfig[] = [
  {
    id: "toggle-1",
    icon: IconCreditCard,
    labelKey: "statsCard6Card1Label",
    periods: {
      day: {
        valueKey: "statsCard6Card1DayValue",
        deltaKey: "statsCard6Card1DayDelta",
        spark: [4, 6, 5, 7, 6, 8, 9],
      },
      week: {
        valueKey: "statsCard6Card1WeekValue",
        deltaKey: "statsCard6Card1WeekDelta",
        spark: [22, 26, 24, 30, 28, 33, 36],
      },
      month: {
        valueKey: "statsCard6Card1MonthValue",
        deltaKey: "statsCard6Card1MonthDelta",
        spark: [88, 96, 101, 110, 118, 126, 131],
      },
    },
  },
  {
    id: "toggle-2",
    icon: IconGauge,
    labelKey: "statsCard6Card2Label",
    periods: {
      day: {
        valueKey: "statsCard6Card2DayValue",
        deltaKey: "statsCard6Card2DayDelta",
        spark: [61, 58, 63, 60, 57, 55, 59],
      },
      week: {
        valueKey: "statsCard6Card2WeekValue",
        deltaKey: "statsCard6Card2WeekDelta",
        spark: [59, 60, 58, 61, 62, 60, 63],
      },
      month: {
        valueKey: "statsCard6Card2MonthValue",
        deltaKey: "statsCard6Card2MonthDelta",
        spark: [57, 59, 60, 62, 63, 65, 66],
      },
    },
  },
  {
    id: "toggle-3",
    icon: IconStar,
    labelKey: "statsCard6Card3Label",
    periods: {
      day: {
        valueKey: "statsCard6Card3DayValue",
        deltaKey: "statsCard6Card3DayDelta",
        spark: [3, 4, 4, 5, 4, 5, 5],
      },
      week: {
        valueKey: "statsCard6Card3WeekValue",
        deltaKey: "statsCard6Card3WeekDelta",
        spark: [22, 24, 27, 25, 29, 31, 30],
      },
      month: {
        valueKey: "statsCard6Card3MonthValue",
        deltaKey: "statsCard6Card3MonthDelta",
        spark: [96, 101, 108, 112, 119, 124, 128],
      },
    },
  },
  {
    id: "toggle-4",
    icon: IconChartDots,
    labelKey: "statsCard6Card4Label",
    periods: {
      day: {
        valueKey: "statsCard6Card4DayValue",
        deltaKey: "statsCard6Card4DayDelta",
        spark: [12, 10, 13, 9, 11, 8, 7],
      },
      week: {
        valueKey: "statsCard6Card4WeekValue",
        deltaKey: "statsCard6Card4WeekDelta",
        spark: [70, 66, 61, 58, 54, 50, 47],
      },
      month: {
        valueKey: "statsCard6Card4MonthValue",
        deltaKey: "statsCard6Card4MonthDelta",
        spark: [310, 298, 281, 265, 252, 240, 229],
      },
    },
  },
];

function getSparkData(spark: number[]): Record<string, unknown>[] {
  return spark.map((value) => ({ value }));
}

function ToggleStatCard({
  config,
  s,
}: {
  config: ToggleCardConfig;
  s: Record<string, string>;
}) {
  const [period, setPeriod] = useState<Period>("week");
  const active = config.periods[period];

  return (
    <Card variant="default">
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="border-border bg-bg flex size-9 shrink-0 items-center justify-center rounded-full border">
              <config.icon size={18} aria-hidden="true" className="text-fg" />
            </span>
            <span className="text-fg text-sm font-semibold">
              {s[config.labelKey]}
            </span>
          </div>
        </div>
        <ToggleGroup
          type="single"
          value={period}
          onValueChange={(value) => {
            if (value) setPeriod(value as Period);
          }}
          aria-label={s.statsCard6ToggleGroupAriaTemplate.replace(
            "{label}",
            s[config.labelKey],
          )}
        >
          <ToggleGroupItem value="day" size="sm">
            {s.statsCard6PeriodDay}
          </ToggleGroupItem>
          <ToggleGroupItem value="week" size="sm">
            {s.statsCard6PeriodWeek}
          </ToggleGroupItem>
          <ToggleGroupItem value="month" size="sm">
            {s.statsCard6PeriodMonth}
          </ToggleGroupItem>
        </ToggleGroup>
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-fg text-2xl font-semibold tracking-tight">
            {s[active.valueKey]}
          </span>
          <span className="text-success text-xs font-medium">
            {s[active.deltaKey]}
          </span>
        </div>
        <Chart type="line" data={getSparkData(active.spark)} height={48}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={BRAND}
            strokeWidth={2}
            dot={false}
          />
        </Chart>
      </div>
    </Card>
  );
}

export function ToggleMetricStatsCard() {
  const t = useMessages("pages") as unknown as PagesWithStatsCardMessages;
  const s = t.statsCard;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {s.statsCard6Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {s.statsCard6Heading}
          </h2>
          <p className="text-muted leading-relaxed">{s.statsCard6Intro}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((config) => (
            <ToggleStatCard key={config.id} config={config} s={s} />
          ))}
        </div>
      </div>
    </section>
  );
}
