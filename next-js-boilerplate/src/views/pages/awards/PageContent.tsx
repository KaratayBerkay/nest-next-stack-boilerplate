"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { LinkedRowsAwards } from "./LinkedRowsAwards";
import { StickyLabelAwards } from "./StickyLabelAwards";
import { HoverAccentAwards } from "./HoverAccentAwards";
import { LogoDateAwards } from "./LogoDateAwards";
import { PointerPreviewAwards } from "./PointerPreviewAwards";
import { MilestoneGridAwards } from "./MilestoneGridAwards";
import { SpotlightSplitAwards } from "./SpotlightSplitAwards";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function AwardsPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.awards;

  const examples: UIExample[] = [
    {
      id: "awards-1",
      title: t.awards1TabTitle,
      description: t.awards1TabDescription,
      render: () => <LinkedRowsAwards />,
    },
    {
      id: "awards-2",
      title: t.awards2TabTitle,
      description: t.awards2TabDescription,
      render: () => <StickyLabelAwards />,
    },
    {
      id: "awards-3",
      title: t.awards3TabTitle,
      description: t.awards3TabDescription,
      render: () => <HoverAccentAwards />,
    },
    {
      id: "awards-4",
      title: t.awards4TabTitle,
      description: t.awards4TabDescription,
      render: () => <LogoDateAwards />,
    },
    {
      id: "awards-5",
      title: t.awards5TabTitle,
      description: t.awards5TabDescription,
      render: () => <PointerPreviewAwards />,
    },
    {
      id: "awards-6",
      title: t.awards6TabTitle,
      description: t.awards6TabDescription,
      render: () => <MilestoneGridAwards />,
    },
    {
      id: "awards-7",
      title: t.awards7TabTitle,
      description: t.awards7TabDescription,
      render: () => <SpotlightSplitAwards />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.awardsTitle}
      intro={m.examples.awardsDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="awards"
    />
  );
}
