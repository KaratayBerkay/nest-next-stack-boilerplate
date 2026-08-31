"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { SortableDirectoryList } from "./SortableDirectoryList";
import { IntegrationConnectionsList } from "./IntegrationConnectionsList";
import { MilestoneTimelineList } from "./MilestoneTimelineList";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function ListPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.list;

  const examples: UIExample[] = [
    {
      id: "list-1",
      title: t.list1TabTitle,
      description: t.list1TabDescription,
      render: () => <SortableDirectoryList />,
    },
    {
      id: "list-2",
      title: t.list2TabTitle,
      description: t.list2TabDescription,
      render: () => <IntegrationConnectionsList />,
    },
    {
      id: "list-3",
      title: t.list3TabTitle,
      description: t.list3TabDescription,
      render: () => <MilestoneTimelineList />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.listTitle}
      intro={m.examples.listDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="list"
    />
  );
}
