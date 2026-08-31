"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { TintedFeatureComparison } from "./TintedFeatureComparison";
import { DualChecklists } from "./DualChecklists";
import { ThreeColumnComparison } from "./ThreeColumnComparison";
import { CloudVsOnSite } from "./CloudVsOnSite";
import { SideBySideImages } from "./SideBySideImages";
import { TabbedFeatureTable } from "./TabbedFeatureTable";
import { CompactComparisonTable } from "./CompactComparisonTable";
import { FrameworkChecklist } from "./FrameworkChecklist";
import { MetricTableAnalysis } from "./MetricTableAnalysis";
import { LegacyVsModern } from "./LegacyVsModern";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function ComparePageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.compare;

  const examples: UIExample[] = [
    {
      id: "compare-1",
      title: t.compare1TabTitle,
      description: t.compare1TabDescription,
      render: () => <TintedFeatureComparison />,
    },
    {
      id: "compare-2",
      title: t.compare2TabTitle,
      description: t.compare2TabDescription,
      render: () => <DualChecklists />,
    },
    {
      id: "compare-3",
      title: t.compare3TabTitle,
      description: t.compare3TabDescription,
      render: () => <ThreeColumnComparison />,
    },
    {
      id: "compare-4",
      title: t.compare4TabTitle,
      description: t.compare4TabDescription,
      render: () => <CloudVsOnSite />,
    },
    {
      id: "compare-5",
      title: t.compare5TabTitle,
      description: t.compare5TabDescription,
      render: () => <SideBySideImages />,
    },
    {
      id: "compare-6",
      title: t.compare6TabTitle,
      description: t.compare6TabDescription,
      render: () => <TabbedFeatureTable />,
    },
    {
      id: "compare-7",
      title: t.compare7TabTitle,
      description: t.compare7TabDescription,
      render: () => <CompactComparisonTable />,
    },
    {
      id: "compare-8",
      title: t.compare8TabTitle,
      description: t.compare8TabDescription,
      render: () => <FrameworkChecklist />,
    },
    {
      id: "compare-9",
      title: t.compare9TabTitle,
      description: t.compare9TabDescription,
      render: () => <MetricTableAnalysis />,
    },
    {
      id: "compare-10",
      title: t.compare10TabTitle,
      description: t.compare10TabDescription,
      render: () => <LegacyVsModern />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.compareTitle}
      intro={m.examples.compareDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="compare"
    />
  );
}
