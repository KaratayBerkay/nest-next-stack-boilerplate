"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { IconSearch, IconSearchOff, IconSparkles } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/Drawer";
import { Empty } from "@/components/ui/Empty";
import { Input } from "@/components/ui/Input";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithProductSearchMessages } from "@/types/pages/product-search/ProductSearchMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

interface RecommendedProduct {
  id: string;
  nameKey: string;
  price: number;
  badgeKey?: string;
  seed: string;
}

const usd = (value: number) => `$${value.toFixed(2)}`;

const PRODUCTS: RecommendedProduct[] = [
  {
    id: "bluetooth-speaker",
    nameKey: "productSearch4Product1Name",
    price: 72,
    badgeKey: "productSearch4BadgeNew",
    seed: "product-search-4-bluetooth-speaker",
  },
  {
    id: "wireless-mouse",
    nameKey: "productSearch4Product2Name",
    price: 34,
    seed: "product-search-4-wireless-mouse",
  },
  {
    id: "denim-jacket",
    nameKey: "productSearch4Product3Name",
    price: 96,
    badgeKey: "productSearch4BadgeBestseller",
    seed: "product-search-4-denim-jacket",
  },
  {
    id: "insulated-bottle",
    nameKey: "productSearch4Product4Name",
    price: 26,
    seed: "product-search-4-insulated-bottle",
  },
  {
    id: "linen-cap",
    nameKey: "productSearch4Product5Name",
    price: 19,
    seed: "product-search-4-linen-cap",
  },
  {
    id: "compact-camera",
    nameKey: "productSearch4Product6Name",
    price: 214,
    badgeKey: "productSearch4BadgeNew",
    seed: "product-search-4-compact-camera",
  },
  {
    id: "potted-plant",
    nameKey: "productSearch4Product7Name",
    price: 31,
    seed: "product-search-4-potted-plant",
  },
  {
    id: "leather-backpack",
    nameKey: "productSearch4Product8Name",
    price: 138,
    badgeKey: "productSearch4BadgeBestseller",
    seed: "product-search-4-leather-backpack",
  },
];

export function BottomDrawerRecommendationsProductSearch() {
  const t = useMessages("pages") as unknown as PagesWithProductSearchMessages;
  const ps = t.productSearch;
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PRODUCTS;
    return PRODUCTS.filter((product) =>
      ps[product.nameKey].toLowerCase().includes(q),
    );
  }, [query, ps]);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-6 text-center lg:px-8">
        <h2 className="text-fg text-3xl font-semibold tracking-tight md:text-4xl">
          {ps.productSearch4Heading}
        </h2>
        <p className="text-muted text-base">{ps.productSearch4Body}</p>
      </div>

      <div className="mx-auto mt-8 flex max-w-xl justify-center px-6 lg:px-8">
        <Drawer>
          <DrawerTrigger className="border-border bg-surface text-muted hover:bg-surface-hover inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm">
            <IconSearch size={16} aria-hidden="true" />
            {ps.productSearch4TriggerLabel}
          </DrawerTrigger>
          <DrawerContent className="mx-auto w-full max-w-2xl">
            <DrawerHeader className="text-left">
              <DrawerTitle>{ps.productSearch4PanelTitle}</DrawerTitle>
            </DrawerHeader>
            <div className="flex flex-col gap-4 pb-2">
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={ps.productSearch4SearchPlaceholder}
                aria-label={ps.productSearch4SearchAria}
                leftIcon={<IconSearch size={16} aria-hidden="true" />}
              />
              {!query && (
                <span className="text-muted flex items-center gap-1.5 text-xs font-medium">
                  <IconSparkles size={13} aria-hidden="true" />
                  {ps.productSearch4RecommendedLabel}
                </span>
              )}
              {filtered.length === 0 ? (
                <Empty
                  icon={<IconSearchOff size={22} aria-hidden="true" />}
                  title={ps.productSearch4EmptyTitle}
                  description={ps.productSearch4EmptyDescription}
                />
              ) : (
                <div className="grid max-h-80 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-4">
                  {filtered.map((product) => (
                    <div
                      key={product.id}
                      className="border-border bg-surface flex flex-col gap-2 rounded-xl border p-2"
                    >
                      <div className="bg-surface-hover relative aspect-square w-full overflow-hidden rounded-lg">
                        <Image
                          src={placeholderImage(product.seed, "1x1")}
                          alt={ps[product.nameKey]}
                          fill
                          sizes="160px"
                          className="object-cover"
                        />
                        {product.badgeKey && (
                          <Badge
                            variant="soft"
                            size="sm"
                            className="absolute top-1.5 left-1.5"
                          >
                            {ps[product.badgeKey]}
                          </Badge>
                        )}
                      </div>
                      <span className="text-fg truncate text-xs font-medium">
                        {ps[product.nameKey]}
                      </span>
                      <span className="text-muted text-xs">
                        {usd(product.price)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </section>
  );
}
