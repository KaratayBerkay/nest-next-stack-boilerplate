"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { RevenueDashboard } from "./RevenueDashboard";
import { RevenueTransactionsDashboard } from "./RevenueTransactionsDashboard";
import { RevenueSparklinesDashboard } from "./RevenueSparklinesDashboard";
import { EcommerceSalesOrdersDashboard } from "./EcommerceSalesOrdersDashboard";
import { EcommerceTransactionsDashboard } from "./EcommerceTransactionsDashboard";
import { OperationsFulfillmentDashboard } from "./OperationsFulfillmentDashboard";
import { OrdersPerformanceDashboard } from "./OrdersPerformanceDashboard";
import { SalesMetricsDashboard } from "./SalesMetricsDashboard";
import { SalesAnalyticsDashboard } from "./SalesAnalyticsDashboard";
import { MultiPageNavigationDashboard } from "./MultiPageNavigationDashboard";
import { CohortHeatmapDashboard } from "./CohortHeatmapDashboard";
import { GlobalAnalyticsMapDashboard } from "./GlobalAnalyticsMapDashboard";
import { RealtimeSessionsDashboard } from "./RealtimeSessionsDashboard";
import { HotelBookingsPanelDashboard } from "./HotelBookingsPanelDashboard";
import { HotelRevenueWidgetsDashboard } from "./HotelRevenueWidgetsDashboard";
import { HotelMiniCalendarDashboard } from "./HotelMiniCalendarDashboard";
import { HotelBookingCalendarDashboard } from "./HotelBookingCalendarDashboard";
import { HotelOperationsDashboard } from "./HotelOperationsDashboard";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function DashboardPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.dashboard;

  const examples: UIExample[] = [
    {
      id: "dashboard-1",
      title: t.dashboard1TabTitle,
      description: t.dashboard1TabDescription,
      render: () => <RevenueDashboard />,
    },
    {
      id: "dashboard-2",
      title: t.dashboard2TabTitle,
      description: t.dashboard2TabDescription,
      render: () => <RevenueTransactionsDashboard />,
    },
    {
      id: "dashboard-3",
      title: t.dashboard3TabTitle,
      description: t.dashboard3TabDescription,
      render: () => <RevenueSparklinesDashboard />,
    },
    {
      id: "dashboard-4",
      title: t.dashboard4TabTitle,
      description: t.dashboard4TabDescription,
      render: () => <EcommerceSalesOrdersDashboard />,
    },
    {
      id: "dashboard-5",
      title: t.dashboard5TabTitle,
      description: t.dashboard5TabDescription,
      render: () => <EcommerceTransactionsDashboard />,
    },
    {
      id: "dashboard-6",
      title: t.dashboard6TabTitle,
      description: t.dashboard6TabDescription,
      render: () => <OperationsFulfillmentDashboard />,
    },
    {
      id: "dashboard-7",
      title: t.dashboard7TabTitle,
      description: t.dashboard7TabDescription,
      render: () => <OrdersPerformanceDashboard />,
    },
    {
      id: "dashboard-8",
      title: t.dashboard8TabTitle,
      description: t.dashboard8TabDescription,
      render: () => <SalesMetricsDashboard />,
    },
    {
      id: "dashboard-9",
      title: t.dashboard9TabTitle,
      description: t.dashboard9TabDescription,
      render: () => <SalesAnalyticsDashboard />,
    },
    {
      id: "dashboard-10",
      title: t.dashboard10TabTitle,
      description: t.dashboard10TabDescription,
      render: () => <MultiPageNavigationDashboard />,
    },
    {
      id: "dashboard-11",
      title: t.dashboard11TabTitle,
      description: t.dashboard11TabDescription,
      render: () => <CohortHeatmapDashboard />,
    },
    {
      id: "dashboard-12",
      title: t.dashboard12TabTitle,
      description: t.dashboard12TabDescription,
      render: () => <GlobalAnalyticsMapDashboard />,
    },
    {
      id: "dashboard-13",
      title: t.dashboard13TabTitle,
      description: t.dashboard13TabDescription,
      render: () => <RealtimeSessionsDashboard />,
    },
    {
      id: "dashboard-14",
      title: t.dashboard14TabTitle,
      description: t.dashboard14TabDescription,
      render: () => <HotelBookingsPanelDashboard />,
    },
    {
      id: "dashboard-15",
      title: t.dashboard15TabTitle,
      description: t.dashboard15TabDescription,
      render: () => <HotelRevenueWidgetsDashboard />,
    },
    {
      id: "dashboard-16",
      title: t.dashboard16TabTitle,
      description: t.dashboard16TabDescription,
      render: () => <HotelMiniCalendarDashboard />,
    },
    {
      id: "dashboard-17",
      title: t.dashboard17TabTitle,
      description: t.dashboard17TabDescription,
      render: () => <HotelBookingCalendarDashboard />,
    },
    {
      id: "dashboard-18",
      title: t.dashboard18TabTitle,
      description: t.dashboard18TabDescription,
      render: () => <HotelOperationsDashboard />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.dashboardTitle}
      intro={m.examples.dashboardDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="dashboard"
    />
  );
}
