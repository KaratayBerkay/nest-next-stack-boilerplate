"use client";

import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { WorkHistoryRowsExperience } from "./WorkHistoryRowsExperience";
import { StickyTimelineExperience } from "./StickyTimelineExperience";
import { NumberedResumeListExperience } from "./NumberedResumeListExperience";
import { SerifLogosExperience } from "./SerifLogosExperience";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function ExperiencePageContent({ initialTab }: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.experience;

  const examples: UIExample[] = [
    {
      id: "experience-1",
      title: t.experience1TabTitle,
      description: t.experience1TabDescription,
      render: () => <WorkHistoryRowsExperience />,
    },
    {
      id: "experience-2",
      title: t.experience2TabTitle,
      description: t.experience2TabDescription,
      render: () => <StickyTimelineExperience />,
    },
    {
      id: "experience-3",
      title: t.experience3TabTitle,
      description: t.experience3TabDescription,
      render: () => <NumberedResumeListExperience />,
    },
    {
      id: "experience-5",
      title: t.experience5TabTitle,
      description: t.experience5TabDescription,
      render: () => <SerifLogosExperience />,
    },
  ];

  return (
    <ExampleTabs
      title={m.examples.experienceTitle}
      intro={m.examples.experienceDescription}
      examples={examples}
      initialTab={initialTab}
    />
  );
}
