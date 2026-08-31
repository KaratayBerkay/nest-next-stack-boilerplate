"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { CarouselPopoverProductSearch } from "./CarouselPopoverProductSearch";
import { SlideOverResultsProductSearch } from "./SlideOverResultsProductSearch";
import { RecentTrendingProductSearch } from "./RecentTrendingProductSearch";
import { BottomDrawerRecommendationsProductSearch } from "./BottomDrawerRecommendationsProductSearch";
import { CommandPaletteDialogProductSearch } from "./CommandPaletteDialogProductSearch";
import { CategoryFilterDrawerProductSearch } from "./CategoryFilterDrawerProductSearch";
import { ComboboxPromoPanelProductSearch } from "./ComboboxPromoPanelProductSearch";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function ProductSearchPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.productSearch;

  const examples: UIExample[] = [
    {
      id: "product-search-1",
      title: t.productSearch1TabTitle,
      description: t.productSearch1TabDescription,
      render: () => <CarouselPopoverProductSearch />,
    },
    {
      id: "product-search-2",
      title: t.productSearch2TabTitle,
      description: t.productSearch2TabDescription,
      render: () => <SlideOverResultsProductSearch />,
    },
    {
      id: "product-search-3",
      title: t.productSearch3TabTitle,
      description: t.productSearch3TabDescription,
      render: () => <RecentTrendingProductSearch />,
    },
    {
      id: "product-search-4",
      title: t.productSearch4TabTitle,
      description: t.productSearch4TabDescription,
      render: () => <BottomDrawerRecommendationsProductSearch />,
    },
    {
      id: "product-search-5",
      title: t.productSearch5TabTitle,
      description: t.productSearch5TabDescription,
      render: () => <CommandPaletteDialogProductSearch />,
    },
    {
      id: "product-search-6",
      title: t.productSearch6TabTitle,
      description: t.productSearch6TabDescription,
      render: () => <CategoryFilterDrawerProductSearch />,
    },
    {
      id: "product-search-7",
      title: t.productSearch7TabTitle,
      description: t.productSearch7TabDescription,
      render: () => <ComboboxPromoPanelProductSearch />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.productSearchTitle}
      intro={m.examples.productSearchDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="product-search"
    />
  );
}
