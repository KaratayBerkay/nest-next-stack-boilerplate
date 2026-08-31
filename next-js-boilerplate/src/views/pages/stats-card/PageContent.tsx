"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { TrendSparklineStatsCard } from "./TrendSparklineStatsCard";
import { ProgressRingStatsCard } from "./ProgressRingStatsCard";
import { MiniBarBreakdownStatsCard } from "./MiniBarBreakdownStatsCard";
import { PeriodComparisonStatsCard } from "./PeriodComparisonStatsCard";
import { StatusAccentStatsCard } from "./StatusAccentStatsCard";
import { ToggleMetricStatsCard } from "./ToggleMetricStatsCard";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function StatsCardPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.statsCard;

  const examples: UIExample[] = [
    {
      id: "stats-card-1",
      title: t.statsCard1TabTitle,
      description: t.statsCard1TabDescription,
      render: () => <TrendSparklineStatsCard />,
    },
    {
      id: "stats-card-2",
      title: t.statsCard2TabTitle,
      description: t.statsCard2TabDescription,
      render: () => <ProgressRingStatsCard />,
    },
    {
      id: "stats-card-3",
      title: t.statsCard3TabTitle,
      description: t.statsCard3TabDescription,
      render: () => <MiniBarBreakdownStatsCard />,
    },
    {
      id: "stats-card-4",
      title: t.statsCard4TabTitle,
      description: t.statsCard4TabDescription,
      render: () => <PeriodComparisonStatsCard />,
    },
    {
      id: "stats-card-5",
      title: t.statsCard5TabTitle,
      description: t.statsCard5TabDescription,
      render: () => <StatusAccentStatsCard />,
    },
    {
      id: "stats-card-6",
      title: t.statsCard6TabTitle,
      description: t.statsCard6TabDescription,
      render: () => <ToggleMetricStatsCard />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.statsCardTitle}
      intro={m.examples.statsCardDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="stats-card"
    />
  );
}
