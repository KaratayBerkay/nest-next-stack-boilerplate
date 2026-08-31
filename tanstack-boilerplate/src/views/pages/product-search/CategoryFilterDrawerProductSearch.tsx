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

type CategoryId = "all" | "audio" | "footwear" | "bags" | "home";

interface FilterProduct {
  id: string;
  nameKey: string;
  price: number;
  category: Exclude<CategoryId, "all">;
  seed: string;
}

interface CategoryOption {
  id: CategoryId;
  labelKey: string;
}

const usd = (value: number) => `$${value.toFixed(2)}`;

const CATEGORIES: CategoryOption[] = [
  { id: "all", labelKey: "productSearch6CategoryAll" },
  { id: "audio", labelKey: "productSearch6CategoryAudio" },
  { id: "footwear", labelKey: "productSearch6CategoryFootwear" },
  { id: "bags", labelKey: "productSearch6CategoryBags" },
  { id: "home", labelKey: "productSearch6CategoryHome" },
];

const PRODUCTS: FilterProduct[] = [
  {
    id: "over-ear-headphones",
    nameKey: "productSearch6Product1Name",
    price: 118,
    category: "audio",
    seed: "product-search-6-over-ear-headphones",
  },
  {
    id: "mini-speaker",
    nameKey: "productSearch6Product2Name",
    price: 52,
    category: "audio",
    seed: "product-search-6-mini-speaker",
  },
  {
    id: "earbud-case",
    nameKey: "productSearch6Product3Name",
    price: 27,
    category: "audio",
    seed: "product-search-6-earbud-case",
  },
  {
    id: "trail-boots",
    nameKey: "productSearch6Product4Name",
    price: 96,
    category: "footwear",
    seed: "product-search-6-trail-boots",
  },
  {
    id: "canvas-sneakers",
    nameKey: "productSearch6Product5Name",
    price: 61,
    category: "footwear",
    seed: "product-search-6-canvas-sneakers",
  },
  {
    id: "leather-tote",
    nameKey: "productSearch6Product6Name",
    price: 84,
    category: "bags",
    seed: "product-search-6-leather-tote",
  },
  {
    id: "travel-duffel",
    nameKey: "productSearch6Product7Name",
    price: 73,
    category: "bags",
    seed: "product-search-6-travel-duffel",
  },
  {
    id: "table-lamp",
    nameKey: "productSearch6Product8Name",
    price: 39,
    category: "home",
    seed: "product-search-6-table-lamp",
  },
  {
    id: "ceramic-vase",
    nameKey: "productSearch6Product9Name",
    price: 33,
    category: "home",
    seed: "product-search-6-ceramic-vase",
  },
];

export function CategoryFilterDrawerProductSearch() {
  const t = useMessages("pages") as unknown as PagesWithProductSearchMessages;
  const ps = t.productSearch;
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCTS.filter((product) => {
      const matchesCategory =
        activeCategory === "all" || product.category === activeCategory;
      const matchesQuery = !q || ps[product.nameKey].toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory, ps]);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-6 text-center lg:px-8">
        <h2 className="text-fg text-3xl font-semibold tracking-tight md:text-4xl">
          {ps.productSearch6Heading}
        </h2>
        <p className="text-muted text-base">{ps.productSearch6Body}</p>
      </div>

      <div className="mx-auto mt-8 flex max-w-xl justify-center px-6 lg:px-8">
        <Sheet>
          <SheetTrigger className="border-border bg-surface text-muted hover:bg-surface-hover flex w-full items-center gap-2 rounded-full border px-4 py-2.5 text-sm">
            <IconSearch size={16} aria-hidden="true" />
            {ps.productSearch6TriggerLabel}
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col gap-4 overflow-y-auto">
            <SheetHeader className="text-left">
              <SheetTitle>{ps.productSearch6PanelTitle}</SheetTitle>
            </SheetHeader>
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={ps.productSearch6SearchPlaceholder}
              aria-label={ps.productSearch6SearchAria}
              leftIcon={<IconSearch size={16} aria-hidden="true" />}
            />
            <div
              role="group"
              aria-label={ps.productSearch6CategoryGroupAria}
              className="flex flex-wrap gap-2"
            >
              {CATEGORIES.map((category) => {
                const isActive = category.id === activeCategory;
                return (
                  <button
                    key={category.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveCategory(category.id)}
                    className={
                      isActive
                        ? "bg-brand text-brand-fg rounded-full px-3 py-1.5 text-xs font-medium"
                        : "border-border bg-surface text-fg hover:bg-surface-hover rounded-full border px-3 py-1.5 text-xs font-medium"
                    }
                  >
                    {ps[category.labelKey]}
                  </button>
                );
              })}
            </div>
            {filtered.length === 0 ? (
              <Empty
                icon={<IconSearchOff size={22} aria-hidden="true" />}
                title={ps.productSearch6EmptyTitle}
                description={ps.productSearch6EmptyDescription}
              />
            ) : (
              <ul className="flex flex-col gap-1">
                {filtered.map((product) => (
                  <li key={product.id}>
                    <div className="flex items-center gap-3 rounded-lg p-2">
                      <div className="bg-surface-hover relative size-12 shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={placeholderImage(product.seed, "1x1")}
                          alt={ps[product.nameKey]}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <span className="text-fg flex-1 truncate text-sm">
                        {ps[product.nameKey]}
                      </span>
                      <span className="text-muted text-xs">{usd(product.price)}</span>
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
