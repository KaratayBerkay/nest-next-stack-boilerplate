"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Chart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line,
  Bar,
  Area,
} from "@/components/ui/Chart";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  ChartGroupMessages,
  PagesWithChartGroupMessages,
} from "@/types/pages/chart-group/ChartGroupMessages-types";

interface TabChartSourceDatum {
  monthKey: string;
  revenue: number;
  orders: number;
  customers: number;
}

interface TabChartDatum {
  month: string;
  revenue: number;
  orders: number;
  customers: number;
}

const TAB_CHART_DATA: TabChartSourceDatum[] = [
  { monthKey: "chartGroup4Month1", revenue: 4200, orders: 240, customers: 620 },
  { monthKey: "chartGroup4Month2", revenue: 3800, orders: 210, customers: 540 },
  { monthKey: "chartGroup4Month3", revenue: 5100, orders: 290, customers: 710 },
  { monthKey: "chartGroup4Month4", revenue: 4800, orders: 270, customers: 680 },
  { monthKey: "chartGroup4Month5", revenue: 6100, orders: 340, customers: 820 },
  { monthKey: "chartGroup4Month6", revenue: 5700, orders: 320, customers: 760 },
  { monthKey: "chartGroup4Month7", revenue: 6900, orders: 380, customers: 940 },
  {
    monthKey: "chartGroup4Month8",
    revenue: 7400,
    orders: 410,
    customers: 1020,
  },
  { monthKey: "chartGroup4Month9", revenue: 6600, orders: 370, customers: 890 },
  {
    monthKey: "chartGroup4Month10",
    revenue: 7900,
    orders: 440,
    customers: 1130,
  },
  {
    monthKey: "chartGroup4Month11",
    revenue: 8500,
    orders: 470,
    customers: 1260,
  },
  {
    monthKey: "chartGroup4Month12",
    revenue: 9200,
    orders: 510,
    customers: 1380,
  },
];

function getTabChartData(cg: ChartGroupMessages): TabChartDatum[] {
  return TAB_CHART_DATA.map((item) => ({
    month: cg[item.monthKey],
    revenue: item.revenue,
    orders: item.orders,
    customers: item.customers,
  }));
}

function handleTabChange(
  value: string,
  setActiveTab: Dispatch<SetStateAction<string>>,
) {
  setActiveTab(value);
}

export function TabChartView() {
  const t = useMessages("pages") as unknown as PagesWithChartGroupMessages;
  const cg = t.chartGroup;
  const [activeTab, setActiveTab] = useState<string>("revenue");
  const chartData = getTabChartData(cg) as unknown as Record<string, unknown>[];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {cg.chartGroup4Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {cg.chartGroup4Description}
          </Typography>
        </div>
        <div className="border-border bg-surface rounded-3xl border p-6 lg:p-8">
          <Tabs
            value={activeTab}
            onValueChange={(value) => handleTabChange(value, setActiveTab)}
          >
            <TabsList>
              <TabsTrigger value="revenue">
                {cg.chartGroup4Tab1Label}
              </TabsTrigger>
              <TabsTrigger value="orders">
                {cg.chartGroup4Tab2Label}
              </TabsTrigger>
              <TabsTrigger value="customers">
                {cg.chartGroup4Tab3Label}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="revenue" className="mt-6">
              <Chart type="line" data={chartData} height={320}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name={cg.chartGroup4Tab1Label}
                  stroke="hsl(var(--brand))"
                />
              </Chart>
            </TabsContent>
            <TabsContent value="orders" className="mt-6">
              <Chart type="bar" data={chartData} height={320}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="orders"
                  name={cg.chartGroup4Tab2Label}
                  fill="hsl(var(--brand))"
                />
              </Chart>
            </TabsContent>
            <TabsContent value="customers" className="mt-6">
              <Chart type="area" data={chartData} height={320}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="customers"
                  name={cg.chartGroup4Tab3Label}
                  stroke="hsl(var(--brand))"
                  fill="hsl(var(--brand))"
                  fillOpacity={0.2}
                />
              </Chart>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
