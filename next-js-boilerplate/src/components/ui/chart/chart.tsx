import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  AreaChart,
  PieChart,
} from "recharts";
import { cn } from "@/lib/cn";
import type { ChartProps } from "@/types/ui/Chart-types";

export type { ChartType } from "@/types/ui/Chart-types";

export function Chart({
  type,
  data,
  width = "100%",
  height = 300,
  className,
  children,
}: ChartProps) {
  const chartProps = { data, width, height };

  const ChartComponent = {
    line: LineChart,
    bar: BarChart,
    area: AreaChart,
    pie: PieChart,
  }[type];

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width={width} height={height}>
        <ChartComponent {...chartProps}>{children}</ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}
