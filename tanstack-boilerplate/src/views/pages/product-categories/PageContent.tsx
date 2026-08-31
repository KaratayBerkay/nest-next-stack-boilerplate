"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { ItemCountCardGridProductCategories } from "./ItemCountCardGridProductCategories";
import { OverlayBentoGridProductCategories } from "./OverlayBentoGridProductCategories";
import { BreadcrumbAccordionProductCategories } from "./BreadcrumbAccordionProductCategories";
import { HorizontalPromoScrollProductCategories } from "./HorizontalPromoScrollProductCategories";
import { IconChipRowProductCategories } from "./IconChipRowProductCategories";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function ProductCategoriesPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.productCategories;

  const examples: UIExample[] = [
    {
      id: "product-categories-1",
      title: t.productCategories1TabTitle,
      description: t.productCategories1TabDescription,
      render: () => <ItemCountCardGridProductCategories />,
    },
    {
      id: "product-categories-2",
      title: t.productCategories2TabTitle,
      description: t.productCategories2TabDescription,
      render: () => <OverlayBentoGridProductCategories />,
    },
    {
      id: "product-categories-3",
      title: t.productCategories3TabTitle,
      description: t.productCategories3TabDescription,
      render: () => <BreadcrumbAccordionProductCategories />,
    },
    {
      id: "product-categories-4",
      title: t.productCategories4TabTitle,
      description: t.productCategories4TabDescription,
      render: () => <HorizontalPromoScrollProductCategories />,
    },
    {
      id: "product-categories-5",
      title: t.productCategories5TabTitle,
      description: t.productCategories5TabDescription,
      render: () => <IconChipRowProductCategories />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.productCategoriesTitle}
      intro={m.examples.productCategoriesDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="product-categories"
    />
  );
}
