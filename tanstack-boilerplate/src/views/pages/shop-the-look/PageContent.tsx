"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { SinglePhotoPinListShopTheLook } from "./SinglePhotoPinListShopTheLook";
import { OutfitBuilderVariantsShopTheLook } from "./OutfitBuilderVariantsShopTheLook";
import { BundleChecklistShopTheLook } from "./BundleChecklistShopTheLook";
import { RoomHoverRevealShopTheLook } from "./RoomHoverRevealShopTheLook";
import { LookGridHotspotsShopTheLook } from "./LookGridHotspotsShopTheLook";
import { LookCarouselProductStripShopTheLook } from "./LookCarouselProductStripShopTheLook";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function ShopTheLookPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.shopTheLook;

  const examples: UIExample[] = [
    {
      id: "shop-the-look-1",
      title: t.shopTheLook1TabTitle,
      description: t.shopTheLook1TabDescription,
      render: () => <SinglePhotoPinListShopTheLook />,
    },
    {
      id: "shop-the-look-2",
      title: t.shopTheLook2TabTitle,
      description: t.shopTheLook2TabDescription,
      render: () => <OutfitBuilderVariantsShopTheLook />,
    },
    {
      id: "shop-the-look-3",
      title: t.shopTheLook3TabTitle,
      description: t.shopTheLook3TabDescription,
      render: () => <BundleChecklistShopTheLook />,
    },
    {
      id: "shop-the-look-4",
      title: t.shopTheLook4TabTitle,
      description: t.shopTheLook4TabDescription,
      render: () => <RoomHoverRevealShopTheLook />,
    },
    {
      id: "shop-the-look-5",
      title: t.shopTheLook5TabTitle,
      description: t.shopTheLook5TabDescription,
      render: () => <LookGridHotspotsShopTheLook />,
    },
    {
      id: "shop-the-look-6",
      title: t.shopTheLook6TabTitle,
      description: t.shopTheLook6TabDescription,
      render: () => <LookCarouselProductStripShopTheLook />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.shopTheLookTitle}
      intro={m.examples.shopTheLookDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="shop-the-look"
    />
  );
}
