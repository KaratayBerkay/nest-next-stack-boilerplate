"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { HoverRevealPortraitGridTeam } from "./HoverRevealPortraitGridTeam";
import { SocialCardRosterTeam } from "./SocialCardRosterTeam";
import { LeadershipSpotlightSplitTeam } from "./LeadershipSpotlightSplitTeam";
import { HorizontalScrollCarouselTeam } from "./HorizontalScrollCarouselTeam";
import { MinimalTextListRosterTeam } from "./MinimalTextListRosterTeam";
import { DepartmentTabbedDirectoryTeam } from "./DepartmentTabbedDirectoryTeam";
import { AlternatingBioSpotlightTeam } from "./AlternatingBioSpotlightTeam";
import { OrgChartHierarchyTeam } from "./OrgChartHierarchyTeam";
import { QuoteWallMasonryTeam } from "./QuoteWallMasonryTeam";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function TeamPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.team;

  const examples: UIExample[] = [
    {
      id: "team-1",
      title: t.team1TabTitle,
      description: t.team1TabDescription,
      render: () => <HoverRevealPortraitGridTeam />,
    },
    {
      id: "team-2",
      title: t.team2TabTitle,
      description: t.team2TabDescription,
      render: () => <SocialCardRosterTeam />,
    },
    {
      id: "team-3",
      title: t.team3TabTitle,
      description: t.team3TabDescription,
      render: () => <LeadershipSpotlightSplitTeam />,
    },
    {
      id: "team-4",
      title: t.team4TabTitle,
      description: t.team4TabDescription,
      render: () => <HorizontalScrollCarouselTeam />,
    },
    {
      id: "team-5",
      title: t.team5TabTitle,
      description: t.team5TabDescription,
      render: () => <MinimalTextListRosterTeam />,
    },
    {
      id: "team-6",
      title: t.team6TabTitle,
      description: t.team6TabDescription,
      render: () => <DepartmentTabbedDirectoryTeam />,
    },
    {
      id: "team-7",
      title: t.team7TabTitle,
      description: t.team7TabDescription,
      render: () => <AlternatingBioSpotlightTeam />,
    },
    {
      id: "team-8",
      title: t.team8TabTitle,
      description: t.team8TabDescription,
      render: () => <OrgChartHierarchyTeam />,
    },
    {
      id: "team-9",
      title: t.team9TabTitle,
      description: t.team9TabDescription,
      render: () => <QuoteWallMasonryTeam />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.teamTitle}
      intro={m.examples.teamDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="team"
    />
  );
}
