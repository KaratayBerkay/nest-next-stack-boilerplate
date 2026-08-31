"use client";

import {
  IconActivity,
  IconClock,
  IconMapPin2,
  IconUsers,
  IconWorld,
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

interface PinDatum {
  labelKey: string;
  left: string;
  top: string;
}

interface CountryDatum {
  nameKey: string;
  valueKey: string;
  shareKey: string;
  pct: number;
}

const STATS: StatDatum[] = [
  {
    labelKey: "dashboard12Stat1Label",
    valueKey: "dashboard12Stat1Value",
    deltaKey: "dashboard12Stat1Delta",
    trend: "up",
    icon: IconUsers,
  },
  {
    labelKey: "dashboard12Stat2Label",
    valueKey: "dashboard12Stat2Value",
    deltaKey: "dashboard12Stat2Delta",
    trend: "up",
    icon: IconWorld,
  },
  {
    labelKey: "dashboard12Stat3Label",
    valueKey: "dashboard12Stat3Value",
    deltaKey: "dashboard12Stat3Delta",
    trend: "up",
    icon: IconClock,
  },
  {
    labelKey: "dashboard12Stat4Label",
    valueKey: "dashboard12Stat4Value",
    deltaKey: "dashboard12Stat4Delta",
    trend: "down",
    icon: IconActivity,
  },
];

const PINS: PinDatum[] = [
  { labelKey: "dashboard12Pin1", left: "18%", top: "30%" },
  { labelKey: "dashboard12Pin2", left: "30%", top: "38%" },
  { labelKey: "dashboard12Pin3", left: "48%", top: "28%" },
  { labelKey: "dashboard12Pin4", left: "52%", top: "38%" },
  { labelKey: "dashboard12Pin5", left: "56%", top: "56%" },
  { labelKey: "dashboard12Pin6", left: "68%", top: "62%" },
  { labelKey: "dashboard12Pin7", left: "74%", top: "30%" },
  { labelKey: "dashboard12Pin8", left: "40%", top: "62%" },
  { labelKey: "dashboard12Pin9", left: "76%", top: "66%" },
];

const COUNTRIES: CountryDatum[] = [
  {
    nameKey: "dashboard12Country1Name",
    valueKey: "dashboard12Country1Value",
    shareKey: "dashboard12Country1Share",
    pct: 38,
  },
  {
    nameKey: "dashboard12Country2Name",
    valueKey: "dashboard12Country2Value",
    shareKey: "dashboard12Country2Share",
    pct: 20,
  },
  {
    nameKey: "dashboard12Country3Name",
    valueKey: "dashboard12Country3Value",
    shareKey: "dashboard12Country3Share",
    pct: 15,
  },
  {
    nameKey: "dashboard12Country4Name",
    valueKey: "dashboard12Country4Value",
    shareKey: "dashboard12Country4Share",
    pct: 12,
  },
  {
    nameKey: "dashboard12Country5Name",
    valueKey: "dashboard12Country5Value",
    shareKey: "dashboard12Country5Share",
    pct: 9,
  },
];

export function GlobalAnalyticsMapDashboard() {
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
            {d.dashboard12Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dashboard12Description}
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
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="border-border bg-surface flex flex-col gap-4 rounded-2xl border p-6 lg:col-span-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">
                {d.dashboard12MapTitle}
              </span>
              <span className="text-muted text-xs">
                {d.dashboard12MapSubtitle}
              </span>
            </div>
            <div className="relative h-[300px] overflow-hidden rounded-xl">
              <div
                className="absolute inset-0 bg-[radial-gradient(var(--color-fg)_1px,transparent_1px)] [background-size:16px_16px] opacity-30"
                aria-hidden="true"
              />
              {PINS.map((pin) => (
                <div
                  key={pin.labelKey}
                  className="absolute -translate-x-1/2 -translate-y-full"
                  style={{ left: pin.left, top: pin.top }}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="border-border bg-surface text-muted flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs shadow-xs">
                      {d[pin.labelKey]}
                    </span>
                    <IconMapPin2
                      size={20}
                      className="text-brand"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="sr-only">{d.dashboard12MapAlt}</p>
          </div>
          <div className="border-border bg-surface flex flex-col gap-4 rounded-2xl border p-6 lg:col-span-2">
            <span className="text-sm font-medium">
              {d.dashboard12CountriesTitle}
            </span>
            <div className="text-muted flex items-center justify-between gap-3 pb-1 text-xs font-medium">
              <span>{d.dashboard12CountryHeader}</span>
              <span>{d.dashboard12UsersHeader}</span>
            </div>
            <div className="flex flex-col gap-4">
              {COUNTRIES.map((country) => (
                <div key={country.nameKey} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">{d[country.nameKey]}</span>
                    <span className="text-muted">{d[country.valueKey]}</span>
                  </div>
                  <div className="bg-surface-hover h-1.5 w-full overflow-hidden rounded-full">
                    <div
                      className="bg-brand h-full rounded-full"
                      style={{ width: `${country.pct}%` }}
                    />
                  </div>
                  <span className="text-muted text-xs">
                    {d[country.shareKey]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
