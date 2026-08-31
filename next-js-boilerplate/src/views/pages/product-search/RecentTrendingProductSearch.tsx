"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  IconClock,
  IconFlame,
  IconSearch,
  IconSearchOff,
  IconX,
} from "@tabler/icons-react";
import { Empty } from "@/components/ui/Empty";
import { Input } from "@/components/ui/Input";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithProductSearchMessages } from "@/types/pages/product-search/ProductSearchMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

interface TrendingProduct {
  id: string;
  nameKey: string;
  price: number;
  seed: string;
}

const usd = (value: number) => `$${value.toFixed(2)}`;

const PRODUCTS: TrendingProduct[] = [
  {
    id: "wireless-earbuds",
    nameKey: "productSearch3Product1Name",
    price: 64,
    seed: "product-search-3-wireless-earbuds",
  },
  {
    id: "desk-lamp",
    nameKey: "productSearch3Product2Name",
    price: 41,
    seed: "product-search-3-desk-lamp",
  },
  {
    id: "trail-sneakers",
    nameKey: "productSearch3Product3Name",
    price: 76,
    seed: "product-search-3-trail-sneakers",
  },
  {
    id: "canvas-backpack",
    nameKey: "productSearch3Product4Name",
    price: 54,
    seed: "product-search-3-canvas-backpack",
  },
  {
    id: "yoga-mat",
    nameKey: "productSearch3Product5Name",
    price: 29,
    seed: "product-search-3-yoga-mat",
  },
  {
    id: "pour-over-kettle",
    nameKey: "productSearch3Product6Name",
    price: 37,
    seed: "product-search-3-pour-over-kettle",
  },
  {
    id: "table-candle",
    nameKey: "productSearch3Product7Name",
    price: 18,
    seed: "product-search-3-table-candle",
  },
  {
    id: "leather-wallet",
    nameKey: "productSearch3Product8Name",
    price: 48,
    seed: "product-search-3-leather-wallet",
  },
];

const RECENT_KEYS = [
  "productSearch3Recent1",
  "productSearch3Recent2",
  "productSearch3Recent3",
] as const;

export function RecentTrendingProductSearch() {
  const t = useMessages("pages") as unknown as PagesWithProductSearchMessages;
  const ps = t.productSearch;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setOpen(false));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return PRODUCTS.filter((product) =>
      ps[product.nameKey].toLowerCase().includes(q),
    );
  }, [query, ps]);

  const trending = PRODUCTS.slice(0, 4);
  const showResults = query.trim().length > 0;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-6 text-center lg:px-8">
        <h2 className="text-fg text-3xl font-semibold tracking-tight md:text-4xl">
          {ps.productSearch3Heading}
        </h2>
        <p className="text-muted text-base">{ps.productSearch3Body}</p>
      </div>

      <div className="mx-auto mt-8 w-full max-w-xl px-6 lg:px-8">
        <div ref={containerRef} className="relative w-full">
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setOpen(true)}
            placeholder={ps.productSearch3SearchPlaceholder}
            aria-label={ps.productSearch3SearchAria}
            leftIcon={<IconSearch size={16} aria-hidden="true" />}
            rightIcon={
              query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-muted hover:text-fg"
                  aria-label={ps.productSearch3ClearAria}
                >
                  <IconX size={14} aria-hidden="true" />
                </button>
              ) : undefined
            }
          />

          {open && (
            <div className="border-border bg-bg absolute inset-x-0 top-full z-20 mt-2 max-h-96 overflow-y-auto rounded-xl border p-4 shadow-lg">
              {showResults ? (
                filtered.length > 0 ? (
                  <ul className="flex flex-col gap-1">
                    {filtered.map((product) => (
                      <li key={product.id}>
                        <button
                          type="button"
                          onClick={() => setOpen(false)}
                          className="hover:bg-surface-hover flex w-full items-center gap-3 rounded-lg p-2 text-left"
                        >
                          <div className="bg-surface-hover relative size-10 shrink-0 overflow-hidden rounded-md">
                            <Image
                              src={placeholderImage(product.seed, "1x1")}
                              alt={ps[product.nameKey]}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                          <span className="text-fg flex-1 truncate text-sm">
                            {ps[product.nameKey]}
                          </span>
                          <span className="text-muted text-xs">
                            {usd(product.price)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Empty
                    icon={<IconSearchOff size={20} aria-hidden="true" />}
                    title={ps.productSearch3EmptyTitle}
                    description={ps.productSearch3EmptyDescription}
                  />
                )
              ) : (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <span className="text-muted flex items-center gap-1.5 text-xs font-medium">
                      <IconClock size={13} aria-hidden="true" />
                      {ps.productSearch3RecentLabel}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {RECENT_KEYS.map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setQuery(ps[key])}
                          className="border-border bg-surface hover:bg-surface-hover rounded-full border px-3 py-1.5 text-xs"
                        >
                          {ps[key]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-muted flex items-center gap-1.5 text-xs font-medium">
                      <IconFlame size={13} aria-hidden="true" />
                      {ps.productSearch3TrendingLabel}
                    </span>
                    <ul className="flex flex-col gap-1">
                      {trending.map((product) => (
                        <li key={product.id}>
                          <button
                            type="button"
                            onClick={() => setQuery(ps[product.nameKey])}
                            className="hover:bg-surface-hover flex w-full items-center gap-3 rounded-lg p-2 text-left"
                          >
                            <div className="bg-surface-hover relative size-10 shrink-0 overflow-hidden rounded-md">
                              <Image
                                src={placeholderImage(product.seed, "1x1")}
                                alt={ps[product.nameKey]}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                            <span className="text-fg flex-1 truncate text-sm">
                              {ps[product.nameKey]}
                            </span>
                            <span className="text-muted text-xs">
                              {usd(product.price)}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
