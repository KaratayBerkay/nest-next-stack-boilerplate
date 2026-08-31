"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { IconRowIncentives } from "./IconRowIncentives";
import { PrimaryBandIncentives } from "./PrimaryBandIncentives";
import { IconMarqueeIncentives } from "./IconMarqueeIncentives";
import { OutlinedServiceGridIncentives } from "./OutlinedServiceGridIncentives";
import { AboutCopyCardsIncentives } from "./AboutCopyCardsIncentives";
import { LinkedServicesCarouselIncentives } from "./LinkedServicesCarouselIncentives";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function IncentivesPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.incentives;

  const examples: UIExample[] = [
    {
      id: "incentives-1",
      title: t.incentives1TabTitle,
      description: t.incentives1TabDescription,
      render: () => <IconRowIncentives />,
    },
    {
      id: "incentives-2",
      title: t.incentives2TabTitle,
      description: t.incentives2TabDescription,
      render: () => <PrimaryBandIncentives />,
    },
    {
      id: "incentives-5",
      title: t.incentives5TabTitle,
      description: t.incentives5TabDescription,
      render: () => <IconMarqueeIncentives />,
    },
    {
      id: "incentives-6",
      title: t.incentives6TabTitle,
      description: t.incentives6TabDescription,
      render: () => <OutlinedServiceGridIncentives />,
    },
    {
      id: "incentives-7",
      title: t.incentives7TabTitle,
      description: t.incentives7TabDescription,
      render: () => <AboutCopyCardsIncentives />,
    },
    {
      id: "incentives-8",
      title: t.incentives8TabTitle,
      description: t.incentives8TabDescription,
      render: () => <LinkedServicesCarouselIncentives />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.incentivesTitle}
      intro={m.examples.incentivesDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="incentives"
    />
  );
}
