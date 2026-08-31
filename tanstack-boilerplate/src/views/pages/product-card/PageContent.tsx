"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { HoverSwapAngleProductCard } from "./HoverSwapAngleProductCard";
import { ColorSwatchPickerProductCard } from "./ColorSwatchPickerProductCard";
import { QuickAddStepperProductCard } from "./QuickAddStepperProductCard";
import { CompactListProductCard } from "./CompactListProductCard";
import { DiscountRibbonCountdownProductCard } from "./DiscountRibbonCountdownProductCard";
import { MinimalEditorialProductCard } from "./MinimalEditorialProductCard";
import { FlipSpecCardProductCard } from "./FlipSpecCardProductCard";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";
import type { PagesWithProductCardMessages } from "@/types/pages/product-card/ProductCardMessages-types";

export default function ProductCardPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages") as unknown as PagesWithProductCardMessages & {
    examples: {
      productCardTitle: string;
      productCardDescription: string;
    };
  };
  const t = m.productCard;

  const examples: UIExample[] = [
    {
      id: "product-card-1",
      title: t.productCard1TabTitle,
      description: t.productCard1TabDescription,
      render: () => <HoverSwapAngleProductCard />,
    },
    {
      id: "product-card-2",
      title: t.productCard2TabTitle,
      description: t.productCard2TabDescription,
      render: () => <ColorSwatchPickerProductCard />,
    },
    {
      id: "product-card-3",
      title: t.productCard3TabTitle,
      description: t.productCard3TabDescription,
      render: () => <QuickAddStepperProductCard />,
    },
    {
      id: "product-card-4",
      title: t.productCard4TabTitle,
      description: t.productCard4TabDescription,
      render: () => <CompactListProductCard />,
    },
    {
      id: "product-card-5",
      title: t.productCard5TabTitle,
      description: t.productCard5TabDescription,
      render: () => <DiscountRibbonCountdownProductCard />,
    },
    {
      id: "product-card-6",
      title: t.productCard6TabTitle,
      description: t.productCard6TabDescription,
      render: () => <MinimalEditorialProductCard />,
    },
    {
      id: "product-card-7",
      title: t.productCard7TabTitle,
      description: t.productCard7TabDescription,
      render: () => <FlipSpecCardProductCard />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.productCardTitle}
      intro={m.examples.productCardDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="product-card"
    />
  );
}
