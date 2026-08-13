"use client";

import {
  IconCalendar,
  IconRepeat,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDashboardMessages } from "@/types/pages/dashboard/DashboardMessages-types";

type Trend = "up" | "down";

interface StatDatum {
  labelKey: string;
  valueKey: string;
  deltaKey: string;
  trend: Trend;
  icon: Icon;
}

interface HeatZone {
  min: number;
  className: string;
}

const STATS: StatDatum[] = [
  {
    labelKey: "dashboard11Stat1Label",
    valueKey: "dashboard11Stat1Value",
    deltaKey: "dashboard11Stat1Delta",
    trend: "up",
    icon: IconTrendingUp,
  },
  {
    labelKey: "dashboard11Stat2Label",
    valueKey: "dashboard11Stat2Value",
    deltaKey: "dashboard11Stat2Delta",
    trend: "up",
    icon: IconCalendar,
  },
  {
    labelKey: "dashboard11Stat3Label",
    valueKey: "dashboard11Stat3Value",
    deltaKey: "dashboard11Stat3Delta",
    trend: "up",
    icon: IconRepeat,
  },
  {
    labelKey: "dashboard11Stat4Label",
    valueKey: "dashboard11Stat4Value",
    deltaKey: "dashboard11Stat4Delta",
    trend: "up",
    icon: IconUsers,
  },
];

const HEAT_ZONES: HeatZone[] = [
  { min: 95, className: "bg-brand text-brand-fg" },
  { min: 80, className: "bg-brand/80 text-brand-fg" },
  { min: 65, className: "bg-brand/60 text-brand-fg" },
  { min: 50, className: "bg-brand/40 text-brand-fg" },
  { min: 35, className: "bg-brand/30 text-brand" },
  { min: 20, className: "bg-brand/20 text-brand" },
  { min: 0, className: "bg-brand/10 text-brand" },
];

const LEGEND_ZONES = [
  "bg-brand/10",
  "bg-brand/20",
  "bg-brand/30",
  "bg-brand/40",
  "bg-brand/60",
  "bg-brand/80",
  "bg-brand",
] as const;

const COHORT_KEYS = [
  "dashboard11Cohort1",
  "dashboard11Cohort2",
  "dashboard11Cohort3",
  "dashboard11Cohort4",
  "dashboard11Cohort5",
] as const;

const MONTH_KEYS = [
  "dashboard11Month1",
  "dashboard11Month2",
  "dashboard11Month3",
  "dashboard11Month4",
  "dashboard11Month5",
  "dashboard11Month6",
  "dashboard11Month7",
  "dashboard11Month8",
] as const;

const HEAT_VALUES: (number | null)[][] = [
  [100, 62, 47, 38, 31, 27, 24, 22],
  [null, 100, 58, 44, 35, 30, 26, 23],
  [null, null, 100, 61, 46, 36, 29, 25],
  [null, null, null, 100, 55, 41, 32, 27],
  [null, null, null, null, 100, 52, 38, 29],
];

function heatZoneClass(value: number): string {
  for (const zone of HEAT_ZONES) {
    if (value >= zone.min) {
      return zone.className;
    }
  }
  return HEAT_ZONES[HEAT_ZONES.length - 1].className;
}

export function CohortHeatmapDashboard() {
  const t = useMessages("pages") as unknown as PagesWithDashboardMessages;
  const d = t.dashboard;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="border-border bg-surface flex max-w-6xl flex-col gap-6 rounded-2xl border p-6 shadow-xs lg:mx-auto lg:p-8">
        <div className="flex flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.dashboard11Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dashboard11Description}
          </Typography>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.labelKey}
              className="flex flex-col gap-4 rounded-2xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-muted text-sm">{d[stat.labelKey]}</span>
                <span className="text-brand bg-brand/10 flex size-8 items-center justify-center rounded-lg">
                  <stat.icon size={18} aria-hidden="true" />
                </span>
              </div>
              <div className="flex items-end justify-between gap-3">
                <span className="text-2xl font-semibold tracking-tight">
                  {d[stat.valueKey]}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    stat.trend === "up"
                      ? "bg-success/10 text-success"
                      : "bg-error/10 text-error",
                  )}
                >
                  {d[stat.deltaKey]}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="border-border bg-surface flex flex-col gap-5 rounded-2xl border p-6">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">
              {d.dashboard11HeatmapTitle}
            </span>
            <span className="text-muted text-xs">{d.dashboard11Note}</span>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div
                className="grid gap-1.5"
                style={{
                  gridTemplateColumns: `110px repeat(${MONTH_KEYS.length}, minmax(64px, 1fr))`,
                }}
              >
                <div className="text-muted flex items-end px-2 pb-1 text-xs font-medium">
                  {d.dashboard11CohortLabel}
                </div>
                {MONTH_KEYS.map((monthKey) => (
                  <div
                    key={monthKey}
                    className="text-muted flex items-end justify-center px-1 pb-1 text-xs font-medium"
                  >
                    {d[monthKey]}
                  </div>
                ))}
                {COHORT_KEYS.map((cohortKey, rowIndex) => (
                  <div key={cohortKey} className="contents">
                    <div className="flex items-center px-2 text-xs font-medium">
                      {d[cohortKey]}
                    </div>
                    {HEAT_VALUES[rowIndex].map((value, colIndex) =>
                      value === null ? (
                        <div
                          key={colIndex}
                          className="aspect-[4/3] rounded-md"
                          aria-hidden="true"
                        />
                      ) : (
                        <div
                          key={colIndex}
                          title={`${d[cohortKey]} · ${d[MONTH_KEYS[colIndex]]}: ${value}%`}
                          className={cn(
                            "flex aspect-[4/3] items-center justify-center rounded-md text-xs font-medium",
                            heatZoneClass(value),
                          )}
                        >
                          {value}
                        </div>
                      ),
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <span className="text-muted text-xs">
              {d.dashboard11LegendLess}
            </span>
            <div className="flex overflow-hidden rounded-md">
              {LEGEND_ZONES.map((zone) => (
                <span
                  key={zone}
                  className={cn("h-3 w-6", zone)}
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className="text-muted text-xs">
              {d.dashboard11LegendMore}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
