"use client";

import {
  Chart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  Bar,
  Area,
} from "@/components/ui/Chart";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

const revenueData = [
  { month: "Jan", revenue: 4000, expenses: 2400 },
  { month: "Feb", revenue: 3000, expenses: 1398 },
  { month: "Mar", revenue: 9800, expenses: 2000 },
  { month: "Apr", revenue: 3908, expenses: 2780 },
  { month: "May", revenue: 4800, expenses: 1890 },
  { month: "Jun", revenue: 3800, expenses: 2390 },
];

function LineChartDemo() {
  return (
    <Chart type="line" data={revenueData} height={300}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="revenue" stroke="var(--brand)" />
      <Line type="monotone" dataKey="expenses" stroke="var(--muted)" />
    </Chart>
  );
}

function BarChartDemo() {
  return (
    <Chart type="bar" data={revenueData} height={300}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="revenue" fill="var(--brand)" />
      <Bar dataKey="expenses" fill="var(--muted)" />
    </Chart>
  );
}

function AreaChartDemo() {
  return (
    <Chart type="area" data={revenueData} height={300}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Area
        type="monotone"
        dataKey="revenue"
        stroke="var(--brand)"
        fill="var(--brand)"
        fillOpacity={0.2}
      />
      <Area
        type="monotone"
        dataKey="expenses"
        stroke="var(--muted)"
        fill="var(--muted)"
        fillOpacity={0.2}
      />
    </Chart>
  );
}

const examples: UIExample[] = [
  {
    id: "line",
    title: "Line Chart",
    description: "Track trends over time with lines.",
    render: () => <LineChartDemo />,
    code: `import { Chart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line } from "@/components/ui/Chart";

const data = [
  { month: "Jan", revenue: 4000, expenses: 2400 },
  { month: "Feb", revenue: 3000, expenses: 1398 },
  // ...
];

<Chart type="line" data={data} height={300}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="month" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Line type="monotone" dataKey="revenue" stroke="var(--brand)" />
  <Line type="monotone" dataKey="expenses" stroke="var(--muted)" />
</Chart>`,
  },
  {
    id: "bar",
    title: "Bar Chart",
    description: "Compare values across categories.",
    render: () => <BarChartDemo />,
    code: `import { Chart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar } from "@/components/ui/Chart";

<Chart type="bar" data={data} height={300}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="month" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Bar dataKey="revenue" fill="var(--brand)" />
  <Bar dataKey="expenses" fill="var(--muted)" />
</Chart>`,
  },
  {
    id: "area",
    title: "Area Chart",
    description: "Show volume with filled areas.",
    render: () => <AreaChartDemo />,
    code: `import { Chart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area } from "@/components/ui/Chart";

<Chart type="area" data={data} height={300}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="month" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Area type="monotone" dataKey="revenue" stroke="var(--brand)" fill="var(--brand)" fillOpacity={0.2} />
</Chart>`,
  },
];

export default function ChartPage({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Chart"
      intro="Charts built on Recharts. Wrap your data with ResponsiveContainer."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
