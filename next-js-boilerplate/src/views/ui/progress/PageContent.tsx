"use client";

import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { Card, CardTitle, CardContent } from "@/components/ui/Card";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/ui/PageContent-types";

interface KpiItem {
  id: string;
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  progress: number;
}

const KPIS: KpiItem[] = [
  {
    id: "revenue",
    title: "Revenue",
    value: "$128,430",
    trend: "+12%",
    trendUp: true,
    progress: 78,
  },
  {
    id: "users",
    title: "Users",
    value: "2,847",
    trend: "+8%",
    trendUp: true,
    progress: 65,
  },
  {
    id: "conversion",
    title: "Conversion Rate",
    value: "3.2%",
    trend: "-3%",
    trendUp: false,
    progress: 45,
  },
  {
    id: "session",
    title: "Avg. Session",
    value: "4m 32s",
    trend: "+5%",
    trendUp: true,
    progress: 82,
  },
];

const examples: UIExample[] = [
  {
    id: "progress-examples",
    title: "Progress Examples",
    description:
      "Progress bar with percentage label, indeterminate animation, and size scale.",
    render: () => (
      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Determinate</h3>
          <Progress value={60} showValueLabel className="max-w-sm" />
        </section>
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Indeterminate</h3>
          <Progress indeterminate className="max-w-sm" />
        </section>
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Size Scale</h3>
          <div className="flex w-full max-w-sm flex-col gap-3">
            <Progress value={75} size="sm" showValueLabel />
            <Progress value={50} size="md" showValueLabel />
            <Progress value={90} size="lg" showValueLabel />
          </div>
        </section>
      </div>
    ),
  },
  {
    id: "kpi-dashboard",
    title: "KPI Dashboard",
    description:
      "Four KPI cards with trend badges and progress bars in a 2x2 grid.",
    render: () => (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {KPIS.map((kpi) => (
          <Card key={kpi.id} variant="default" className="p-4">
            <CardTitle className="text-muted mb-1 text-sm font-medium">
              {kpi.title}
            </CardTitle>
            <div className="mb-3 flex items-baseline gap-3">
              <span className="text-2xl font-bold tabular-nums">
                {kpi.value}
              </span>
              <Badge
                variant={kpi.trendUp ? "success" : "error"}
                className="text-xs"
              >
                {kpi.trendUp ? "▲" : "▼"} {kpi.trend}
              </Badge>
            </div>
            <Progress value={kpi.progress} className="h-2" />
            <CardContent className="text-muted mt-1 p-0 text-xs">
              {kpi.progress}% of target
            </CardContent>
          </Card>
        ))}
      </div>
    ),
  },
  {
    id: "gallery",
    title: "Variant Gallery",
    description: "Progress bar across all theme variants and sizes.",
    render: () => (
      <VariantGallery
        variants={["default"]}
        sizes={["sm", "md", "lg"]}
        render={(_variant, size) => (
          <Progress
            value={65}
            className={size === "sm" ? "h-1" : size === "lg" ? "h-3" : "h-2"}
            data-size={size}
          />
        )}
      />
    ),
  },
];

export default function ProgressPage({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Progress"
      intro="A progress bar component."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
