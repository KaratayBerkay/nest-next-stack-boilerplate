"use client";

import { useState } from "react";
import Image from "next/image";
import {
  IconCheck,
  IconShare2,
  IconShoppingCartPlus,
  IconStar,
  IconX,
} from "@tabler/icons-react";
import { Button, IconButton } from "@/components/ui/Button";
import { Empty } from "@/components/ui/Empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithWishlistMessages } from "@/types/pages/wishlist/WishlistMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

type SortKey = "recent" | "price-asc" | "price-desc" | "name";

interface Wishlist2Product {
  id: string;
  nameKey: string;
  categoryKey: string;
  price: number;
  rating: number;
  seed: string;
}

const usd = (n: number) => `$${n.toFixed(2)}`;

const PRODUCTS: Wishlist2Product[] = [
  {
    id: "notebook",
    nameKey: "wishlist2Product1Name",
    categoryKey: "wishlist2Product1Category",
    price: 28,
    rating: 4.5,
    seed: "wishlist2-notebook",
  },
  {
    id: "speaker",
    nameKey: "wishlist2Product2Name",
    categoryKey: "wishlist2Product2Category",
    price: 59,
    rating: 4.2,
    seed: "wishlist2-speaker",
  },
  {
    id: "mug",
    nameKey: "wishlist2Product3Name",
    categoryKey: "wishlist2Product3Category",
    price: 22,
    rating: 4.9,
    seed: "wishlist2-mug",
  },
  {
    id: "candle",
    nameKey: "wishlist2Product4Name",
    categoryKey: "wishlist2Product4Category",
    price: 18,
    rating: 4.6,
    seed: "wishlist2-candle",
  },
  {
    id: "planner",
    nameKey: "wishlist2Product5Name",
    categoryKey: "wishlist2Product5Category",
    price: 24,
    rating: 4.7,
    seed: "wishlist2-planner",
  },
];

const ALL_IDS = PRODUCTS.map((product) => product.id);

const SORT_OPTIONS: { value: SortKey; labelKey: string }[] = [
  { value: "recent", labelKey: "wishlist2SortRecent" },
  { value: "price-asc", labelKey: "wishlist2SortPriceAsc" },
  { value: "price-desc", labelKey: "wishlist2SortPriceDesc" },
  { value: "name", labelKey: "wishlist2SortName" },
];

function sortProducts(
  products: Wishlist2Product[],
  sortKey: SortKey,
  names: Record<string, string>,
): Wishlist2Product[] {
  const sorted = [...products];
  if (sortKey === "price-asc") sorted.sort((a, b) => a.price - b.price);
  else if (sortKey === "price-desc") sorted.sort((a, b) => b.price - a.price);
  else if (sortKey === "name")
    sorted.sort((a, b) => names[a.nameKey].localeCompare(names[b.nameKey]));
  return sorted;
}

export function SortableShareListWishlist() {
  const t = useMessages("pages") as unknown as PagesWithWishlistMessages;
  const w = t.wishlist;

  const [itemIds, setItemIds] = useState<string[]>(ALL_IDS);
  const [cartCount, setCartCount] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("recent");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const visible = sortProducts(
    PRODUCTS.filter((product) => itemIds.includes(product.id)),
    sortKey,
    w,
  );

  function handleRemove(id: string) {
    setItemIds((current) => current.filter((itemId) => itemId !== id));
  }

  function handleMoveToCart(id: string) {
    setItemIds((current) => current.filter((itemId) => itemId !== id));
    setCartCount((current) => current + 1);
  }

  function handleShare(id: string) {
    navigator.clipboard.writeText(`https://example.com/wishlist/${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex max-w-md flex-col gap-3">
            <Typography
              variant="h2"
              className="text-3xl font-medium tracking-tighter md:text-4xl"
            >
              {w.wishlist2Heading}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {w.wishlist2Description}
            </Typography>
            {cartCount > 0 && (
              <span className="text-success text-sm font-medium">
                {w.wishlist2CartSummary.replace("{count}", String(cartCount))}
              </span>
            )}
          </div>
          <div className="flex w-full flex-col gap-1.5 sm:w-56">
            <span className="text-muted text-xs font-medium tracking-wide uppercase">
              {w.wishlist2SortLabel}
            </span>
            <Select
              value={sortKey}
              onValueChange={(value) => setSortKey(value as SortKey)}
              name="wishlist2-sort"
            >
              <SelectTrigger>
                <SelectValue placeholder={w.wishlist2SortPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {w[option.labelKey]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {visible.length === 0 ? (
          <Empty
            title={w.wishlist2EmptyTitle}
            description={w.wishlist2EmptyDescription}
          />
        ) : (
          <ul className="border-border bg-surface flex flex-col rounded-2xl border">
            {visible.map((product) => {
              const name = w[product.nameKey];
              const copied = copiedId === product.id;
              return (
                <li
                  key={product.id}
                  className="border-border flex items-center gap-4 border-b p-4 last:border-b-0"
                >
                  <div className="bg-surface-hover relative size-14 shrink-0 overflow-hidden rounded-xl">
                    <Image
                      src={placeholderImage(product.seed, "1x1")}
                      alt={name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-fg truncate text-sm font-medium">
                      {name}
                    </span>
                    <span className="text-muted text-xs">
                      {w[product.categoryKey]}
                    </span>
                  </div>
                  <div className="text-muted hidden items-center gap-1 text-xs sm:flex">
                    <IconStar
                      size={13}
                      className="text-warning"
                      fill="currentColor"
                      aria-hidden="true"
                    />
                    {product.rating.toFixed(1)}
                  </div>
                  <span className="text-fg w-16 shrink-0 text-right text-sm font-semibold">
                    {usd(product.price)}
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="outline"
                      size="xs"
                      leftIcon={
                        <IconShoppingCartPlus size={14} aria-hidden="true" />
                      }
                      onClick={() => handleMoveToCart(product.id)}
                    >
                      {w.wishlist2MoveButton}
                    </Button>
                    <IconButton
                      icon={
                        copied ? (
                          <IconCheck
                            size={15}
                            aria-hidden="true"
                            className="text-success"
                          />
                        ) : (
                          <IconShare2 size={15} aria-hidden="true" />
                        )
                      }
                      label={
                        copied
                          ? w.wishlist2CopiedAria
                          : w.wishlist2ShareAria.replace("{name}", name)
                      }
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleShare(product.id)}
                    />
                    <IconButton
                      icon={<IconX size={15} aria-hidden="true" />}
                      label={w.wishlist2RemoveAria.replace("{name}", name)}
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRemove(product.id)}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
