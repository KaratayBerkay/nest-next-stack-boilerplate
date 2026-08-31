"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { TabFilteredGridResources } from "./TabFilteredGridResources";
import { SidebarSearchResources } from "./SidebarSearchResources";
import { FeaturedSplitResources } from "./FeaturedSplitResources";
import { GroupedLinkListResources } from "./GroupedLinkListResources";
import { StatsCardGridResources } from "./StatsCardGridResources";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function ResourcesPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.resources;

  const examples: UIExample[] = [
    {
      id: "resources-1",
      title: t.resources1TabTitle,
      description: t.resources1TabDescription,
      render: () => <TabFilteredGridResources />,
    },
    {
      id: "resources-2",
      title: t.resources2TabTitle,
      description: t.resources2TabDescription,
      render: () => <SidebarSearchResources />,
    },
    {
      id: "resources-3",
      title: t.resources3TabTitle,
      description: t.resources3TabDescription,
      render: () => <FeaturedSplitResources />,
    },
    {
      id: "resources-4",
      title: t.resources4TabTitle,
      description: t.resources4TabDescription,
      render: () => <GroupedLinkListResources />,
    },
    {
      id: "resources-5",
      title: t.resources5TabTitle,
      description: t.resources5TabDescription,
      render: () => <StatsCardGridResources />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.resourcesTitle}
      intro={m.examples.resourcesDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="resources"
    />
  );
}
