"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { CornerToastLivePurchase } from "./CornerToastLivePurchase";
import { LocationPillLivePurchase } from "./LocationPillLivePurchase";
import { StatsAlertLivePurchase } from "./StatsAlertLivePurchase";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function LivePurchasePageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.livePurchase;

  const examples: UIExample[] = [
    {
      id: "live-purchase-1",
      title: t.livePurchase1TabTitle,
      description: t.livePurchase1TabDescription,
      render: () => <CornerToastLivePurchase />,
    },
    {
      id: "live-purchase-2",
      title: t.livePurchase2TabTitle,
      description: t.livePurchase2TabDescription,
      render: () => <LocationPillLivePurchase />,
    },
    {
      id: "live-purchase-3",
      title: t.livePurchase3TabTitle,
      description: t.livePurchase3TabDescription,
      render: () => <StatsAlertLivePurchase />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.livePurchaseTitle}
      intro={m.examples.livePurchaseDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="live-purchase"
    />
  );
}
