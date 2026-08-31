"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { AlternatingMilestonesTimeline } from "./AlternatingMilestonesTimeline";
import { HorizontalScrollPhasesTimeline } from "./HorizontalScrollPhasesTimeline";
import { ConnectedDotChangelogTimeline } from "./ConnectedDotChangelogTimeline";
import { ExpandableEventTimeline } from "./ExpandableEventTimeline";
import { RoadmapStatusTimeline } from "./RoadmapStatusTimeline";
import { MinimalDateListTimeline } from "./MinimalDateListTimeline";
import { OrderTrackingStepperTimeline } from "./OrderTrackingStepperTimeline";
import { IconStepProcessTimeline } from "./IconStepProcessTimeline";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function TimelinePageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.timeline;

  const examples: UIExample[] = [
    {
      id: "timeline-1",
      title: t.timeline1TabTitle,
      description: t.timeline1TabDescription,
      render: () => <AlternatingMilestonesTimeline />,
    },
    {
      id: "timeline-2",
      title: t.timeline2TabTitle,
      description: t.timeline2TabDescription,
      render: () => <HorizontalScrollPhasesTimeline />,
    },
    {
      id: "timeline-3",
      title: t.timeline3TabTitle,
      description: t.timeline3TabDescription,
      render: () => <ConnectedDotChangelogTimeline />,
    },
    {
      id: "timeline-4",
      title: t.timeline4TabTitle,
      description: t.timeline4TabDescription,
      render: () => <ExpandableEventTimeline />,
    },
    {
      id: "timeline-5",
      title: t.timeline5TabTitle,
      description: t.timeline5TabDescription,
      render: () => <RoadmapStatusTimeline />,
    },
    {
      id: "timeline-6",
      title: t.timeline6TabTitle,
      description: t.timeline6TabDescription,
      render: () => <MinimalDateListTimeline />,
    },
    {
      id: "timeline-7",
      title: t.timeline7TabTitle,
      description: t.timeline7TabDescription,
      render: () => <OrderTrackingStepperTimeline />,
    },
    {
      id: "timeline-8",
      title: t.timeline8TabTitle,
      description: t.timeline8TabDescription,
      render: () => <IconStepProcessTimeline />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.timelineTitle}
      intro={m.examples.timelineDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="timeline"
    />
  );
}
