"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { RevenueTrendSparkChartCard } from "./RevenueTrendSparkChartCard";
import { VisitorsPeriodToggleChartCard } from "./VisitorsPeriodToggleChartCard";
import { ChannelSessionsBarChartCard } from "./ChannelSessionsBarChartCard";
import { TopPagesRankedBarChartCard } from "./TopPagesRankedBarChartCard";
import { TrafficSourceDonutChartCard } from "./TrafficSourceDonutChartCard";
import { PlanEngagementLineChartCard } from "./PlanEngagementLineChartCard";
import { UptimeFooterStatsChartCard } from "./UptimeFooterStatsChartCard";
import { CustomerGroupedBarChartCard } from "./CustomerGroupedBarChartCard";
import { SignupsStackedAreaChartCard } from "./SignupsStackedAreaChartCard";
import { TicketsStackedBarChartCard } from "./TicketsStackedBarChartCard";
import { DeviceMixStackedBarChartCard } from "./DeviceMixStackedBarChartCard";
import { OrdersMinimalBarChartCard } from "./OrdersMinimalBarChartCard";
import { NetChangeDivergingBarChartCard } from "./NetChangeDivergingBarChartCard";
import { ForecastRangeAreaChartCard } from "./ForecastRangeAreaChartCard";
import { CashFlowWaterfallChartCard } from "./CashFlowWaterfallChartCard";
import { GoalRadialProgressChartCard } from "./GoalRadialProgressChartCard";
import { HealthScoreGaugeChartCard } from "./HealthScoreGaugeChartCard";
import { ResourceRingsChartCard } from "./ResourceRingsChartCard";
import { WeekdayRadialBarChartCard } from "./WeekdayRadialBarChartCard";
import { TeamRadarChartCard } from "./TeamRadarChartCard";
import { SignupFunnelChartCard } from "./SignupFunnelChartCard";
import { RevenueTreemapChartCard } from "./RevenueTreemapChartCard";
import { PriceRatingScatterChartCard } from "./PriceRatingScatterChartCard";
import { CampaignBubbleChartCard } from "./CampaignBubbleChartCard";
import { RevenueTargetLineChartCard } from "./RevenueTargetLineChartCard";
import { KpiBulletGridChartCard } from "./KpiBulletGridChartCard";
import { LatencyThresholdZonesChartCard } from "./LatencyThresholdZonesChartCard";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function ChartCardPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.chartCard;

  const examples: UIExample[] = [
    {
      id: "chart-card-1",
      title: t.chartCard1TabTitle,
      description: t.chartCard1TabDescription,
      render: () => <RevenueTrendSparkChartCard />,
    },
    {
      id: "chart-card-2",
      title: t.chartCard2TabTitle,
      description: t.chartCard2TabDescription,
      render: () => <VisitorsPeriodToggleChartCard />,
    },
    {
      id: "chart-card-3",
      title: t.chartCard3TabTitle,
      description: t.chartCard3TabDescription,
      render: () => <ChannelSessionsBarChartCard />,
    },
    {
      id: "chart-card-4",
      title: t.chartCard4TabTitle,
      description: t.chartCard4TabDescription,
      render: () => <TopPagesRankedBarChartCard />,
    },
    {
      id: "chart-card-5",
      title: t.chartCard5TabTitle,
      description: t.chartCard5TabDescription,
      render: () => <TrafficSourceDonutChartCard />,
    },
    {
      id: "chart-card-6",
      title: t.chartCard6TabTitle,
      description: t.chartCard6TabDescription,
      render: () => <PlanEngagementLineChartCard />,
    },
    {
      id: "chart-card-7",
      title: t.chartCard7TabTitle,
      description: t.chartCard7TabDescription,
      render: () => <UptimeFooterStatsChartCard />,
    },
    {
      id: "chart-card-8",
      title: t.chartCard8TabTitle,
      description: t.chartCard8TabDescription,
      render: () => <CustomerGroupedBarChartCard />,
    },
    {
      id: "chart-card-9",
      title: t.chartCard9TabTitle,
      description: t.chartCard9TabDescription,
      render: () => <SignupsStackedAreaChartCard />,
    },
    {
      id: "chart-card-10",
      title: t.chartCard10TabTitle,
      description: t.chartCard10TabDescription,
      render: () => <TicketsStackedBarChartCard />,
    },
    {
      id: "chart-card-11",
      title: t.chartCard11TabTitle,
      description: t.chartCard11TabDescription,
      render: () => <DeviceMixStackedBarChartCard />,
    },
    {
      id: "chart-card-12",
      title: t.chartCard12TabTitle,
      description: t.chartCard12TabDescription,
      render: () => <OrdersMinimalBarChartCard />,
    },
    {
      id: "chart-card-13",
      title: t.chartCard13TabTitle,
      description: t.chartCard13TabDescription,
      render: () => <NetChangeDivergingBarChartCard />,
    },
    {
      id: "chart-card-14",
      title: t.chartCard14TabTitle,
      description: t.chartCard14TabDescription,
      render: () => <ForecastRangeAreaChartCard />,
    },
    {
      id: "chart-card-15",
      title: t.chartCard15TabTitle,
      description: t.chartCard15TabDescription,
      render: () => <CashFlowWaterfallChartCard />,
    },
    {
      id: "chart-card-16",
      title: t.chartCard16TabTitle,
      description: t.chartCard16TabDescription,
      render: () => <GoalRadialProgressChartCard />,
    },
    {
      id: "chart-card-17",
      title: t.chartCard17TabTitle,
      description: t.chartCard17TabDescription,
      render: () => <HealthScoreGaugeChartCard />,
    },
    {
      id: "chart-card-18",
      title: t.chartCard18TabTitle,
      description: t.chartCard18TabDescription,
      render: () => <ResourceRingsChartCard />,
    },
    {
      id: "chart-card-19",
      title: t.chartCard19TabTitle,
      description: t.chartCard19TabDescription,
      render: () => <WeekdayRadialBarChartCard />,
    },
    {
      id: "chart-card-20",
      title: t.chartCard20TabTitle,
      description: t.chartCard20TabDescription,
      render: () => <TeamRadarChartCard />,
    },
    {
      id: "chart-card-21",
      title: t.chartCard21TabTitle,
      description: t.chartCard21TabDescription,
      render: () => <SignupFunnelChartCard />,
    },
    {
      id: "chart-card-22",
      title: t.chartCard22TabTitle,
      description: t.chartCard22TabDescription,
      render: () => <RevenueTreemapChartCard />,
    },
    {
      id: "chart-card-23",
      title: t.chartCard23TabTitle,
      description: t.chartCard23TabDescription,
      render: () => <PriceRatingScatterChartCard />,
    },
    {
      id: "chart-card-24",
      title: t.chartCard24TabTitle,
      description: t.chartCard24TabDescription,
      render: () => <CampaignBubbleChartCard />,
    },
    {
      id: "chart-card-25",
      title: t.chartCard25TabTitle,
      description: t.chartCard25TabDescription,
      render: () => <RevenueTargetLineChartCard />,
    },
    {
      id: "chart-card-26",
      title: t.chartCard26TabTitle,
      description: t.chartCard26TabDescription,
      render: () => <KpiBulletGridChartCard />,
    },
    {
      id: "chart-card-27",
      title: t.chartCard27TabTitle,
      description: t.chartCard27TabDescription,
      render: () => <LatencyThresholdZonesChartCard />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.chartCardTitle}
      intro={m.examples.chartCardDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="chart-card"
    />
  );
}
