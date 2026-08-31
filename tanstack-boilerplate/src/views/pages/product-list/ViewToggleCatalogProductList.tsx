"use client";

import { useState } from "react";
import Image from "next/image";
import {
  IconHeart,
  IconHeartFilled,
  IconLayoutGrid,
  IconList,
  IconStarFilled,
} from "@tabler/icons-react";
import { Card } from "@/components/ui/Card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/cn";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithProductListMessages } from "@/types/pages/product-list/ProductListMessages-types";

type ViewMode = "grid" | "list";

interface ProductEntry {
  id: string;
  seed: string;
  nameKey: string;
  categoryKey: string;
  descriptionKey: string;
  price: number;
  rating: number;
}

const PRODUCTS: ProductEntry[] = [
  {
    id: "vtc-1",
    seed: "vtc-ridge-table",
    nameKey: "productList2Product1Name",
    categoryKey: "productList2CategoryFurniture",
    descriptionKey: "productList2Product1Description",
    price: 620,
    rating: 4.5,
  },
  {
    id: "vtc-2",
    seed: "vtc-halden-stools",
    nameKey: "productList2Product2Name",
    categoryKey: "productList2CategoryKitchen",
    descriptionKey: "productList2Product2Description",
    price: 180,
    rating: 4.0,
  },
  {
    id: "vtc-3",
    seed: "vtc-solace-sofa",
    nameKey: "productList2Product3Name",
    categoryKey: "productList2CategoryOutdoor",
    descriptionKey: "productList2Product3Description",
    price: 890,
    rating: 4.9,
  },
  {
    id: "vtc-4",
    seed: "vtc-drift-chair",
    nameKey: "productList2Product4Name",
    categoryKey: "productList2CategoryOffice",
    descriptionKey: "productList2Product4Description",
    price: 340,
    rating: 4.3,
  },
  {
    id: "vtc-5",
    seed: "vtc-kettle-cookware",
    nameKey: "productList2Product5Name",
    categoryKey: "productList2CategoryKitchen",
    descriptionKey: "productList2Product5Description",
    price: 210,
    rating: 4.6,
  },
  {
    id: "vtc-6",
    seed: "vtc-lattice-divider",
    nameKey: "productList2Product6Name",
    categoryKey: "productList2CategoryFurniture",
    descriptionKey: "productList2Product6Description",
    price: 145,
    rating: 4.2,
  },
];

const usd = (n: number) => `$${n.toFixed(2)}`;

export function ViewToggleCatalogProductList() {
  const t = useMessages("pages") as unknown as PagesWithProductListMessages;
  const pl = t.productList;
  const [view, setView] = useState<ViewMode>("grid");
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  };

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex max-w-lg flex-col gap-3">
            <span className="text-brand text-xs font-semibold tracking-wider uppercase">
              {pl.productList2Eyebrow}
            </span>
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {pl.productList2Heading}
            </h2>
            <p className="text-muted leading-relaxed">{pl.productList2Intro}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-muted text-xs">
              {pl.productList2ResultsCountTemplate.replace(
                "{count}",
                String(PRODUCTS.length),
              )}
            </span>
            <ToggleGroup
              type="single"
              value={view}
              onValueChange={(value) => {
                if (value) setView(value as ViewMode);
              }}
              aria-label={pl.productList2ViewToggleAria}
            >
              <ToggleGroupItem value="grid" aria-label={pl.productList2GridViewAria}>
                <IconLayoutGrid size={16} aria-hidden="true" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label={pl.productList2ListViewAria}>
                <IconList size={16} aria-hidden="true" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {view === "grid" ? (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.map((product) => {
              const isFavorite = favorites.includes(product.id);
              return (
                <Card key={product.id} variant="default">
                  <div className="flex flex-col gap-3 p-4">
                    <div className="border-border bg-bg relative aspect-square overflow-hidden rounded-lg border">
                      <Image
                        src={placeholderImage(product.seed, "1x1")}
                        alt={pl[product.nameKey]}
                        fill
                        sizes="(min-width: 1024px) 280px, 90vw"
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => toggleFavorite(product.id)}
                        aria-pressed={isFavorite}
                        aria-label={(isFavorite
                          ? pl.productList2FavoriteRemoveAriaTemplate
                          : pl.productList2FavoriteAddAriaTemplate
                        ).replace("{name}", pl[product.nameKey])}
                        className="bg-bg/80 absolute top-2 right-2 flex size-8 items-center justify-center rounded-full backdrop-blur-sm"
                      >
                        {isFavorite ? (
                          <IconHeartFilled
                            size={16}
                            className="text-error"
                            aria-hidden="true"
                          />
                        ) : (
                          <IconHeart
                            size={16}
                            className="text-fg"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    </div>
                    <div>
                      <p className="text-muted text-xs">
                        {pl[product.categoryKey]}
                      </p>
                      <p className="text-fg truncate text-sm font-semibold">
                        {pl[product.nameKey]}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-fg text-sm font-semibold tabular-nums">
                        {usd(product.price)}
                      </span>
                      <span
                        className="text-muted flex items-center gap-1 text-xs"
                        aria-label={pl.productList2RatingAriaTemplate
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
              );
            })}
          </div>
        ) : (
          <ul className="border-border divide-border mt-10 divide-y border-t">
            {PRODUCTS.map((product) => {
              const isFavorite = favorites.includes(product.id);
              return (
                <li key={product.id} className="flex items-center gap-4 py-5">
                  <div className="border-border bg-bg relative size-20 shrink-0 overflow-hidden rounded-lg border">
                    <Image
                      src={placeholderImage(product.seed, "1x1")}
                      alt={pl[product.nameKey]}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-muted text-xs">
                      {pl[product.categoryKey]}
                    </p>
                    <p className="text-fg text-sm font-semibold">
                      {pl[product.nameKey]}
                    </p>
                    <p className="text-muted mt-1 text-sm leading-relaxed">
                      {pl[product.descriptionKey]}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="text-fg text-sm font-semibold tabular-nums">
                      {usd(product.price)}
                    </span>
                    <span
                      className="text-muted flex items-center gap-1 text-xs"
                      aria-label={pl.productList2RatingAriaTemplate
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
                  <button
                    type="button"
                    onClick={() => toggleFavorite(product.id)}
                    aria-pressed={isFavorite}
                    aria-label={(isFavorite
                      ? pl.productList2FavoriteRemoveAriaTemplate
                      : pl.productList2FavoriteAddAriaTemplate
                    ).replace("{name}", pl[product.nameKey])}
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full",
                      "hover:bg-surface-hover",
                    )}
                  >
                    {isFavorite ? (
                      <IconHeartFilled
                        size={18}
                        className="text-error"
                        aria-hidden="true"
                      />
                    ) : (
                      <IconHeart
                        size={18}
                        className="text-muted"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
