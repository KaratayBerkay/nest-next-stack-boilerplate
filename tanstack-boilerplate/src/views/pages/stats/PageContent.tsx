"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { AnimatedCountBandStats } from "./AnimatedCountBandStats";
import { SplitTrendChartStats } from "./SplitTrendChartStats";
import { SparklineMetricRowStats } from "./SparklineMetricRowStats";
import { HeroStatWithRailStats } from "./HeroStatWithRailStats";
import { IconDescriptionGridStats } from "./IconDescriptionGridStats";
import { BeforeAfterShiftStats } from "./BeforeAfterShiftStats";
import { GrowthTimelineStats } from "./GrowthTimelineStats";
import { SegmentedToggleStats } from "./SegmentedToggleStats";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function StatsPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.stats;

  const examples: UIExample[] = [
    {
      id: "stats-1",
      title: t.stats1TabTitle,
      description: t.stats1TabDescription,
      render: () => <AnimatedCountBandStats />,
    },
    {
      id: "stats-2",
      title: t.stats2TabTitle,
      description: t.stats2TabDescription,
      render: () => <SplitTrendChartStats />,
    },
    {
      id: "stats-3",
      title: t.stats3TabTitle,
      description: t.stats3TabDescription,
      render: () => <SparklineMetricRowStats />,
    },
    {
      id: "stats-4",
      title: t.stats4TabTitle,
      description: t.stats4TabDescription,
      render: () => <HeroStatWithRailStats />,
    },
    {
      id: "stats-5",
      title: t.stats5TabTitle,
      description: t.stats5TabDescription,
      render: () => <IconDescriptionGridStats />,
    },
    {
      id: "stats-6",
      title: t.stats6TabTitle,
      description: t.stats6TabDescription,
      render: () => <BeforeAfterShiftStats />,
    },
    {
      id: "stats-7",
      title: t.stats7TabTitle,
      description: t.stats7TabDescription,
      render: () => <GrowthTimelineStats />,
    },
    {
      id: "stats-8",
      title: t.stats8TabTitle,
      description: t.stats8TabDescription,
      render: () => <SegmentedToggleStats />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.statsTitle}
      intro={m.examples.statsDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="stats"
    />
  );
}
