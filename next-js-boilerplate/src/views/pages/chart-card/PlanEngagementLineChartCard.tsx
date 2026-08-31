"use client";

import {
  CartesianGrid,
  Chart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/Chart";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithChartCardMessages } from "@/types/pages/chart-card/ChartCardMessages-types";

interface SourceDatum {
  monthKey: string;
  free: number;
  pro: number;
  enterprise: number;
}

const ENGAGEMENT_DATA: SourceDatum[] = [
  { monthKey: "chartCard6Month1", free: 2100, pro: 1200, enterprise: 380 },
  { monthKey: "chartCard6Month2", free: 2280, pro: 1340, enterprise: 420 },
  { monthKey: "chartCard6Month3", free: 2190, pro: 1510, enterprise: 460 },
  { monthKey: "chartCard6Month4", free: 2460, pro: 1690, enterprise: 520 },
  { monthKey: "chartCard6Month5", free: 2510, pro: 1880, enterprise: 590 },
  { monthKey: "chartCard6Month6", free: 2640, pro: 2120, enterprise: 660 },
];

export function PlanEngagementLineChartCard() {
  const t = useMessages("pages") as unknown as PagesWithChartCardMessages;
  const c = t.chartCard;
  const data = ENGAGEMENT_DATA.map((item) => ({
    month: c[item.monthKey],
    free: item.free,
    pro: item.pro,
    enterprise: item.enterprise,
  })) as unknown as Record<string, unknown>[];

  return (
    <div className="border-border bg-surface flex w-full items-center justify-center rounded-2xl border p-6 sm:p-10">
      <div className="border-border bg-bg w-full max-w-lg rounded-2xl border p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Typography variant="h4">{c.chartCard6Title}</Typography>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs">
              <span
                className="bg-brand size-2.5 rounded-full"
                aria-hidden="true"
              />
              {c.chartCard6SeriesFree}
            </span>
            <span className="flex items-center gap-1.5 text-xs">
              <span
                className="bg-info size-2.5 rounded-full"
                aria-hidden="true"
              />
              {c.chartCard6SeriesPro}
            </span>
            <span className="flex items-center gap-1.5 text-xs">
              <span
                className="bg-success size-2.5 rounded-full"
                aria-hidden="true"
              />
              {c.chartCard6SeriesEnterprise}
            </span>
          </div>
        </div>
        <div className="mt-5">
          <Chart type="line" data={data} height={240}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="free"
              name={c.chartCard6SeriesFree}
              stroke="var(--brand)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="pro"
              name={c.chartCard6SeriesPro}
              stroke="var(--info)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="enterprise"
              name={c.chartCard6SeriesEnterprise}
              stroke="var(--success)"
              strokeWidth={2}
              dot={false}
            />
          </Chart>
        </div>
      </div>
    </div>
  );
}
