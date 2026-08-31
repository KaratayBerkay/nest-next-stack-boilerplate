"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { PairedCardsCarouselEcommerceHero } from "./PairedCardsCarouselEcommerceHero";
import { ImageVideoSplitEcommerceHero } from "./ImageVideoSplitEcommerceHero";
import { BackgroundCarouselEcommerceHero } from "./BackgroundCarouselEcommerceHero";
import { SplitTextCarouselEcommerceHero } from "./SplitTextCarouselEcommerceHero";
import { FullBleedProductDetailEcommerceHero } from "./FullBleedProductDetailEcommerceHero";
import { DualCollectionCarouselEcommerceHero } from "./DualCollectionCarouselEcommerceHero";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function EcommerceHeroPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.ecommerceHero;

  const examples: UIExample[] = [
    {
      id: "ecommerce-hero-1",
      title: t.ecommerceHero1TabTitle,
      description: t.ecommerceHero1TabDescription,
      render: () => <PairedCardsCarouselEcommerceHero />,
    },
    {
      id: "ecommerce-hero-2",
      title: t.ecommerceHero2TabTitle,
      description: t.ecommerceHero2TabDescription,
      render: () => <ImageVideoSplitEcommerceHero />,
    },
    {
      id: "ecommerce-hero-3",
      title: t.ecommerceHero3TabTitle,
      description: t.ecommerceHero3TabDescription,
      render: () => <BackgroundCarouselEcommerceHero />,
    },
    {
      id: "ecommerce-hero-6",
      title: t.ecommerceHero6TabTitle,
      description: t.ecommerceHero6TabDescription,
      render: () => <SplitTextCarouselEcommerceHero />,
    },
    {
      id: "ecommerce-hero-7",
      title: t.ecommerceHero7TabTitle,
      description: t.ecommerceHero7TabDescription,
      render: () => <FullBleedProductDetailEcommerceHero />,
    },
    {
      id: "ecommerce-hero-8",
      title: t.ecommerceHero8TabTitle,
      description: t.ecommerceHero8TabDescription,
      render: () => <DualCollectionCarouselEcommerceHero />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.ecommerceHeroTitle}
      intro={m.examples.ecommerceHeroDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="ecommerce-hero"
    />
  );
}
