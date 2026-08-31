"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { NewsletterLocaleEcommerceFooter } from "./NewsletterLocaleEcommerceFooter";
import { AccordionLinksEcommerceFooter } from "./AccordionLinksEcommerceFooter";
import { StoreLocatorPaymentsEcommerceFooter } from "./StoreLocatorPaymentsEcommerceFooter";
import { TabbedContactEcommerceFooter } from "./TabbedContactEcommerceFooter";
import { SupportBrandPanelEcommerceFooter } from "./SupportBrandPanelEcommerceFooter";
import { BrandStoryPaymentsEcommerceFooter } from "./BrandStoryPaymentsEcommerceFooter";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function EcommerceFooterPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.ecommerceFooter;

  const examples: UIExample[] = [
    {
      id: "ecommerce-footer-1",
      title: t.ecommerceFooter1TabTitle,
      description: t.ecommerceFooter1TabDescription,
      render: () => <NewsletterLocaleEcommerceFooter />,
    },
    {
      id: "ecommerce-footer-2",
      title: t.ecommerceFooter2TabTitle,
      description: t.ecommerceFooter2TabDescription,
      render: () => <AccordionLinksEcommerceFooter />,
    },
    {
      id: "ecommerce-footer-9",
      title: t.ecommerceFooter9TabTitle,
      description: t.ecommerceFooter9TabDescription,
      render: () => <StoreLocatorPaymentsEcommerceFooter />,
    },
    {
      id: "ecommerce-footer-18",
      title: t.ecommerceFooter18TabTitle,
      description: t.ecommerceFooter18TabDescription,
      render: () => <TabbedContactEcommerceFooter />,
    },
    {
      id: "ecommerce-footer-19",
      title: t.ecommerceFooter19TabTitle,
      description: t.ecommerceFooter19TabDescription,
      render: () => <SupportBrandPanelEcommerceFooter />,
    },
    {
      id: "ecommerce-footer-20",
      title: t.ecommerceFooter20TabTitle,
      description: t.ecommerceFooter20TabDescription,
      render: () => <BrandStoryPaymentsEcommerceFooter />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.ecommerceFooterTitle}
      intro={m.examples.ecommerceFooterDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="ecommerce-footer"
    />
  );
}
