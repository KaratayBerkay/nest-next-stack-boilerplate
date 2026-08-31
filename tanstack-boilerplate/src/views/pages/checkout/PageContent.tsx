"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { AccordionCheckout } from "./AccordionCheckout";
import { TwoColumnCheckout } from "./TwoColumnCheckout";
import { CollapsibleCartCheckout } from "./CollapsibleCartCheckout";
import { CartReviewPayment } from "./CartReviewPayment";
import { OrderSummaryPromo } from "./OrderSummaryPromo";
import { AccordionFullCheckout } from "./AccordionFullCheckout";
import { SavedPaymentMethods } from "./SavedPaymentMethods";
import { MultiStepCheckout } from "./MultiStepCheckout";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function CheckoutPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.checkout;

  const examples: UIExample[] = [
    {
      id: "checkout-1",
      title: t.checkout1TabTitle,
      description: t.checkout1TabDescription,
      render: () => <AccordionCheckout />,
    },
    {
      id: "checkout-2",
      title: t.checkout2TabTitle,
      description: t.checkout2TabDescription,
      render: () => <TwoColumnCheckout />,
    },
    {
      id: "checkout-3",
      title: t.checkout3TabTitle,
      description: t.checkout3TabDescription,
      render: () => <CollapsibleCartCheckout />,
    },
    {
      id: "checkout-4",
      title: t.checkout4TabTitle,
      description: t.checkout4TabDescription,
      render: () => <CartReviewPayment />,
    },
    {
      id: "checkout-5",
      title: t.checkout5TabTitle,
      description: t.checkout5TabDescription,
      render: () => <OrderSummaryPromo />,
    },
    {
      id: "checkout-8",
      title: t.checkout8TabTitle,
      description: t.checkout8TabDescription,
      render: () => <AccordionFullCheckout />,
    },
    {
      id: "checkout-10",
      title: t.checkout10TabTitle,
      description: t.checkout10TabDescription,
      render: () => <SavedPaymentMethods />,
    },
    {
      id: "checkout-12",
      title: t.checkout12TabTitle,
      description: t.checkout12TabDescription,
      render: () => <MultiStepCheckout />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.checkoutTitle}
      intro={m.examples.checkoutDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="checkout"
    />
  );
}
