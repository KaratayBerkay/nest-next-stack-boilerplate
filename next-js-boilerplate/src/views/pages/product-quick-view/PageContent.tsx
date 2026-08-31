"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { StackedImageDialogProductQuickView } from "./StackedImageDialogProductQuickView";
import { MinimalCompactDialogProductQuickView } from "./MinimalCompactDialogProductQuickView";
import { QuantityStepperDialogProductQuickView } from "./QuantityStepperDialogProductQuickView";
import { VariantSwatchDialogProductQuickView } from "./VariantSwatchDialogProductQuickView";
import { ThumbnailGalleryDialogProductQuickView } from "./ThumbnailGalleryDialogProductQuickView";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function ProductQuickViewPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.productQuickView;

  const examples: UIExample[] = [
    {
      id: "product-quick-view-1",
      title: t.productQuickView1TabTitle,
      description: t.productQuickView1TabDescription,
      render: () => <StackedImageDialogProductQuickView />,
    },
    {
      id: "product-quick-view-2",
      title: t.productQuickView2TabTitle,
      description: t.productQuickView2TabDescription,
      render: () => <MinimalCompactDialogProductQuickView />,
    },
    {
      id: "product-quick-view-3",
      title: t.productQuickView3TabTitle,
      description: t.productQuickView3TabDescription,
      render: () => <QuantityStepperDialogProductQuickView />,
    },
    {
      id: "product-quick-view-4",
      title: t.productQuickView4TabTitle,
      description: t.productQuickView4TabDescription,
      render: () => <VariantSwatchDialogProductQuickView />,
    },
    {
      id: "product-quick-view-5",
      title: t.productQuickView5TabTitle,
      description: t.productQuickView5TabDescription,
      render: () => <ThumbnailGalleryDialogProductQuickView />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.productQuickViewTitle}
      intro={m.examples.productQuickViewDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="product-quick-view"
    />
  );
}
