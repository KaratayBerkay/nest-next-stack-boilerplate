"use client";

import {
  Bar,
  CartesianGrid,
  Chart,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/Chart";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithChartCardMessages } from "@/types/pages/chart-card/ChartCardMessages-types";

interface SourceDatum {
  monthKey: string;
  newCustomers: number;
  returning: number;
}

const CUSTOMER_DATA: SourceDatum[] = [
  { monthKey: "chartCard8Month1", newCustomers: 640, returning: 820 },
  { monthKey: "chartCard8Month2", newCustomers: 720, returning: 890 },
  { monthKey: "chartCard8Month3", newCustomers: 810, returning: 940 },
  { monthKey: "chartCard8Month4", newCustomers: 780, returning: 1080 },
];

export function CustomerGroupedBarChartCard() {
  const t = useMessages("pages") as unknown as PagesWithChartCardMessages;
  const c = t.chartCard;
  const data = CUSTOMER_DATA.map((item) => ({
    month: c[item.monthKey],
    newCustomers: item.newCustomers,
    returning: item.returning,
  })) as unknown as Record<string, unknown>[];

  return (
    <div className="border-border bg-surface flex w-full items-center justify-center rounded-2xl border p-6 sm:p-10">
      <div className="border-border bg-bg w-full max-w-lg rounded-2xl border p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Typography variant="h4">{c.chartCard8Title}</Typography>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs">
              <span
                className="bg-brand size-2.5 rounded-full"
                aria-hidden="true"
              />
              {c.chartCard8SeriesNew}
            </span>
            <span className="flex items-center gap-1.5 text-xs">
              <span
                className="bg-muted size-2.5 rounded-full"
                aria-hidden="true"
              />
              {c.chartCard8SeriesReturning}
            </span>
          </div>
        </div>
        <div className="mt-5">
          <Chart type="bar" data={data} height={240}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="newCustomers"
              name={c.chartCard8SeriesNew}
              fill="var(--brand)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="returning"
              name={c.chartCard8SeriesReturning}
              fill="var(--muted)"
              radius={[4, 4, 0, 0]}
            />
          </Chart>
        </div>
      </div>
    </div>
  );
}
