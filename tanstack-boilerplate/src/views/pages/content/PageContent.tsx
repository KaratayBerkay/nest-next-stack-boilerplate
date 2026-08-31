"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { ScrollSpyOutlineContent } from "./ScrollSpyOutlineContent";
import { FilterableHubGridContent } from "./FilterableHubGridContent";
import { GuideTopicRailContent } from "./GuideTopicRailContent";
import { AuthorPillOutlineContent } from "./AuthorPillOutlineContent";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function ContentPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.content;

  const examples: UIExample[] = [
    {
      id: "content-1",
      title: t.content1TabTitle,
      description: t.content1TabDescription,
      render: () => <ScrollSpyOutlineContent />,
    },
    {
      id: "content-2",
      title: t.content2TabTitle,
      description: t.content2TabDescription,
      render: () => <FilterableHubGridContent />,
    },
    {
      id: "content-3",
      title: t.content3TabTitle,
      description: t.content3TabDescription,
      render: () => <GuideTopicRailContent />,
    },
    {
      id: "content-4",
      title: t.content4TabTitle,
      description: t.content4TabDescription,
      render: () => <AuthorPillOutlineContent />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.contentTitle}
      intro={m.examples.contentDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="content"
    />
  );
}
