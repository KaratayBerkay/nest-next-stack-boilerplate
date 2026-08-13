"use client";

import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { DealsGiftSheet } from "./DealsGiftSheet";
import { DealsBundleBuilder } from "./DealsBundleBuilder";
import { DealsNewsletterBanner } from "./DealsNewsletterBanner";
import { DealsSideTabPicker } from "./DealsSideTabPicker";
import { DealsOffersBell } from "./DealsOffersBell";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function DealsPageContent({ initialTab }: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.deals;

  const examples: UIExample[] = [
    {
      id: "deals-1",
      title: t.deals1TabTitle,
      description: t.deals1TabDescription,
      render: () => <DealsGiftSheet />,
    },
    {
      id: "deals-2",
      title: t.deals2TabTitle,
      description: t.deals2TabDescription,
      render: () => <DealsBundleBuilder />,
    },
    {
      id: "deals-3",
      title: t.deals3TabTitle,
      description: t.deals3TabDescription,
      render: () => <DealsNewsletterBanner />,
    },
    {
      id: "deals-6",
      title: t.deals6TabTitle,
      description: t.deals6TabDescription,
      render: () => <DealsSideTabPicker />,
    },
    {
      id: "deals-7",
      title: t.deals7TabTitle,
      description: t.deals7TabDescription,
      render: () => <DealsOffersBell />,
    },
  ];

  return (
    <ExampleTabs
      title={m.examples.dealsTitle}
      intro={m.examples.dealsDescription}
      examples={examples}
      initialTab={initialTab}
    />
  );
}
