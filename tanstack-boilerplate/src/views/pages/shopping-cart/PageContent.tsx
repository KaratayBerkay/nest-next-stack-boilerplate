"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { QuantityTableShoppingCart } from "./QuantityTableShoppingCart";
import { SlideOutDrawerShoppingCart } from "./SlideOutDrawerShoppingCart";
import { MiniCartPopoverShoppingCart } from "./MiniCartPopoverShoppingCart";
import { EmptyCartShoppingCart } from "./EmptyCartShoppingCart";
import { AddonsRecommendationsShoppingCart } from "./AddonsRecommendationsShoppingCart";
import { PromoSummarySidebarShoppingCart } from "./PromoSummarySidebarShoppingCart";
import { DialogQuickCartShoppingCart } from "./DialogQuickCartShoppingCart";
import { ShippingProgressDrawerShoppingCart } from "./ShippingProgressDrawerShoppingCart";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function ShoppingCartPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.shoppingCart;

  const examples: UIExample[] = [
    {
      id: "shopping-cart-1",
      title: t.shoppingCart1TabTitle,
      description: t.shoppingCart1TabDescription,
      render: () => <QuantityTableShoppingCart />,
    },
    {
      id: "shopping-cart-2",
      title: t.shoppingCart2TabTitle,
      description: t.shoppingCart2TabDescription,
      render: () => <SlideOutDrawerShoppingCart />,
    },
    {
      id: "shopping-cart-3",
      title: t.shoppingCart3TabTitle,
      description: t.shoppingCart3TabDescription,
      render: () => <MiniCartPopoverShoppingCart />,
    },
    {
      id: "shopping-cart-4",
      title: t.shoppingCart4TabTitle,
      description: t.shoppingCart4TabDescription,
      render: () => <EmptyCartShoppingCart />,
    },
    {
      id: "shopping-cart-5",
      title: t.shoppingCart5TabTitle,
      description: t.shoppingCart5TabDescription,
      render: () => <AddonsRecommendationsShoppingCart />,
    },
    {
      id: "shopping-cart-6",
      title: t.shoppingCart6TabTitle,
      description: t.shoppingCart6TabDescription,
      render: () => <PromoSummarySidebarShoppingCart />,
    },
    {
      id: "shopping-cart-7",
      title: t.shoppingCart7TabTitle,
      description: t.shoppingCart7TabDescription,
      render: () => <DialogQuickCartShoppingCart />,
    },
    {
      id: "shopping-cart-8",
      title: t.shoppingCart8TabTitle,
      description: t.shoppingCart8TabDescription,
      render: () => <ShippingProgressDrawerShoppingCart />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.shoppingCartTitle}
      intro={m.examples.shoppingCartDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="shopping-cart"
    />
  );
}
