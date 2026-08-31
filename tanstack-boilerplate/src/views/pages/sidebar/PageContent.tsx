"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { IconRailToggleSidebar } from "./IconRailToggleSidebar";
import { AccordionGroupNavSidebar } from "./AccordionGroupNavSidebar";
import { WorkspaceUserFooterSidebar } from "./WorkspaceUserFooterSidebar";
import { FloatingOverlaySidebar } from "./FloatingOverlaySidebar";
import { ChannelPresenceListSidebar } from "./ChannelPresenceListSidebar";
import { SearchableTreeNavSidebar } from "./SearchableTreeNavSidebar";
import { MobileDrawerNavSidebar } from "./MobileDrawerNavSidebar";
import { DocsTocScrollSidebar } from "./DocsTocScrollSidebar";
import { DrillDownSettingsSidebar } from "./DrillDownSettingsSidebar";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function SidebarPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.sidebar;

  const examples: UIExample[] = [
    {
      id: "sidebar-1",
      title: t.sidebar1TabTitle,
      description: t.sidebar1TabDescription,
      render: () => <IconRailToggleSidebar />,
    },
    {
      id: "sidebar-2",
      title: t.sidebar2TabTitle,
      description: t.sidebar2TabDescription,
      render: () => <AccordionGroupNavSidebar />,
    },
    {
      id: "sidebar-3",
      title: t.sidebar3TabTitle,
      description: t.sidebar3TabDescription,
      render: () => <WorkspaceUserFooterSidebar />,
    },
    {
      id: "sidebar-4",
      title: t.sidebar4TabTitle,
      description: t.sidebar4TabDescription,
      render: () => <FloatingOverlaySidebar />,
    },
    {
      id: "sidebar-5",
      title: t.sidebar5TabTitle,
      description: t.sidebar5TabDescription,
      render: () => <ChannelPresenceListSidebar />,
    },
    {
      id: "sidebar-6",
      title: t.sidebar6TabTitle,
      description: t.sidebar6TabDescription,
      render: () => <SearchableTreeNavSidebar />,
    },
    {
      id: "sidebar-7",
      title: t.sidebar7TabTitle,
      description: t.sidebar7TabDescription,
      render: () => <MobileDrawerNavSidebar />,
    },
    {
      id: "sidebar-8",
      title: t.sidebar8TabTitle,
      description: t.sidebar8TabDescription,
      render: () => <DocsTocScrollSidebar />,
    },
    {
      id: "sidebar-9",
      title: t.sidebar9TabTitle,
      description: t.sidebar9TabDescription,
      render: () => <DrillDownSettingsSidebar />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.sidebarTitle}
      intro={m.examples.sidebarDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="sidebar"
    />
  );
}
