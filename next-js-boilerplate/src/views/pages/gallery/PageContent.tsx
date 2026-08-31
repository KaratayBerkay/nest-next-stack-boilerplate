"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { MasonryWallGallery } from "./MasonryWallGallery";
import { LightboxGridGallery } from "./LightboxGridGallery";
import { FilterableCategoryGridGallery } from "./FilterableCategoryGridGallery";
import { BeforeAfterSliderGallery } from "./BeforeAfterSliderGallery";
import { FullBleedCarouselGallery } from "./FullBleedCarouselGallery";
import { PolaroidScatterGallery } from "./PolaroidScatterGallery";
import { HorizontalFilmstripGallery } from "./HorizontalFilmstripGallery";
import { BentoHoverGallery } from "./BentoHoverGallery";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";
import type { PagesWithGalleryBlocksMessages } from "@/types/pages/gallery/GalleryBlocksMessages-types";

export default function GalleryPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages(
    "pages",
  ) as unknown as PagesWithGalleryBlocksMessages & {
    examples: { galleryBlocksTitle: string; galleryBlocksDescription: string };
  };
  const t = m.galleryBlocks;

  const examples: UIExample[] = [
    {
      id: "gallery-1",
      title: t.galleryBlocks1TabTitle,
      description: t.galleryBlocks1TabDescription,
      render: () => <MasonryWallGallery />,
    },
    {
      id: "gallery-2",
      title: t.galleryBlocks2TabTitle,
      description: t.galleryBlocks2TabDescription,
      render: () => <LightboxGridGallery />,
    },
    {
      id: "gallery-3",
      title: t.galleryBlocks3TabTitle,
      description: t.galleryBlocks3TabDescription,
      render: () => <FilterableCategoryGridGallery />,
    },
    {
      id: "gallery-4",
      title: t.galleryBlocks4TabTitle,
      description: t.galleryBlocks4TabDescription,
      render: () => <BeforeAfterSliderGallery />,
    },
    {
      id: "gallery-5",
      title: t.galleryBlocks5TabTitle,
      description: t.galleryBlocks5TabDescription,
      render: () => <FullBleedCarouselGallery />,
    },
    {
      id: "gallery-6",
      title: t.galleryBlocks6TabTitle,
      description: t.galleryBlocks6TabDescription,
      render: () => <PolaroidScatterGallery />,
    },
    {
      id: "gallery-7",
      title: t.galleryBlocks7TabTitle,
      description: t.galleryBlocks7TabDescription,
      render: () => <HorizontalFilmstripGallery />,
    },
    {
      id: "gallery-8",
      title: t.galleryBlocks8TabTitle,
      description: t.galleryBlocks8TabDescription,
      render: () => <BentoHoverGallery />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.galleryBlocksTitle}
      intro={m.examples.galleryBlocksDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="gallery"
    />
  );
}
