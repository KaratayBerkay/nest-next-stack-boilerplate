"use client";

import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithChartCardMessages } from "@/types/pages/chart-card/ChartCardMessages-types";

const PRODUCT_DATA = [
  { price: 19, rating: 3.8 },
  { price: 29, rating: 4.1 },
  { price: 39, rating: 4.4 },
  { price: 49, rating: 4.0 },
  { price: 59, rating: 4.6 },
  { price: 69, rating: 4.3 },
  { price: 79, rating: 4.7 },
  { price: 89, rating: 4.2 },
  { price: 99, rating: 4.8 },
  { price: 109, rating: 4.5 },
] as const;

export function PriceRatingScatterChartCard() {
  const t = useMessages("pages") as unknown as PagesWithChartCardMessages;
  const c = t.chartCard;

  return (
    <div className="border-border bg-surface flex w-full items-center justify-center rounded-2xl border p-6 sm:p-10">
      <div className="border-border bg-bg w-full max-w-md rounded-2xl border p-6 shadow-xs">
        <Typography variant="h4">{c.chartCard23Title}</Typography>
        <div className="mt-4 h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="price"
                name={c.chartCard23XAxisLabel}
                unit="$"
              />
              <YAxis
                type="number"
                dataKey="rating"
                name={c.chartCard23YAxisLabel}
                domain={[3, 5]}
              />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={PRODUCT_DATA} fill="var(--brand)" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
