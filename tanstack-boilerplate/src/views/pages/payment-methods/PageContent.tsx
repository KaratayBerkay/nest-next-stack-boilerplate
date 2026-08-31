"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { InlineEditListPaymentMethods } from "./InlineEditListPaymentMethods";
import { DefaultHighlightGridPaymentMethods } from "./DefaultHighlightGridPaymentMethods";
import { FlipDetailPaymentMethods } from "./FlipDetailPaymentMethods";
import { CarouselAddDialogPaymentMethods } from "./CarouselAddDialogPaymentMethods";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function PaymentMethodsPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.paymentMethods;

  const examples: UIExample[] = [
    {
      id: "payment-methods-1",
      title: t.paymentMethods1TabTitle,
      description: t.paymentMethods1TabDescription,
      render: () => <InlineEditListPaymentMethods />,
    },
    {
      id: "payment-methods-2",
      title: t.paymentMethods2TabTitle,
      description: t.paymentMethods2TabDescription,
      render: () => <DefaultHighlightGridPaymentMethods />,
    },
    {
      id: "payment-methods-3",
      title: t.paymentMethods3TabTitle,
      description: t.paymentMethods3TabDescription,
      render: () => <FlipDetailPaymentMethods />,
    },
    {
      id: "payment-methods-4",
      title: t.paymentMethods4TabTitle,
      description: t.paymentMethods4TabDescription,
      render: () => <CarouselAddDialogPaymentMethods />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.paymentMethodsTitle}
      intro={m.examples.paymentMethodsDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="payment-methods"
    />
  );
}
