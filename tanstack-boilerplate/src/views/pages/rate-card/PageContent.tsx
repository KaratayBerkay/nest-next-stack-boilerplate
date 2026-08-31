"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { ProcessStepsRateCard } from "./ProcessStepsRateCard";
import { TwoPlanRateCard } from "./TwoPlanRateCard";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function RateCardPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.rateCard;

  const examples: UIExample[] = [
    {
      id: "rate-card-1",
      title: t.rateCard1TabTitle,
      description: t.rateCard1TabDescription,
      render: () => <ProcessStepsRateCard />,
    },
    {
      id: "rate-card-2",
      title: t.rateCard2TabTitle,
      description: t.rateCard2TabDescription,
      render: () => <TwoPlanRateCard />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.rateCardTitle}
      intro={m.examples.rateCardDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="rate-card"
    />
  );
}
