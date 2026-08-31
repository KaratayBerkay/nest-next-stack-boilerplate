"use client";

import { useState } from "react";
import Image from "next/image";
import { IconStarFilled } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithProductListMessages } from "@/types/pages/product-list/ProductListMessages-types";

interface ProductEntry {
  id: string;
  seed: string;
  nameKey: string;
  categoryKey: string;
  price: number;
  rating: number;
}

const PRODUCTS: ProductEntry[] = [
  {
    id: "lmf-1",
    seed: "lmf-alpine-parka",
    nameKey: "productList4Product1Name",
    categoryKey: "productList4CategoryOuterwear",
    price: 220,
    rating: 4.7,
  },
  {
    id: "lmf-2",
    seed: "lmf-drift-trainer",
    nameKey: "productList4Product2Name",
    categoryKey: "productList4CategoryFootwear",
    price: 118,
    rating: 4.4,
  },
  {
    id: "lmf-3",
    seed: "lmf-canvas-tote",
    nameKey: "productList4Product3Name",
    categoryKey: "productList4CategoryBags",
    price: 68,
    rating: 4.2,
  },
  {
    id: "lmf-4",
    seed: "lmf-wool-scarf",
    nameKey: "productList4Product4Name",
    categoryKey: "productList4CategoryAccessories",
    price: 44,
    rating: 4.5,
  },
  {
    id: "lmf-5",
    seed: "lmf-quilted-vest",
    nameKey: "productList4Product5Name",
    categoryKey: "productList4CategoryOuterwear",
    price: 152,
    rating: 4.1,
  },
  {
    id: "lmf-6",
    seed: "lmf-suede-boot",
    nameKey: "productList4Product6Name",
    categoryKey: "productList4CategoryFootwear",
    price: 174,
    rating: 4.8,
  },
  {
    id: "lmf-7",
    seed: "lmf-leather-satchel",
    nameKey: "productList4Product7Name",
    categoryKey: "productList4CategoryBags",
    price: 210,
    rating: 4.6,
  },
  {
    id: "lmf-8",
    seed: "lmf-woven-belt",
    nameKey: "productList4Product8Name",
    categoryKey: "productList4CategoryAccessories",
    price: 36,
    rating: 3.9,
  },
  {
    id: "lmf-9",
    seed: "lmf-shell-jacket",
    nameKey: "productList4Product9Name",
    categoryKey: "productList4CategoryOuterwear",
    price: 195,
    rating: 4.3,
  },
  {
    id: "lmf-10",
    seed: "lmf-canvas-sneaker",
    nameKey: "productList4Product10Name",
    categoryKey: "productList4CategoryFootwear",
    price: 82,
    rating: 4.0,
  },
  {
    id: "lmf-11",
    seed: "lmf-weekend-duffel",
    nameKey: "productList4Product11Name",
    categoryKey: "productList4CategoryBags",
    price: 138,
    rating: 4.7,
  },
  {
    id: "lmf-12",
    seed: "lmf-knit-beanie",
    nameKey: "productList4Product12Name",
    categoryKey: "productList4CategoryAccessories",
    price: 26,
    rating: 4.5,
  },
];

const INITIAL_COUNT = 6;
const BATCH_SIZE = 3;
const usd = (n: number) => `$${n.toFixed(2)}`;

export function LoadMoreFeedProductList() {
  const t = useMessages("pages") as unknown as PagesWithProductListMessages;
  const pl = t.productList;
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_COUNT);

  const visible = PRODUCTS.slice(0, visibleCount);
  const allLoaded = visibleCount >= PRODUCTS.length;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {pl.productList4Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {pl.productList4Heading}
          </h2>
          <p className="text-muted max-w-2xl leading-relaxed">
            {pl.productList4Intro}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((product) => (
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
                </div>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-fg min-w-0 truncate text-sm font-semibold">
                    {pl[product.nameKey]}
                  </p>
                  <Badge variant="secondary" size="sm" className="shrink-0">
                    {pl[product.categoryKey]}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-fg text-sm font-semibold tabular-nums">
                    {usd(product.price)}
                  </span>
                  <span
                    className="text-muted flex items-center gap-1 text-xs"
                    aria-label={pl.productList4RatingAriaTemplate
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
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-3">
          <p className="text-muted text-sm">
            {pl.productList4ShowingCountTemplate
              .replace("{shown}", String(visible.length))
              .replace("{total}", String(PRODUCTS.length))}
          </p>
          {allLoaded ? (
            <p className="text-muted text-sm">{pl.productList4AllLoadedLabel}</p>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setVisibleCount((count) =>
                  Math.min(PRODUCTS.length, count + BATCH_SIZE),
                )
              }
            >
              {pl.productList4LoadMoreLabel}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
