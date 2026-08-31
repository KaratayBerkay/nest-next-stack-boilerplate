"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { AccordionSpecsProductDetail } from "./AccordionSpecsProductDetail";
import { HoverZoomGalleryProductDetail } from "./HoverZoomGalleryProductDetail";
import { ColorSizeVariantProductDetail } from "./ColorSizeVariantProductDetail";
import { ThumbnailRailLightboxProductDetail } from "./ThumbnailRailLightboxProductDetail";
import { SizeChartDialogProductDetail } from "./SizeChartDialogProductDetail";
import { StickyInfoPanelProductDetail } from "./StickyInfoPanelProductDetail";
import { TabbedDescriptionReviewsProductDetail } from "./TabbedDescriptionReviewsProductDetail";
import { TrustBadgeSplitProductDetail } from "./TrustBadgeSplitProductDetail";
import { MinimalSingleColumnProductDetail } from "./MinimalSingleColumnProductDetail";
import { StickyAddToCartBarProductDetail } from "./StickyAddToCartBarProductDetail";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function ProductDetailPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.productDetail;

  const examples: UIExample[] = [
    {
      id: "product-detail-1",
      title: t.productDetail1TabTitle,
      description: t.productDetail1TabDescription,
      render: () => <AccordionSpecsProductDetail />,
    },
    {
      id: "product-detail-2",
      title: t.productDetail2TabTitle,
      description: t.productDetail2TabDescription,
      render: () => <HoverZoomGalleryProductDetail />,
    },
    {
      id: "product-detail-3",
      title: t.productDetail3TabTitle,
      description: t.productDetail3TabDescription,
      render: () => <ColorSizeVariantProductDetail />,
    },
    {
      id: "product-detail-4",
      title: t.productDetail4TabTitle,
      description: t.productDetail4TabDescription,
      render: () => <ThumbnailRailLightboxProductDetail />,
    },
    {
      id: "product-detail-5",
      title: t.productDetail5TabTitle,
      description: t.productDetail5TabDescription,
      render: () => <SizeChartDialogProductDetail />,
    },
    {
      id: "product-detail-6",
      title: t.productDetail6TabTitle,
      description: t.productDetail6TabDescription,
      render: () => <StickyInfoPanelProductDetail />,
    },
    {
      id: "product-detail-7",
      title: t.productDetail7TabTitle,
      description: t.productDetail7TabDescription,
      render: () => <TabbedDescriptionReviewsProductDetail />,
    },
    {
      id: "product-detail-8",
      title: t.productDetail8TabTitle,
      description: t.productDetail8TabDescription,
      render: () => <TrustBadgeSplitProductDetail />,
    },
    {
      id: "product-detail-9",
      title: t.productDetail9TabTitle,
      description: t.productDetail9TabDescription,
      render: () => <MinimalSingleColumnProductDetail />,
    },
    {
      id: "product-detail-10",
      title: t.productDetail10TabTitle,
      description: t.productDetail10TabDescription,
      render: () => <StickyAddToCartBarProductDetail />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.productDetailTitle}
      intro={m.examples.productDetailDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="product-detail"
    />
  );
}
