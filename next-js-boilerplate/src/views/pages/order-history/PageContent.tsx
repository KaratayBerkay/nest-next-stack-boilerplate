"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { StatusTabsOrderHistory } from "./StatusTabsOrderHistory";
import { FilterableAccordionOrderHistory } from "./FilterableAccordionOrderHistory";
import { ItemFulfillmentOrderHistory } from "./ItemFulfillmentOrderHistory";
import { EditorialTimelineOrderHistory } from "./EditorialTimelineOrderHistory";
import { ReturnsAndReviewsOrderHistory } from "./ReturnsAndReviewsOrderHistory";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function OrderHistoryPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.orderHistory;

  const examples: UIExample[] = [
    {
      id: "order-history-1",
      title: t.orderHistory1TabTitle,
      description: t.orderHistory1TabDescription,
      render: () => <StatusTabsOrderHistory />,
    },
    {
      id: "order-history-2",
      title: t.orderHistory2TabTitle,
      description: t.orderHistory2TabDescription,
      render: () => <FilterableAccordionOrderHistory />,
    },
    {
      id: "order-history-3",
      title: t.orderHistory3TabTitle,
      description: t.orderHistory3TabDescription,
      render: () => <ItemFulfillmentOrderHistory />,
    },
    {
      id: "order-history-4",
      title: t.orderHistory4TabTitle,
      description: t.orderHistory4TabDescription,
      render: () => <EditorialTimelineOrderHistory />,
    },
    {
      id: "order-history-5",
      title: t.orderHistory5TabTitle,
      description: t.orderHistory5TabDescription,
      render: () => <ReturnsAndReviewsOrderHistory />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.orderHistoryTitle}
      intro={m.examples.orderHistoryDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="order-history"
    />
  );
}
