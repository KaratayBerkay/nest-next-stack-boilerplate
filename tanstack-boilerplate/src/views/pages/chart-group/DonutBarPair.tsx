"use client";

import { Cell } from "recharts";
import {
  Chart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Bar,
  Pie,
} from "@/components/ui/Chart";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  ChartGroupMessages,
  PagesWithChartGroupMessages,
} from "@/types/pages/chart-group/ChartGroupMessages-types";

interface DonutSlice {
  nameKey: string;
  valueKey: string;
  value: number;
}

interface DonutDatum {
  name: string;
  value: number;
}

interface MonthlySourceDatum {
  monthKey: string;
  revenue: number;
}

interface MonthlyDatum {
  month: string;
  revenue: number;
}

const DONUT_COLORS = ["var(--brand)", "var(--muted)", "var(--info)"] as const;

const DONUT_DATA: DonutSlice[] = [
  {
    nameKey: "chartGroup6Slice1Label",
    valueKey: "chartGroup6Slice1Value",
    value: 18420,
  },
  {
    nameKey: "chartGroup6Slice2Label",
    valueKey: "chartGroup6Slice2Value",
    value: 8960,
  },
  {
    nameKey: "chartGroup6Slice3Label",
    valueKey: "chartGroup6Slice3Value",
    value: 4880,
  },
];

const MONTHLY_DATA: MonthlySourceDatum[] = [
  { monthKey: "chartGroup6Month1", revenue: 4200 },
  { monthKey: "chartGroup6Month2", revenue: 3800 },
  { monthKey: "chartGroup6Month3", revenue: 5100 },
  { monthKey: "chartGroup6Month4", revenue: 4800 },
  { monthKey: "chartGroup6Month5", revenue: 6100 },
  { monthKey: "chartGroup6Month6", revenue: 5700 },
  { monthKey: "chartGroup6Month7", revenue: 6900 },
  { monthKey: "chartGroup6Month8", revenue: 7400 },
  { monthKey: "chartGroup6Month9", revenue: 6600 },
  { monthKey: "chartGroup6Month10", revenue: 7900 },
  { monthKey: "chartGroup6Month11", revenue: 8500 },
  { monthKey: "chartGroup6Month12", revenue: 9200 },
];

function getDonutData(cg: ChartGroupMessages): DonutDatum[] {
  return DONUT_DATA.map((slice) => ({
    name: cg[slice.nameKey],
    value: slice.value,
  }));
}

function getMonthlyData(cg: ChartGroupMessages): MonthlyDatum[] {
  return MONTHLY_DATA.map((item) => ({
    month: cg[item.monthKey],
    revenue: item.revenue,
  }));
}

export function DonutBarPair() {
  const t = useMessages("pages") as unknown as PagesWithChartGroupMessages;
  const cg = t.chartGroup;
  const donutData = getDonutData(cg) as unknown as Record<string, unknown>[];
  const monthlyData = getMonthlyData(cg) as unknown as Record<
    string,
    unknown
  >[];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {cg.chartGroup6Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {cg.chartGroup6Description}
          </Typography>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="border-border bg-surface flex flex-col rounded-3xl border p-6 lg:p-8">
            <Typography variant="h3">{cg.chartGroup6LeftCardTitle}</Typography>
            <div className="relative mt-6">
              <Chart type="pie" data={donutData} height={240}>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={68}
                  outerRadius={92}
                  paddingAngle={2}
                >
                  {DONUT_DATA.map((slice, index) => (
                    <Cell
                      key={slice.nameKey}
                      fill={DONUT_COLORS[index]}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip />
              </Chart>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1">
                <span className="text-muted text-sm">
                  {cg.chartGroup6CenterLabel}
                </span>
                <span className="text-2xl font-semibold tracking-tight">
                  {cg.chartGroup6TotalValue}
                </span>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              {DONUT_DATA.map((slice, index) => (
                <div
                  key={slice.nameKey}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: DONUT_COLORS[index] }}
                      aria-hidden="true"
                    />
                    {cg[slice.nameKey]}
                  </span>
                  <span className="text-muted">{cg[slice.valueKey]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-border bg-surface flex flex-col rounded-3xl border p-6 lg:p-8">
            <Typography variant="h3">{cg.chartGroup6RightCardTitle}</Typography>
            <div className="mt-6 flex-1">
              <Chart type="bar" data={monthlyData} height={320}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="revenue"
                  name={cg.chartGroup6Series1Label}
                  fill="var(--brand)"
                  radius={[4, 4, 0, 0]}
                />
              </Chart>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
