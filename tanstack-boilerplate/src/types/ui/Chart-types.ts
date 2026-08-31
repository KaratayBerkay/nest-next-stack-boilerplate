export type ChartType = "line" | "bar" | "area" | "pie";

export interface ChartProps {
  type: ChartType;
  data: Record<string, unknown>[];
  width?: number | `${number}%`;
  height?: number;
  className?: string;
  children: React.ReactNode;
}
