"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { FilterSidebarGridProductList } from "./FilterSidebarGridProductList";
import { ViewToggleCatalogProductList } from "./ViewToggleCatalogProductList";
import { TabbedCategoryProductList } from "./TabbedCategoryProductList";
import { LoadMoreFeedProductList } from "./LoadMoreFeedProductList";
import { CompareBarGridProductList } from "./CompareBarGridProductList";
import { DenseInventoryTableProductList } from "./DenseInventoryTableProductList";
import { CollectionCarouselRailProductList } from "./CollectionCarouselRailProductList";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";
import type { PagesWithProductListMessages } from "@/types/pages/product-list/ProductListMessages-types";

export default function ProductListPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages") as unknown as PagesWithProductListMessages & {
    examples: {
      productListTitle: string;
      productListDescription: string;
    };
  };
  const t = m.productList;

  const examples: UIExample[] = [
    {
      id: "product-list-1",
      title: t.productList1TabTitle,
      description: t.productList1TabDescription,
      render: () => <FilterSidebarGridProductList />,
    },
    {
      id: "product-list-2",
      title: t.productList2TabTitle,
      description: t.productList2TabDescription,
      render: () => <ViewToggleCatalogProductList />,
    },
    {
      id: "product-list-3",
      title: t.productList3TabTitle,
      description: t.productList3TabDescription,
      render: () => <TabbedCategoryProductList />,
    },
    {
      id: "product-list-4",
      title: t.productList4TabTitle,
      description: t.productList4TabDescription,
      render: () => <LoadMoreFeedProductList />,
    },
    {
      id: "product-list-5",
      title: t.productList5TabTitle,
      description: t.productList5TabDescription,
      render: () => <CompareBarGridProductList />,
    },
    {
      id: "product-list-6",
      title: t.productList6TabTitle,
      description: t.productList6TabDescription,
      render: () => <DenseInventoryTableProductList />,
    },
    {
      id: "product-list-7",
      title: t.productList7TabTitle,
      description: t.productList7TabDescription,
      render: () => <CollectionCarouselRailProductList />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.productListTitle}
      intro={m.examples.productListDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="product-list"
    />
  );
}
