"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { HeroMetaSidebarProject } from "./HeroMetaSidebarProject";
import { GalleryOverlayProject } from "./GalleryOverlayProject";
import { SpecSheetTwoColumnProject } from "./SpecSheetTwoColumnProject";
import { StickyStoryProject } from "./StickyStoryProject";
import { MinimalBriefProject } from "./MinimalBriefProject";
import { BeforeAfterSliderProject } from "./BeforeAfterSliderProject";
import { OutcomeStatsProject } from "./OutcomeStatsProject";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function ProjectPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.project;

  const examples: UIExample[] = [
    {
      id: "project-1",
      title: t.project1TabTitle,
      description: t.project1TabDescription,
      render: () => <HeroMetaSidebarProject />,
    },
    {
      id: "project-2",
      title: t.project2TabTitle,
      description: t.project2TabDescription,
      render: () => <GalleryOverlayProject />,
    },
    {
      id: "project-3",
      title: t.project3TabTitle,
      description: t.project3TabDescription,
      render: () => <SpecSheetTwoColumnProject />,
    },
    {
      id: "project-4",
      title: t.project4TabTitle,
      description: t.project4TabDescription,
      render: () => <StickyStoryProject />,
    },
    {
      id: "project-5",
      title: t.project5TabTitle,
      description: t.project5TabDescription,
      render: () => <MinimalBriefProject />,
    },
    {
      id: "project-6",
      title: t.project6TabTitle,
      description: t.project6TabDescription,
      render: () => <BeforeAfterSliderProject />,
    },
    {
      id: "project-7",
      title: t.project7TabTitle,
      description: t.project7TabDescription,
      render: () => <OutcomeStatsProject />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.projectTitle}
      intro={m.examples.projectDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="project"
    />
  );
}
