"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { StickyStepNavProcess } from "./StickyStepNavProcess";
import { StepImageRevealProcess } from "./StepImageRevealProcess";
import { ColorBandedTimelineProcess } from "./ColorBandedTimelineProcess";
import { HoverRevealCardsProcess } from "./HoverRevealCardsProcess";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function ProcessPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.process;

  const examples: UIExample[] = [
    {
      id: "process-1",
      title: t.process1TabTitle,
      description: t.process1TabDescription,
      render: () => <StickyStepNavProcess />,
    },
    {
      id: "process-2",
      title: t.process2TabTitle,
      description: t.process2TabDescription,
      render: () => <StepImageRevealProcess />,
    },
    {
      id: "process-3",
      title: t.process3TabTitle,
      description: t.process3TabDescription,
      render: () => <ColorBandedTimelineProcess />,
    },
    {
      id: "process-4",
      title: t.process4TabTitle,
      description: t.process4TabDescription,
      render: () => <HoverRevealCardsProcess />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.processTitle}
      intro={m.examples.processDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="process"
    />
  );
}
