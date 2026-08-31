"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { MasonryPortfolioGridProjects } from "./MasonryPortfolioGridProjects";
import { FilterableTagShowcaseProjects } from "./FilterableTagShowcaseProjects";
import { HorizontalScrollShowcaseProjects } from "./HorizontalScrollShowcaseProjects";
import { HoverPreviewProjectListProjects } from "./HoverPreviewProjectListProjects";
import { BentoFeaturedShowcaseProjects } from "./BentoFeaturedShowcaseProjects";
import { MinimalTextProjectIndexProjects } from "./MinimalTextProjectIndexProjects";
import { YearClientMetadataGridProjects } from "./YearClientMetadataGridProjects";
import { ArrowCarouselSpotlightProjects } from "./ArrowCarouselSpotlightProjects";
import { AlternatingStackedRowsProjects } from "./AlternatingStackedRowsProjects";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function ProjectsPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.projects;

  const examples: UIExample[] = [
    {
      id: "projects-1",
      title: t.projects1TabTitle,
      description: t.projects1TabDescription,
      render: () => <MasonryPortfolioGridProjects />,
    },
    {
      id: "projects-2",
      title: t.projects2TabTitle,
      description: t.projects2TabDescription,
      render: () => <FilterableTagShowcaseProjects />,
    },
    {
      id: "projects-3",
      title: t.projects3TabTitle,
      description: t.projects3TabDescription,
      render: () => <HorizontalScrollShowcaseProjects />,
    },
    {
      id: "projects-4",
      title: t.projects4TabTitle,
      description: t.projects4TabDescription,
      render: () => <HoverPreviewProjectListProjects />,
    },
    {
      id: "projects-5",
      title: t.projects5TabTitle,
      description: t.projects5TabDescription,
      render: () => <BentoFeaturedShowcaseProjects />,
    },
    {
      id: "projects-6",
      title: t.projects6TabTitle,
      description: t.projects6TabDescription,
      render: () => <MinimalTextProjectIndexProjects />,
    },
    {
      id: "projects-7",
      title: t.projects7TabTitle,
      description: t.projects7TabDescription,
      render: () => <YearClientMetadataGridProjects />,
    },
    {
      id: "projects-8",
      title: t.projects8TabTitle,
      description: t.projects8TabDescription,
      render: () => <ArrowCarouselSpotlightProjects />,
    },
    {
      id: "projects-9",
      title: t.projects9TabTitle,
      description: t.projects9TabDescription,
      render: () => <AlternatingStackedRowsProjects />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.projectsTitle}
      intro={m.examples.projectsDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="projects"
    />
  );
}
