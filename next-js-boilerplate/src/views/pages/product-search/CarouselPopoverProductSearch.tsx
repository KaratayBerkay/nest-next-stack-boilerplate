"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  IconSearch,
  IconSearchOff,
  IconSparkles,
  IconX,
} from "@tabler/icons-react";
import { Empty } from "@/components/ui/Empty";
import { Input } from "@/components/ui/Input";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithProductSearchMessages } from "@/types/pages/product-search/ProductSearchMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

interface CarouselProduct {
  id: string;
  nameKey: string;
  categoryKey: string;
  price: number;
  seed: string;
}

const usd = (value: number) => `$${value.toFixed(2)}`;

const PRODUCTS: CarouselProduct[] = [
  {
    id: "headphones",
    nameKey: "productSearch1Product1Name",
    categoryKey: "productSearch1Product1Category",
    price: 89,
    seed: "product-search-1-headphones",
  },
  {
    id: "sneakers",
    nameKey: "productSearch1Product2Name",
    categoryKey: "productSearch1Product2Category",
    price: 74,
    seed: "product-search-1-sneakers",
  },
  {
    id: "backpack",
    nameKey: "productSearch1Product3Name",
    categoryKey: "productSearch1Product3Category",
    price: 58,
    seed: "product-search-1-backpack",
  },
  {
    id: "smartwatch",
    nameKey: "productSearch1Product4Name",
    categoryKey: "productSearch1Product4Category",
    price: 129,
    seed: "product-search-1-smartwatch",
  },
  {
    id: "sunglasses",
    nameKey: "productSearch1Product5Name",
    categoryKey: "productSearch1Product5Category",
    price: 45,
    seed: "product-search-1-sunglasses",
  },
  {
    id: "speaker",
    nameKey: "productSearch1Product6Name",
    categoryKey: "productSearch1Product6Category",
    price: 65,
    seed: "product-search-1-speaker",
  },
];

export function CarouselPopoverProductSearch() {
  const t = useMessages("pages") as unknown as PagesWithProductSearchMessages;
  const ps = t.productSearch;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setOpen(false));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return PRODUCTS.filter(
      (product) =>
        ps[product.nameKey].toLowerCase().includes(q) ||
        ps[product.categoryKey].toLowerCase().includes(q),
    );
  }, [query, ps]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    setOpen(value.trim().length > 0);
  };

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-6 text-center lg:px-8">
        <span className="text-brand bg-brand/15 border-brand/30 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold">
          <IconSparkles size={13} aria-hidden="true" />
          {ps.productSearch1Eyebrow}
        </span>
        <h2 className="text-fg text-3xl font-semibold tracking-tight md:text-4xl">
          {ps.productSearch1Heading}
        </h2>
        <p className="text-muted text-base">{ps.productSearch1Body}</p>
      </div>

      <div className="mx-auto mt-8 w-full max-w-xl px-6 lg:px-8">
        <div ref={containerRef} className="relative w-full">
          <Input
            type="search"
            value={query}
            onChange={handleChange}
            onFocus={() => setOpen(query.trim().length > 0)}
            placeholder={ps.productSearch1SearchPlaceholder}
            aria-label={ps.productSearch1SearchAria}
            leftIcon={<IconSearch size={16} aria-hidden="true" />}
            rightIcon={
              query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setOpen(false);
                  }}
                  className="text-muted hover:text-fg"
                  aria-label={ps.productSearch1ClearAria}
                >
                  <IconX size={14} aria-hidden="true" />
                </button>
              ) : undefined
            }
          />

          {open && (
            <div className="border-border bg-bg absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl border shadow-lg">
              {filtered.length > 0 ? (
                <div className="flex flex-col gap-3 p-4">
                  <span className="text-muted text-xs font-medium">
                    {ps.productSearch1ResultsCount.replace(
                      "{count}",
                      String(filtered.length),
                    )}
                  </span>
                  <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
                    {filtered.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => setOpen(false)}
                        className="border-border bg-surface hover:border-brand/50 flex w-36 shrink-0 flex-col gap-2 rounded-lg border p-2 text-left transition-colors"
                      >
                        <div className="bg-surface-hover relative aspect-square w-full overflow-hidden rounded-md">
                          <Image
                            src={placeholderImage(product.seed, "1x1")}
                            alt={ps[product.nameKey]}
                            fill
                            sizes="144px"
                            className="object-cover"
                          />
                        </div>
                        <span className="text-fg truncate text-xs font-medium">
                          {ps[product.nameKey]}
                        </span>
                        <span className="text-muted truncate text-[11px]">
                          {ps[product.categoryKey]}
                        </span>
                        <span className="text-fg text-xs font-semibold">
                          {usd(product.price)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <Empty
                  icon={<IconSearchOff size={22} aria-hidden="true" />}
                  title={ps.productSearch1EmptyTitle}
                  description={ps.productSearch1EmptyDescription}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
