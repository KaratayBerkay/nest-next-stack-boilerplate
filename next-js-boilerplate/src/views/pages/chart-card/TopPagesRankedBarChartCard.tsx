"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from "recharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  ChartCardMessages,
  PagesWithChartCardMessages,
} from "@/types/pages/chart-card/ChartCardMessages-types";

type Metric = "views" | "avgTime";

interface PageDatum {
  labelKey: string;
  views: number;
  avgTime: number;
}

interface MappedDatum extends Record<string, unknown> {
  page: string;
  views: number;
  avgTime: number;
}

const PAGE_DATA: PageDatum[] = [
  { labelKey: "chartCard4Page1", views: 18400, avgTime: 210 },
  { labelKey: "chartCard4Page2", views: 14200, avgTime: 340 },
  { labelKey: "chartCard4Page3", views: 11900, avgTime: 265 },
  { labelKey: "chartCard4Page4", views: 8600, avgTime: 155 },
  { labelKey: "chartCard4Page5", views: 6300, avgTime: 190 },
];

function getData(c: ChartCardMessages): MappedDatum[] {
  return PAGE_DATA.map((item) => ({
    page: c[item.labelKey],
    views: item.views,
    avgTime: item.avgTime,
  }));
}

function handleMetricChange(
  value: string,
  setMetric: Dispatch<SetStateAction<Metric>>,
) {
  if (value === "views" || value === "avgTime") setMetric(value);
}

export function TopPagesRankedBarChartCard() {
  const t = useMessages("pages") as unknown as PagesWithChartCardMessages;
  const c = t.chartCard;
  const [metric, setMetric] = useState<Metric>("views");
  const data = getData(c);

  return (
    <div className="border-border bg-surface flex w-full items-center justify-center rounded-2xl border p-6 sm:p-10">
      <div className="border-border bg-bg w-full max-w-lg rounded-2xl border p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Typography variant="h4">{c.chartCard4Title}</Typography>
          <Tabs
            value={metric}
            onValueChange={(value) => handleMetricChange(value, setMetric)}
          >
            <TabsList>
              <TabsTrigger value="views">{c.chartCard4MetricViews}</TabsTrigger>
              <TabsTrigger value="avgTime">
                {c.chartCard4MetricAvgTime}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="mt-5 h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 16, bottom: 4, left: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis type="category" dataKey="page" width={96} />
              <Tooltip />
              <Bar
                dataKey={metric}
                name={
                  metric === "views"
                    ? c.chartCard4MetricViews
                    : c.chartCard4MetricAvgTime
                }
                fill="var(--brand)"
                radius={[0, 6, 6, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
