"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { IconSearch, IconSearchOff } from "@tabler/icons-react";
import { Empty } from "@/components/ui/Empty";
import { Input } from "@/components/ui/Input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/Sheet";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithProductSearchMessages } from "@/types/pages/product-search/ProductSearchMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

interface SlideOverProduct {
  id: string;
  nameKey: string;
  categoryKey: string;
  price: number;
  stock: number;
  seed: string;
}

const usd = (value: number) => `$${value.toFixed(2)}`;

const PRODUCTS: SlideOverProduct[] = [
  {
    id: "earbuds",
    nameKey: "productSearch2Product1Name",
    categoryKey: "productSearch2Product1Category",
    price: 59,
    stock: 14,
    seed: "product-search-2-earbuds",
  },
  {
    id: "running-shoes",
    nameKey: "productSearch2Product2Name",
    categoryKey: "productSearch2Product2Category",
    price: 82,
    stock: 3,
    seed: "product-search-2-running-shoes",
  },
  {
    id: "tote-bag",
    nameKey: "productSearch2Product3Name",
    categoryKey: "productSearch2Product3Category",
    price: 38,
    stock: 21,
    seed: "product-search-2-tote-bag",
  },
  {
    id: "desk-lamp",
    nameKey: "productSearch2Product4Name",
    categoryKey: "productSearch2Product4Category",
    price: 46,
    stock: 9,
    seed: "product-search-2-desk-lamp",
  },
  {
    id: "water-bottle",
    nameKey: "productSearch2Product5Name",
    categoryKey: "productSearch2Product5Category",
    price: 22,
    stock: 40,
    seed: "product-search-2-water-bottle",
  },
  {
    id: "keyboard",
    nameKey: "productSearch2Product6Name",
    categoryKey: "productSearch2Product6Category",
    price: 96,
    stock: 2,
    seed: "product-search-2-keyboard",
  },
  {
    id: "rain-jacket",
    nameKey: "productSearch2Product7Name",
    categoryKey: "productSearch2Product7Category",
    price: 118,
    stock: 7,
    seed: "product-search-2-rain-jacket",
  },
  {
    id: "ceramic-mug",
    nameKey: "productSearch2Product8Name",
    categoryKey: "productSearch2Product8Category",
    price: 16,
    stock: 33,
    seed: "product-search-2-ceramic-mug",
  },
];

export function SlideOverResultsProductSearch() {
  const t = useMessages("pages") as unknown as PagesWithProductSearchMessages;
  const ps = t.productSearch;
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PRODUCTS;
    return PRODUCTS.filter(
      (product) =>
        ps[product.nameKey].toLowerCase().includes(q) ||
        ps[product.categoryKey].toLowerCase().includes(q),
    );
  }, [query, ps]);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-6 text-center lg:px-8">
        <h2 className="text-fg text-3xl font-semibold tracking-tight md:text-4xl">
          {ps.productSearch2Heading}
        </h2>
        <p className="text-muted text-base">{ps.productSearch2Body}</p>
      </div>

      <div className="mx-auto mt-8 flex max-w-xl justify-center px-6 lg:px-8">
        <Sheet>
          <SheetTrigger className="border-border bg-surface text-muted hover:bg-surface-hover flex w-full items-center gap-2 rounded-full border px-4 py-2.5 text-sm">
            <IconSearch size={16} aria-hidden="true" />
            {ps.productSearch2TriggerLabel}
          </SheetTrigger>
          <SheetContent side="right" className="flex flex-col gap-4 overflow-y-auto">
            <SheetHeader className="text-left">
              <SheetTitle>{ps.productSearch2PanelTitle}</SheetTitle>
            </SheetHeader>
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={ps.productSearch2SearchPlaceholder}
              aria-label={ps.productSearch2SearchAria}
              leftIcon={<IconSearch size={16} aria-hidden="true" />}
            />
            <span className="text-muted text-xs">
              {ps.productSearch2ResultsCount.replace(
                "{count}",
                String(filtered.length),
              )}
            </span>
            {filtered.length === 0 ? (
              <Empty
                icon={<IconSearchOff size={22} aria-hidden="true" />}
                title={ps.productSearch2EmptyTitle}
                description={ps.productSearch2EmptyDescription}
              />
            ) : (
              <ul className="flex flex-col gap-1">
                {filtered.map((product) => (
                  <li key={product.id}>
                    <div className="hover:bg-surface-hover flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors">
                      <div className="bg-surface-hover relative size-14 shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={placeholderImage(product.seed, "1x1")}
                          alt={ps[product.nameKey]}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="text-fg truncate text-sm font-medium">
                          {ps[product.nameKey]}
                        </span>
                        <span className="text-muted truncate text-xs">
                          {ps[product.categoryKey]}
                        </span>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-0.5">
                        <span className="text-fg text-sm font-semibold">
                          {usd(product.price)}
                        </span>
                        {product.stock <= 5 && (
                          <span className="text-warning text-[11px]">
                            {ps.productSearch2LowStockLabel.replace(
                              "{count}",
                              String(product.stock),
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </section>
  );
}
