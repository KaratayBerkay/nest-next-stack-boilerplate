"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { SpecCategoryAccordionProductSpecs } from "./SpecCategoryAccordionProductSpecs";
import { TabbedSpecGridProductSpecs } from "./TabbedSpecGridProductSpecs";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function ProductSpecsPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.productSpecs;

  const examples: UIExample[] = [
    {
      id: "product-specs-1",
      title: t.productSpecs1TabTitle,
      description: t.productSpecs1TabDescription,
      render: () => <SpecCategoryAccordionProductSpecs />,
    },
    {
      id: "product-specs-2",
      title: t.productSpecs2TabTitle,
      description: t.productSpecs2TabDescription,
      render: () => <TabbedSpecGridProductSpecs />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.productSpecsTitle}
      intro={m.examples.productSpecsDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="product-specs"
    />
  );
}
