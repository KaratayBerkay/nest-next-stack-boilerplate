"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { HubAndSpokeDiagramIntegration } from "./HubAndSpokeDiagramIntegration";
import { SearchableDirectoryGridIntegration } from "./SearchableDirectoryGridIntegration";
import { ConnectInStepsIntegration } from "./ConnectInStepsIntegration";
import { CategoryTabbedShowcaseIntegration } from "./CategoryTabbedShowcaseIntegration";
import { EcosystemStatsGridIntegration } from "./EcosystemStatsGridIntegration";
import { BeforeAfterComparisonIntegration } from "./BeforeAfterComparisonIntegration";
import { ScrollingLogoWallIntegration } from "./ScrollingLogoWallIntegration";
import { DockSpotlightShowcaseIntegration } from "./DockSpotlightShowcaseIntegration";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function IntegrationPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.integration;

  const examples: UIExample[] = [
    {
      id: "integration-1",
      title: t.integration1TabTitle,
      description: t.integration1TabDescription,
      render: () => <HubAndSpokeDiagramIntegration />,
    },
    {
      id: "integration-2",
      title: t.integration2TabTitle,
      description: t.integration2TabDescription,
      render: () => <SearchableDirectoryGridIntegration />,
    },
    {
      id: "integration-3",
      title: t.integration3TabTitle,
      description: t.integration3TabDescription,
      render: () => <ConnectInStepsIntegration />,
    },
    {
      id: "integration-4",
      title: t.integration4TabTitle,
      description: t.integration4TabDescription,
      render: () => <CategoryTabbedShowcaseIntegration />,
    },
    {
      id: "integration-5",
      title: t.integration5TabTitle,
      description: t.integration5TabDescription,
      render: () => <EcosystemStatsGridIntegration />,
    },
    {
      id: "integration-6",
      title: t.integration6TabTitle,
      description: t.integration6TabDescription,
      render: () => <BeforeAfterComparisonIntegration />,
    },
    {
      id: "integration-7",
      title: t.integration7TabTitle,
      description: t.integration7TabDescription,
      render: () => <ScrollingLogoWallIntegration />,
    },
    {
      id: "integration-8",
      title: t.integration8TabTitle,
      description: t.integration8TabDescription,
      render: () => <DockSpotlightShowcaseIntegration />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.integrationTitle}
      intro={m.examples.integrationDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="integration"
    />
  );
}
