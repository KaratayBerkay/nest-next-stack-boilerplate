"use client";

import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithChartCardMessages } from "@/types/pages/chart-card/ChartCardMessages-types";

interface BulletKpi {
  labelKey: string;
  valueKey: string;
  targetKey: string;
  poorTo: number;
  okTo: number;
  targetPct: number;
  actualPct: number;
}

const BULLET_KPIS: BulletKpi[] = [
  {
    labelKey: "chartCard26Kpi1Label",
    valueKey: "chartCard26Kpi1Value",
    targetKey: "chartCard26Kpi1Target",
    poorTo: 40,
    okTo: 70,
    targetPct: 80,
    actualPct: 68,
  },
  {
    labelKey: "chartCard26Kpi2Label",
    valueKey: "chartCard26Kpi2Value",
    targetKey: "chartCard26Kpi2Target",
    poorTo: 35,
    okTo: 65,
    targetPct: 75,
    actualPct: 82,
  },
  {
    labelKey: "chartCard26Kpi3Label",
    valueKey: "chartCard26Kpi3Value",
    targetKey: "chartCard26Kpi3Target",
    poorTo: 50,
    okTo: 75,
    targetPct: 85,
    actualPct: 90,
  },
  {
    labelKey: "chartCard26Kpi4Label",
    valueKey: "chartCard26Kpi4Value",
    targetKey: "chartCard26Kpi4Target",
    poorTo: 45,
    okTo: 70,
    targetPct: 88,
    actualPct: 61,
  },
];

export function KpiBulletGridChartCard() {
  const t = useMessages("pages") as unknown as PagesWithChartCardMessages;
  const c = t.chartCard;

  return (
    <div className="border-border bg-surface flex w-full items-center justify-center rounded-2xl border p-6 sm:p-10">
      <div className="border-border bg-bg w-full max-w-2xl rounded-2xl border p-6 shadow-xs">
        <Typography variant="h4">{c.chartCard26Title}</Typography>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {BULLET_KPIS.map((kpi) => (
            <div key={kpi.labelKey} className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium">{c[kpi.labelKey]}</span>
                <span className="text-muted tabular-nums">{c[kpi.valueKey]}</span>
              </div>
              <div className="bg-surface-hover relative h-3 w-full overflow-hidden rounded-full">
                <div
                  className="bg-error/15 absolute inset-y-0 left-0"
                  style={{ width: `${kpi.poorTo}%` }}
                  aria-hidden="true"
                />
                <div
                  className="bg-warning/15 absolute inset-y-0"
                  style={{ left: `${kpi.poorTo}%`, width: `${kpi.okTo - kpi.poorTo}%` }}
                  aria-hidden="true"
                />
                <div
                  className="bg-success/15 absolute inset-y-0"
                  style={{ left: `${kpi.okTo}%`, width: `${100 - kpi.okTo}%` }}
                  aria-hidden="true"
                />
                <div
                  className="bg-brand absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${kpi.actualPct}%` }}
                />
                <div
                  className="bg-fg absolute top-[-3px] h-[18px] w-0.5"
                  style={{ left: `${kpi.targetPct}%` }}
                  aria-hidden="true"
                />
              </div>
              <span className="text-muted text-xs">{c[kpi.targetKey]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
