"use client";

import { useState } from "react";
import Image from "next/image";
import { IconStarFilled, IconX } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithProductListMessages } from "@/types/pages/product-list/ProductListMessages-types";

interface ProductEntry {
  id: string;
  seed: string;
  nameKey: string;
  price: number;
  rating: number;
  badgeKey?: string;
}

const PRODUCTS: ProductEntry[] = [
  {
    id: "cbg-1",
    seed: "cbg-atlas-monitor",
    nameKey: "productList5Product1Name",
    price: 329,
    rating: 4.6,
    badgeKey: "productList5BadgeNew",
  },
  {
    id: "cbg-2",
    seed: "cbg-cirrus-monitor",
    nameKey: "productList5Product2Name",
    price: 289,
    rating: 4.3,
  },
  {
    id: "cbg-3",
    seed: "cbg-flux-monitor",
    nameKey: "productList5Product3Name",
    price: 249,
    rating: 4.1,
  },
  {
    id: "cbg-4",
    seed: "cbg-orbit-monitor",
    nameKey: "productList5Product4Name",
    price: 199,
    rating: 4.0,
    badgeKey: "productList5BadgeSale",
  },
  {
    id: "cbg-5",
    seed: "cbg-vantage-monitor",
    nameKey: "productList5Product5Name",
    price: 419,
    rating: 4.8,
  },
  {
    id: "cbg-6",
    seed: "cbg-halo-monitor",
    nameKey: "productList5Product6Name",
    price: 359,
    rating: 4.5,
  },
  {
    id: "cbg-7",
    seed: "cbg-basin-monitor",
    nameKey: "productList5Product7Name",
    price: 275,
    rating: 4.2,
  },
];

const COMPARE_LIMIT = 3;
const usd = (n: number) => `$${n.toFixed(2)}`;

export function CompareBarGridProductList() {
  const t = useMessages("pages") as unknown as PagesWithProductListMessages;
  const pl = t.productList;
  const [selected, setSelected] = useState<string[]>([]);

  const limitReached = selected.length >= COMPARE_LIMIT;
  const selectedProducts = PRODUCTS.filter((p) => selected.includes(p.id));

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= COMPARE_LIMIT) return prev;
      return [...prev, id];
    });
  };

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {pl.productList5Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {pl.productList5Heading}
          </h2>
          <p className="text-muted max-w-2xl leading-relaxed">
            {pl.productList5Intro}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((product) => {
            const isSelected = selected.includes(product.id);
            const disableCheckbox = !isSelected && limitReached;
            return (
              <Card key={product.id} variant="default">
                <div className="flex flex-col gap-3 p-4">
                  <div className="border-border bg-bg relative aspect-4/3 overflow-hidden rounded-lg border">
                    <Image
                      src={placeholderImage(product.seed, "4x3")}
                      alt={pl[product.nameKey]}
                      fill
                      sizes="(min-width: 1024px) 280px, 90vw"
                      className="object-cover"
                    />
                    {product.badgeKey && (
                      <Badge
                        variant="soft"
                        size="sm"
                        className="absolute top-2 left-2"
                      >
                        {pl[product.badgeKey]}
                      </Badge>
                    )}
                  </div>
                  <p className="text-fg truncate text-sm font-semibold">
                    {pl[product.nameKey]}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-fg text-sm font-semibold tabular-nums">
                      {usd(product.price)}
                    </span>
                    <span
                      className="text-muted flex items-center gap-1 text-xs"
                      aria-label={pl.productList5RatingAriaTemplate
                        .replace("{name}", pl[product.nameKey])
                        .replace("{rating}", product.rating.toFixed(1))}
                    >
                      <IconStarFilled
                        size={14}
                        className="text-warning"
                        aria-hidden="true"
                      />
                      {product.rating.toFixed(1)}
                    </span>
                  </div>
                  <Checkbox
                    label={pl.productList5CompareLabel}
                    checked={isSelected}
                    disabled={disableCheckbox}
                    onChange={() => toggle(product.id)}
                  />
                </div>
              </Card>
            );
          })}
        </div>

        {limitReached && (
          <p className="text-muted mt-4 text-center text-xs">
            {pl.productList5LimitReachedText}
          </p>
        )}
      </div>

      {selected.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-4">
          <div className="border-border bg-bg animate-slide-in-up flex w-full max-w-3xl items-center gap-4 rounded-xl border p-3 shadow-lg motion-reduce:animate-none">
            <div className="flex items-center gap-2">
              {selectedProducts.map((product) => (
                <div
                  key={product.id}
                  className="border-border bg-surface relative size-11 shrink-0 overflow-hidden rounded-lg border"
                >
                  <Image
                    src={placeholderImage(product.seed, "1x1")}
                    alt={pl[product.nameKey]}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="text-fg flex-1 text-sm font-medium">
              {pl.productList5SelectedCountTemplate.replace(
                "{count}",
                String(selected.length),
              )}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              leftIcon={<IconX size={14} aria-hidden="true" />}
              onClick={() => setSelected([])}
            >
              {pl.productList5ClearLabel}
            </Button>
            <Button type="button" variant="primary" size="sm">
              {pl.productList5CompareButtonLabel}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
