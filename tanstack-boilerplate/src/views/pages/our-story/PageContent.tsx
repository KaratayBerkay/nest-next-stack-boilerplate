"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { TabbedEraTimelineOurStory } from "./TabbedEraTimelineOurStory";
import { AutoplayMilestoneOurStory } from "./AutoplayMilestoneOurStory";
import { HeroRevealCarouselOurStory } from "./HeroRevealCarouselOurStory";
import { StickyVerticalTimelineOurStory } from "./StickyVerticalTimelineOurStory";
import { YearTabsHoverMediaOurStory } from "./YearTabsHoverMediaOurStory";
import { CenturyScrollChaptersOurStory } from "./CenturyScrollChaptersOurStory";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function OurStoryPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.ourStory;

  const examples: UIExample[] = [
    {
      id: "our-story-1",
      title: t.ourStory1TabTitle,
      description: t.ourStory1TabDescription,
      render: () => <TabbedEraTimelineOurStory />,
    },
    {
      id: "our-story-2",
      title: t.ourStory2TabTitle,
      description: t.ourStory2TabDescription,
      render: () => <AutoplayMilestoneOurStory />,
    },
    {
      id: "our-story-3",
      title: t.ourStory3TabTitle,
      description: t.ourStory3TabDescription,
      render: () => <HeroRevealCarouselOurStory />,
    },
    {
      id: "our-story-4",
      title: t.ourStory4TabTitle,
      description: t.ourStory4TabDescription,
      render: () => <StickyVerticalTimelineOurStory />,
    },
    {
      id: "our-story-5",
      title: t.ourStory5TabTitle,
      description: t.ourStory5TabDescription,
      render: () => <YearTabsHoverMediaOurStory />,
    },
    {
      id: "our-story-6",
      title: t.ourStory6TabTitle,
      description: t.ourStory6TabDescription,
      render: () => <CenturyScrollChaptersOurStory />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.ourStoryTitle}
      intro={m.examples.ourStoryDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="our-story"
    />
  );
}
