"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { SaleBadgeGridWishlist } from "./SaleBadgeGridWishlist";
import { SortableShareListWishlist } from "./SortableShareListWishlist";
import { CollectionsDialogWishlist } from "./CollectionsDialogWishlist";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function WishlistPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.wishlist;

  const examples: UIExample[] = [
    {
      id: "wishlist-1",
      title: t.wishlist1TabTitle,
      description: t.wishlist1TabDescription,
      render: () => <SaleBadgeGridWishlist />,
    },
    {
      id: "wishlist-2",
      title: t.wishlist2TabTitle,
      description: t.wishlist2TabDescription,
      render: () => <SortableShareListWishlist />,
    },
    {
      id: "wishlist-4",
      title: t.wishlist4TabTitle,
      description: t.wishlist4TabDescription,
      render: () => <CollectionsDialogWishlist />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.wishlistTitle}
      intro={m.examples.wishlistDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="wishlist"
    />
  );
}
