"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

interface StatTile {
  label: string;
  value: string;
  trend: number;
}

const periodData: Record<string, StatTile[]> = {
  day: [
    { label: "Revenue", value: "$1,234", trend: 12 },
    { label: "Users", value: "56", trend: 8 },
    { label: "Orders", value: "23", trend: -3 },
  ],
  week: [
    { label: "Revenue", value: "$8,901", trend: 15 },
    { label: "Users", value: "412", trend: 22 },
    { label: "Orders", value: "178", trend: 10 },
  ],
  month: [
    { label: "Revenue", value: "$34,567", trend: 24 },
    { label: "Users", value: "1,890", trend: 18 },
    { label: "Orders", value: "745", trend: 31 },
  ],
};

export function DashboardPeriodsTab() {
  const [period, setPeriod] = useState("day");
  const tiles = periodData[period] ?? [];

  return (
    <div className="space-y-4">
      <div className="flex gap-1">
        {["day", "week", "month"].map((p) => (
          <Button
            key={p}
            variant={period === p ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod(p)}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {tiles.map((tile) => (
          <Card key={tile.label}>
            <CardHeader>
              <CardTitle>{tile.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{tile.value}</p>
              <span
                className={cn(
                  "text-sm",
                  tile.trend > 0 ? "text-success" : "text-error",
                )}
              >
                {tile.trend > 0 ? "↑" : "↓"} {Math.abs(tile.trend)}%
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
