"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { CarouselGridPickerProductGallery } from "./CarouselGridPickerProductGallery";
import { HoverZoomLightboxProductGallery } from "./HoverZoomLightboxProductGallery";
import { DotIndicatorProductGallery } from "./DotIndicatorProductGallery";
import { ThumbnailSidebarProductGallery } from "./ThumbnailSidebarProductGallery";
import { ThumbnailCarouselBadgeProductGallery } from "./ThumbnailCarouselBadgeProductGallery";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function ProductGalleryPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.productGallery;

  const examples: UIExample[] = [
    {
      id: "product-gallery-1",
      title: t.productGallery1TabTitle,
      description: t.productGallery1TabDescription,
      render: () => <CarouselGridPickerProductGallery />,
    },
    {
      id: "product-gallery-2",
      title: t.productGallery2TabTitle,
      description: t.productGallery2TabDescription,
      render: () => <HoverZoomLightboxProductGallery />,
    },
    {
      id: "product-gallery-3",
      title: t.productGallery3TabTitle,
      description: t.productGallery3TabDescription,
      render: () => <DotIndicatorProductGallery />,
    },
    {
      id: "product-gallery-4",
      title: t.productGallery4TabTitle,
      description: t.productGallery4TabDescription,
      render: () => <ThumbnailSidebarProductGallery />,
    },
    {
      id: "product-gallery-7",
      title: t.productGallery7TabTitle,
      description: t.productGallery7TabDescription,
      render: () => <ThumbnailCarouselBadgeProductGallery />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.productGalleryTitle}
      intro={m.examples.productGalleryDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="product-gallery"
    />
  );
}
