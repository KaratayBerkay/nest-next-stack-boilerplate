"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { ItemizedTotalsOrderSummary } from "./ItemizedTotalsOrderSummary";
import { CompactStackedOrderSummary } from "./CompactStackedOrderSummary";
import { ProductGridOrderSummary } from "./ProductGridOrderSummary";
import { StatusTimelineOrderSummary } from "./StatusTimelineOrderSummary";
import { SideSheetOrderSummary } from "./SideSheetOrderSummary";
import { ConfirmationDialogOrderSummary } from "./ConfirmationDialogOrderSummary";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function OrderSummaryPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.orderSummary;

  const examples: UIExample[] = [
    {
      id: "order-summary-1",
      title: t.orderSummary1TabTitle,
      description: t.orderSummary1TabDescription,
      render: () => <ItemizedTotalsOrderSummary />,
    },
    {
      id: "order-summary-2",
      title: t.orderSummary2TabTitle,
      description: t.orderSummary2TabDescription,
      render: () => <CompactStackedOrderSummary />,
    },
    {
      id: "order-summary-3",
      title: t.orderSummary3TabTitle,
      description: t.orderSummary3TabDescription,
      render: () => <ProductGridOrderSummary />,
    },
    {
      id: "order-summary-4",
      title: t.orderSummary4TabTitle,
      description: t.orderSummary4TabDescription,
      render: () => <StatusTimelineOrderSummary />,
    },
    {
      id: "order-summary-5",
      title: t.orderSummary5TabTitle,
      description: t.orderSummary5TabDescription,
      render: () => <SideSheetOrderSummary />,
    },
    {
      id: "order-summary-6",
      title: t.orderSummary6TabTitle,
      description: t.orderSummary6TabDescription,
      render: () => <ConfirmationDialogOrderSummary />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.orderSummaryTitle}
      intro={m.examples.orderSummaryDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="order-summary"
    />
  );
}
