"use client";

import { Cell, Pie } from "recharts";
import {
  Chart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  Bar,
} from "@/components/ui/Chart";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithChartGroupMessages } from "@/types/pages/chart-group/ChartGroupMessages-types";

interface ChartGroup8LinePoint {
  labelKey: string;
  revenue: number;
  expenses: number;
}

interface ChartGroup8DonutSegment {
  labelKey: string;
  value: number;
}

interface ChartGroup8BarPoint {
  labelKey: string;
  visits: number;
}

interface ChartGroup8SparkPoint {
  labelKey: string;
  users: number;
}

const CHART_GROUP_8_LINE_DATA: ChartGroup8LinePoint[] = [
  { labelKey: "chartGroup8Month1", revenue: 4200, expenses: 2900 },
  { labelKey: "chartGroup8Month2", revenue: 3800, expenses: 2700 },
  { labelKey: "chartGroup8Month3", revenue: 5100, expenses: 3100 },
  { labelKey: "chartGroup8Month4", revenue: 4700, expenses: 3000 },
  { labelKey: "chartGroup8Month5", revenue: 5600, expenses: 3400 },
  { labelKey: "chartGroup8Month6", revenue: 6200, expenses: 3600 },
  { labelKey: "chartGroup8Month7", revenue: 5800, expenses: 3500 },
  { labelKey: "chartGroup8Month8", revenue: 6600, expenses: 3800 },
  { labelKey: "chartGroup8Month9", revenue: 7100, expenses: 4000 },
  { labelKey: "chartGroup8Month10", revenue: 6900, expenses: 3900 },
  { labelKey: "chartGroup8Month11", revenue: 7600, expenses: 4200 },
  { labelKey: "chartGroup8Month12", revenue: 8200, expenses: 4600 },
];

const CHART_GROUP_8_DONUT_DATA: ChartGroup8DonutSegment[] = [
  { labelKey: "chartGroup8Donut1", value: 42 },
  { labelKey: "chartGroup8Donut2", value: 26 },
  { labelKey: "chartGroup8Donut3", value: 18 },
  { labelKey: "chartGroup8Donut4", value: 14 },
];

const CHART_GROUP_8_DONUT_COLORS = [
  "hsl(var(--brand))",
  "hsl(var(--info))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
] as const;

const CHART_GROUP_8_BAR_DATA: ChartGroup8BarPoint[] = [
  { labelKey: "chartGroup8Day1", visits: 9400 },
  { labelKey: "chartGroup8Day2", visits: 8100 },
  { labelKey: "chartGroup8Day3", visits: 10500 },
  { labelKey: "chartGroup8Day4", visits: 9800 },
  { labelKey: "chartGroup8Day5", visits: 12300 },
  { labelKey: "chartGroup8Day6", visits: 15200 },
  { labelKey: "chartGroup8Day7", visits: 13800 },
];

const CHART_GROUP_8_SPARK_DATA: ChartGroup8SparkPoint[] = [
  { labelKey: "chartGroup8Month1", users: 18.2 },
  { labelKey: "chartGroup8Month2", users: 18.9 },
  { labelKey: "chartGroup8Month3", users: 19.4 },
  { labelKey: "chartGroup8Month4", users: 19.8 },
  { labelKey: "chartGroup8Month5", users: 20.5 },
  { labelKey: "chartGroup8Month6", users: 20.9 },
  { labelKey: "chartGroup8Month7", users: 21.6 },
  { labelKey: "chartGroup8Month8", users: 22.1 },
  { labelKey: "chartGroup8Month9", users: 22.7 },
  { labelKey: "chartGroup8Month10", users: 23.4 },
  { labelKey: "chartGroup8Month11", users: 24.1 },
  { labelKey: "chartGroup8Month12", users: 24.8 },
];

export function BentoMixedCharts() {
  const t = useMessages("pages") as unknown as PagesWithChartGroupMessages;
  const cg = t.chartGroup;
  const lineData = CHART_GROUP_8_LINE_DATA.map((p) => ({
    label: cg[p.labelKey],
    revenue: p.revenue,
    expenses: p.expenses,
  }));
  const donutData = CHART_GROUP_8_DONUT_DATA.map((p) => ({
    label: cg[p.labelKey],
    value: p.value,
  }));
  const barData = CHART_GROUP_8_BAR_DATA.map((p) => ({
    label: cg[p.labelKey],
    visits: p.visits,
  }));
  const sparkData = CHART_GROUP_8_SPARK_DATA.map((p) => ({
    label: cg[p.labelKey],
    users: p.users,
  }));

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {cg.chartGroup8Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {cg.chartGroup8Description}
          </Typography>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="border-border bg-surface flex flex-col gap-4 rounded-3xl border p-6 md:col-span-2">
            <Typography
              variant="h3"
              className="text-lg font-medium tracking-tight"
            >
              {cg.chartGroup8Card1Title}
            </Typography>
            <Chart type="line" data={lineData} height={260}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                name={cg.chartGroup8SeriesRevenue}
                stroke="hsl(var(--brand))"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                name={cg.chartGroup8SeriesExpenses}
                stroke="hsl(var(--muted))"
                strokeWidth={2}
              />
            </Chart>
          </div>
          <div className="border-border bg-surface flex flex-col gap-4 rounded-3xl border p-6">
            <Typography
              variant="h3"
              className="text-lg font-medium tracking-tight"
            >
              {cg.chartGroup8Card2Title}
            </Typography>
            <Chart type="pie" data={donutData} height={200}>
              <Tooltip />
              <Pie
                data={donutData}
                dataKey="value"
                nameKey="label"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
              >
                {donutData.map((segment) => (
                  <Cell
                    key={segment.label}
                    fill={
                      CHART_GROUP_8_DONUT_COLORS[donutData.indexOf(segment)]
                    }
                  />
                ))}
              </Pie>
            </Chart>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {CHART_GROUP_8_DONUT_DATA.map((segment, index) => (
                <span
                  key={segment.labelKey}
                  className="text-muted flex items-center gap-1.5 text-xs"
                >
                  <span
                    className="size-2 rounded-full"
                    style={{
                      backgroundColor: CHART_GROUP_8_DONUT_COLORS[index],
                    }}
                  />
                  {cg[segment.labelKey]}
                </span>
              ))}
            </div>
          </div>
          <div className="border-border bg-surface flex flex-col gap-4 rounded-3xl border p-6">
            <Typography
              variant="h3"
              className="text-lg font-medium tracking-tight"
            >
              {cg.chartGroup8Card3Title}
            </Typography>
            <Chart type="bar" data={barData} height={200}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="visits"
                name={cg.chartGroup8SeriesVisits}
                fill="hsl(var(--brand))"
                radius={[6, 6, 0, 0]}
              />
            </Chart>
          </div>
          <div className="border-border bg-surface flex flex-col gap-4 rounded-3xl border p-6 md:col-span-2">
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-semibold tracking-tight">
                {cg.chartGroup8StatValue}
              </span>
              <span className="text-muted text-sm">
                {cg.chartGroup8StatLabel}
              </span>
            </div>
            <Chart type="line" data={sparkData} height={90}>
              <Line
                type="monotone"
                dataKey="users"
                stroke="hsl(var(--info))"
                strokeWidth={2}
                dot={false}
              />
            </Chart>
          </div>
        </div>
      </div>
    </section>
  );
}
