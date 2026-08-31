"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { ArticleFactsSidebarResource } from "./ArticleFactsSidebarResource";
import { HeroShareStatsResource } from "./HeroShareStatsResource";
import { BreadcrumbGatedCoverResource } from "./BreadcrumbGatedCoverResource";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function ResourcePageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.resource;

  const examples: UIExample[] = [
    {
      id: "resource-1",
      title: t.resource1TabTitle,
      description: t.resource1TabDescription,
      render: () => <ArticleFactsSidebarResource />,
    },
    {
      id: "resource-2",
      title: t.resource2TabTitle,
      description: t.resource2TabDescription,
      render: () => <HeroShareStatsResource />,
    },
    {
      id: "resource-3",
      title: t.resource3TabTitle,
      description: t.resource3TabDescription,
      render: () => <BreadcrumbGatedCoverResource />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.resourceTitle}
      intro={m.examples.resourceDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="resource"
    />
  );
}
