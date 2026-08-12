"use client";

import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { TwoChartsSideBySide } from "./TwoChartsSideBySide";
import { MainWithDetailCharts } from "./MainWithDetailCharts";
import { MainWithWeeklyTrends } from "./MainWithWeeklyTrends";
import { TabChartView } from "./TabChartView";
import { YearOverYearComparison } from "./YearOverYearComparison";
import { DonutBarPair } from "./DonutBarPair";
import { StatsRowChartBelow } from "./StatsRowChartBelow";
import { BentoMixedCharts } from "./BentoMixedCharts";
import { DropdownChartView } from "./DropdownChartView";
import { InfrastructureMonitoring } from "./InfrastructureMonitoring";
import { RevenueDateRangePicker } from "./RevenueDateRangePicker";
import { DashboardDateControls } from "./DashboardDateControls";
import { AnalyticsBentoPresetCalendar } from "./AnalyticsBentoPresetCalendar";
import { AnalyticsBentoDashboard } from "./AnalyticsBentoDashboard";
import { BusinessBentoNavigation } from "./BusinessBentoNavigation";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function ChartGroupPageContent({ initialTab }: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.chartGroup;

  const examples: UIExample[] = [
    {
      id: "chart-group-1",
      title: t.chartGroup1TabTitle,
      description: t.chartGroup1TabDescription,
      render: () => <TwoChartsSideBySide />,
    },
    {
      id: "chart-group-2",
      title: t.chartGroup2TabTitle,
      description: t.chartGroup2TabDescription,
      render: () => <MainWithDetailCharts />,
    },
    {
      id: "chart-group-3",
      title: t.chartGroup3TabTitle,
      description: t.chartGroup3TabDescription,
      render: () => <MainWithWeeklyTrends />,
    },
    {
      id: "chart-group-4",
      title: t.chartGroup4TabTitle,
      description: t.chartGroup4TabDescription,
      render: () => <TabChartView />,
    },
    {
      id: "chart-group-5",
      title: t.chartGroup5TabTitle,
      description: t.chartGroup5TabDescription,
      render: () => <YearOverYearComparison />,
    },
    {
      id: "chart-group-6",
      title: t.chartGroup6TabTitle,
      description: t.chartGroup6TabDescription,
      render: () => <DonutBarPair />,
    },
    {
      id: "chart-group-7",
      title: t.chartGroup7TabTitle,
      description: t.chartGroup7TabDescription,
      render: () => <StatsRowChartBelow />,
    },
    {
      id: "chart-group-8",
      title: t.chartGroup8TabTitle,
      description: t.chartGroup8TabDescription,
      render: () => <BentoMixedCharts />,
    },
    {
      id: "chart-group-9",
      title: t.chartGroup9TabTitle,
      description: t.chartGroup9TabDescription,
      render: () => <DropdownChartView />,
    },
    {
      id: "chart-group-10",
      title: t.chartGroup10TabTitle,
      description: t.chartGroup10TabDescription,
      render: () => <InfrastructureMonitoring />,
    },
    {
      id: "chart-group-11",
      title: t.chartGroup11TabTitle,
      description: t.chartGroup11TabDescription,
      render: () => <RevenueDateRangePicker />,
    },
    {
      id: "chart-group-12",
      title: t.chartGroup12TabTitle,
      description: t.chartGroup12TabDescription,
      render: () => <DashboardDateControls />,
    },
    {
      id: "chart-group-13",
      title: t.chartGroup13TabTitle,
      description: t.chartGroup13TabDescription,
      render: () => <AnalyticsBentoPresetCalendar />,
    },
    {
      id: "chart-group-14",
      title: t.chartGroup14TabTitle,
      description: t.chartGroup14TabDescription,
      render: () => <AnalyticsBentoDashboard />,
    },
    {
      id: "chart-group-15",
      title: t.chartGroup15TabTitle,
      description: t.chartGroup15TabDescription,
      render: () => <BusinessBentoNavigation />,
    },
  ];

  return (
    <ExampleTabs
      title={m.examples.chartGroupTitle}
      intro={m.examples.chartGroupDescription}
      examples={examples}
      initialTab={initialTab}
    />
  );
}
