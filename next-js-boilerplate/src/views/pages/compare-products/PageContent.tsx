"use client";

import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { SideBySideSpecs } from "./SideBySideSpecs";
import { ProductTablePricing } from "./ProductTablePricing";
import { CartActionsComparison } from "./CartActionsComparison";
import { ResizableBeforeAfter } from "./ResizableBeforeAfter";
import { BeforeAfterCaptions } from "./BeforeAfterCaptions";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function CompareProductsPageContent({
  initialTab,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.compareProducts;

  const examples: UIExample[] = [
    {
      id: "compare-products-1",
      title: t.compareProducts1TabTitle,
      description: t.compareProducts1TabDescription,
      render: () => <SideBySideSpecs />,
    },
    {
      id: "compare-products-2",
      title: t.compareProducts2TabTitle,
      description: t.compareProducts2TabDescription,
      render: () => <ProductTablePricing />,
    },
    {
      id: "compare-products-3",
      title: t.compareProducts3TabTitle,
      description: t.compareProducts3TabDescription,
      render: () => <CartActionsComparison />,
    },
    {
      id: "compare-products-4",
      title: t.compareProducts4TabTitle,
      description: t.compareProducts4TabDescription,
      render: () => <ResizableBeforeAfter />,
    },
    {
      id: "compare-products-6",
      title: t.compareProducts6TabTitle,
      description: t.compareProducts6TabDescription,
      render: () => <BeforeAfterCaptions />,
    },
  ];

  return (
    <ExampleTabs
      title={m.examples.compareProductsTitle}
      intro={m.examples.compareProductsDescription}
      examples={examples}
      initialTab={initialTab}
    />
  );
}
