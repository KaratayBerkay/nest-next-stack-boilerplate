"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { AvatarQueueWaitlist } from "./AvatarQueueWaitlist";
import { LaunchCountdownWaitlist } from "./LaunchCountdownWaitlist";
import { SplitPhotoWaitlist } from "./SplitPhotoWaitlist";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function WaitlistPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.waitlist;

  const examples: UIExample[] = [
    {
      id: "waitlist-1",
      title: t.waitlist1TabTitle,
      description: t.waitlist1TabDescription,
      render: () => <AvatarQueueWaitlist />,
    },
    {
      id: "waitlist-2",
      title: t.waitlist2TabTitle,
      description: t.waitlist2TabDescription,
      render: () => <LaunchCountdownWaitlist />,
    },
    {
      id: "waitlist-3",
      title: t.waitlist3TabTitle,
      description: t.waitlist3TabDescription,
      render: () => <SplitPhotoWaitlist />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.waitlistTitle}
      intro={m.examples.waitlistDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="waitlist"
    />
  );
}
