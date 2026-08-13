"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconRefresh,
  IconShoppingBag,
  IconShoppingCart,
  IconTrendingUp,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Cell } from "recharts";
import {
  Bar,
  CartesianGrid,
  Chart,
  Line,
  Pie,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/Chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDashboardMessages } from "@/types/pages/dashboard/DashboardMessages-types";

type DashboardMessages = PagesWithDashboardMessages["dashboard"];

const BRAND = "hsl(var(--brand))" as const;
const INFO = "hsl(var(--info))" as const;
const SUCCESS = "hsl(var(--success))" as const;
const WARNING = "hsl(var(--warning))" as const;
const MUTED = "hsl(var(--muted))" as const;

const CATEGORY_COLORS = [BRAND, INFO, SUCCESS, WARNING] as const;

interface MonthlyPoint {
  monthKey: string;
  sales: number;
  orders: number;
}

interface MappedMonthlyPoint extends Record<string, unknown> {
  month: string;
  sales: number;
  orders: number;
}

interface DashboardStat {
  icon: Icon;
  trend: "up" | "down";
  labelKey: string;
  valueKey: string;
  deltaKey: string;
}

interface CategorySlice {
  labelKey: string;
  value: number;
}

interface MappedCategorySlice extends Record<string, unknown> {
  name: string;
  value: number;
}

interface ProductRow {
  nameKey: string;
  unitsKey: string;
  revenueKey: string;
  share: number;
}

const MONTHLY_DATA: MonthlyPoint[] = [
  { monthKey: "dashboard4Month1", sales: 14200, orders: 610 },
  { monthKey: "dashboard4Month2", sales: 16800, orders: 704 },
  { monthKey: "dashboard4Month3", sales: 15400, orders: 652 },
  { monthKey: "dashboard4Month4", sales: 18900, orders: 781 },
  { monthKey: "dashboard4Month5", sales: 17600, orders: 742 },
  { monthKey: "dashboard4Month6", sales: 21300, orders: 862 },
  { monthKey: "dashboard4Month7", sales: 19800, orders: 812 },
  { monthKey: "dashboard4Month8", sales: 23600, orders: 934 },
  { monthKey: "dashboard4Month9", sales: 22100, orders: 891 },
  { monthKey: "dashboard4Month10", sales: 25400, orders: 1002 },
  { monthKey: "dashboard4Month11", sales: 26800, orders: 1063 },
  { monthKey: "dashboard4Month12", sales: 29400, orders: 1174 },
];

const STATS: DashboardStat[] = [
  {
    icon: IconShoppingBag,
    trend: "up",
    labelKey: "dashboard4Stat1Label",
    valueKey: "dashboard4Stat1Value",
    deltaKey: "dashboard4Stat1Delta",
  },
  {
    icon: IconShoppingCart,
    trend: "up",
    labelKey: "dashboard4Stat2Label",
    valueKey: "dashboard4Stat2Value",
    deltaKey: "dashboard4Stat2Delta",
  },
  {
    icon: IconTrendingUp,
    trend: "up",
    labelKey: "dashboard4Stat3Label",
    valueKey: "dashboard4Stat3Value",
    deltaKey: "dashboard4Stat3Delta",
  },
  {
    icon: IconRefresh,
    trend: "down",
    labelKey: "dashboard4Stat4Label",
    valueKey: "dashboard4Stat4Value",
    deltaKey: "dashboard4Stat4Delta",
  },
];

const CATEGORIES: CategorySlice[] = [
  { labelKey: "dashboard4Category1", value: 42 },
  { labelKey: "dashboard4Category2", value: 26 },
  { labelKey: "dashboard4Category3", value: 19 },
  { labelKey: "dashboard4Category4", value: 13 },
];

const PRODUCTS: ProductRow[] = [
  {
    nameKey: "dashboard4Product1Name",
    unitsKey: "dashboard4Product1Units",
    revenueKey: "dashboard4Product1Revenue",
    share: 34,
  },
  {
    nameKey: "dashboard4Product2Name",
    unitsKey: "dashboard4Product2Units",
    revenueKey: "dashboard4Product2Revenue",
    share: 26,
  },
  {
    nameKey: "dashboard4Product3Name",
    unitsKey: "dashboard4Product3Units",
    revenueKey: "dashboard4Product3Revenue",
    share: 21,
  },
  {
    nameKey: "dashboard4Product4Name",
    unitsKey: "dashboard4Product4Units",
    revenueKey: "dashboard4Product4Revenue",
    share: 17,
  },
];

function getChartData(d: DashboardMessages): MappedMonthlyPoint[] {
  return MONTHLY_DATA.map((point) => ({
    month: d[point.monthKey],
    sales: point.sales,
    orders: point.orders,
  }));
}

function getCategoryData(d: DashboardMessages): MappedCategorySlice[] {
  return CATEGORIES.map((slice) => ({
    name: d[slice.labelKey],
    value: slice.value,
  }));
}

function getToneClasses(trend: DashboardStat["trend"]) {
  return trend === "up"
    ? "bg-success/10 text-success"
    : "bg-error/10 text-error";
}

function handleTabChange(
  value: string,
  setActiveTab: Dispatch<SetStateAction<string>>,
) {
  setActiveTab(value);
}

function StatCard({ stat, d }: { stat: DashboardStat; d: DashboardMessages }) {
  const IconArrow = stat.trend === "up" ? IconArrowUpRight : IconArrowDownRight;
  return (
    <div className="border-border bg-surface flex flex-col gap-3 rounded-2xl border p-6">
      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-full",
            getToneClasses(stat.trend),
          )}
        >
          <stat.icon size={18} aria-hidden="true" />
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
            getToneClasses(stat.trend),
          )}
        >
          <IconArrow size={14} aria-hidden="true" />
          {d[stat.deltaKey]}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <Typography variant="caption">{d[stat.labelKey]}</Typography>
        <span className="text-2xl font-semibold tracking-tight">
          {d[stat.valueKey]}
        </span>
      </div>
    </div>
  );
}

function CategoryDonut({ d }: { d: DashboardMessages }) {
  const categoryData = getCategoryData(d) as unknown as Record<
    string,
    unknown
  >[];
  return (
    <div className="border-border bg-surface flex flex-col gap-5 rounded-2xl border p-6">
      <Typography variant="h5">{d.dashboard4CategoriesTitle}</Typography>
      <Chart type="pie" data={categoryData} height={220}>
        <Pie
          data={categoryData}
          dataKey="value"
          nameKey="name"
          innerRadius={58}
          outerRadius={84}
          paddingAngle={3}
        >
          {CATEGORIES.map((slice, index) => (
            <Cell
              key={slice.labelKey}
              fill={CATEGORY_COLORS[index]}
              stroke="transparent"
            />
          ))}
        </Pie>
        <Tooltip />
      </Chart>
      <div className="flex flex-col gap-2.5">
        {CATEGORIES.map((slice, index) => (
          <div
            key={slice.labelKey}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[index] }}
                aria-hidden="true"
              />
              {d[slice.labelKey]}
            </span>
            <span className="text-muted tabular-nums">{slice.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BestSellersTable({ d }: { d: DashboardMessages }) {
  return (
    <div className="border-border bg-surface flex flex-col gap-5 rounded-2xl border p-6">
      <Typography variant="h5">{d.dashboard4ProductsTitle}</Typography>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{d.dashboard4ColumnProduct}</TableHead>
            <TableHead className="text-right">
              {d.dashboard4ColumnUnits}
            </TableHead>
            <TableHead className="text-right">
              {d.dashboard4ColumnRevenue}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {PRODUCTS.map((product) => (
            <TableRow key={product.nameKey}>
              <TableCell>
                <div className="flex flex-col gap-1.5">
                  <span className="font-medium">{d[product.nameKey]}</span>
                  <div className="w-28">
                    <div
                      className="bg-muted h-1.5 rounded-full"
                      role="presentation"
                    >
                      <div
                        className="bg-brand h-full rounded-full"
                        style={{ width: `${product.share}%` }}
                      />
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted text-right tabular-nums">
                {d[product.unitsKey]}
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {d[product.revenueKey]}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function EcommerceSalesOrdersDashboard() {
  const t = useMessages("pages") as unknown as PagesWithDashboardMessages;
  const d = t.dashboard;
  const [activeTab, setActiveTab] = useState<string>("sales");
  const chartData = getChartData(d) as unknown as Record<string, unknown>[];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.dashboard4Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dashboard4Description}
          </Typography>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <StatCard key={stat.labelKey} stat={stat} d={d} />
          ))}
        </div>
        <div className="border-border bg-surface flex flex-col gap-6 rounded-2xl border p-6">
          <Tabs
            value={activeTab}
            onValueChange={(value) => handleTabChange(value, setActiveTab)}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Typography variant="h5">{d.dashboard4ChartTitle}</Typography>
              <TabsList>
                <TabsTrigger value="sales">{d.dashboard4TabSales}</TabsTrigger>
                <TabsTrigger value="orders">
                  {d.dashboard4TabOrders}
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="sales" className="mt-6">
              <Chart type="line" data={chartData} height={280}>
                <CartesianGrid strokeDasharray="3 3" stroke={MUTED} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="sales"
                  name={d.dashboard4SeriesSales}
                  stroke={BRAND}
                  strokeWidth={2}
                />
              </Chart>
            </TabsContent>
            <TabsContent value="orders" className="mt-6">
              <Chart type="bar" data={chartData} height={280}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={MUTED}
                  vertical={false}
                />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="orders"
                  name={d.dashboard4SeriesOrders}
                  fill={INFO}
                  radius={[4, 4, 0, 0]}
                />
              </Chart>
            </TabsContent>
          </Tabs>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <CategoryDonut d={d} />
          <BestSellersTable d={d} />
        </div>
      </div>
    </section>
  );
}
