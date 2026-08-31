"use client";

import Image from "next/image";
import { IconStarFilled } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/Carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { BadgeVariant } from "@/types/ui/Badge-types";
import type { PagesWithProductListMessages } from "@/types/pages/product-list/ProductListMessages-types";

type CollectionId = "new" | "bestsellers" | "clearance";

interface ProductEntry {
  id: string;
  seed: string;
  collection: CollectionId;
  nameKey: string;
  price: number;
  rating: number;
}

const PRODUCTS: ProductEntry[] = [
  {
    id: "ccr-1",
    seed: "ccr-fable-lamp",
    collection: "new",
    nameKey: "productList7Product1Name",
    price: 58,
    rating: 4.4,
  },
  {
    id: "ccr-2",
    seed: "ccr-ridge-backpack",
    collection: "new",
    nameKey: "productList7Product2Name",
    price: 132,
    rating: 4.6,
  },
  {
    id: "ccr-3",
    seed: "ccr-cusp-earbuds",
    collection: "new",
    nameKey: "productList7Product3Name",
    price: 149,
    rating: 4.3,
  },
  {
    id: "ccr-4",
    seed: "ccr-denim-jacket",
    collection: "new",
    nameKey: "productList7Product4Name",
    price: 118,
    rating: 4.5,
  },
  {
    id: "ccr-5",
    seed: "ccr-aria-mat",
    collection: "bestsellers",
    nameKey: "productList7Product5Name",
    price: 44,
    rating: 4.8,
  },
  {
    id: "ccr-6",
    seed: "ccr-ember-skillet",
    collection: "bestsellers",
    nameKey: "productList7Product6Name",
    price: 68,
    rating: 4.9,
  },
  {
    id: "ccr-7",
    seed: "ccr-solstice-sunglasses",
    collection: "bestsellers",
    nameKey: "productList7Product7Name",
    price: 96,
    rating: 4.7,
  },
  {
    id: "ccr-8",
    seed: "ccr-pulse-tracker",
    collection: "bestsellers",
    nameKey: "productList7Product8Name",
    price: 129,
    rating: 4.6,
  },
  {
    id: "ccr-9",
    seed: "ccr-harbor-towel",
    collection: "clearance",
    nameKey: "productList7Product9Name",
    price: 22,
    rating: 4.0,
  },
  {
    id: "ccr-10",
    seed: "ccr-glow-candle",
    collection: "clearance",
    nameKey: "productList7Product10Name",
    price: 18,
    rating: 3.9,
  },
  {
    id: "ccr-11",
    seed: "ccr-nomad-pillow",
    collection: "clearance",
    nameKey: "productList7Product11Name",
    price: 26,
    rating: 4.1,
  },
  {
    id: "ccr-12",
    seed: "ccr-rustic-mugs",
    collection: "clearance",
    nameKey: "productList7Product12Name",
    price: 34,
    rating: 4.2,
  },
];

const COLLECTIONS: {
  value: CollectionId;
  labelKey: string;
  badgeKey: string;
  badgeVariant: BadgeVariant;
}[] = [
  {
    value: "new",
    labelKey: "productList7TabNew",
    badgeKey: "productList7BadgeNew",
    badgeVariant: "info",
  },
  {
    value: "bestsellers",
    labelKey: "productList7TabBestSellers",
    badgeKey: "productList7BadgeBestseller",
    badgeVariant: "success",
  },
  {
    value: "clearance",
    labelKey: "productList7TabClearance",
    badgeKey: "productList7BadgeSale",
    badgeVariant: "warning",
  },
];

const CAROUSEL_OPTS = { align: "start" as const };
const usd = (n: number) => `$${n.toFixed(2)}`;

export function CollectionCarouselRailProductList() {
  const t = useMessages("pages") as unknown as PagesWithProductListMessages;
  const pl = t.productList;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {pl.productList7Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {pl.productList7Heading}
          </h2>
          <p className="text-muted max-w-2xl leading-relaxed">
            {pl.productList7Intro}
          </p>
        </div>

        <Tabs defaultValue="new" className="mt-10">
          <TabsList>
            {COLLECTIONS.map((collection) => (
              <TabsTrigger key={collection.value} value={collection.value}>
                {pl[collection.labelKey]}
              </TabsTrigger>
            ))}
          </TabsList>

          {COLLECTIONS.map((collection) => {
            const items = PRODUCTS.filter(
              (p) => p.collection === collection.value,
            );
            return (
              <TabsContent
                key={collection.value}
                value={collection.value}
                className="mt-8"
              >
                <Carousel opts={CAROUSEL_OPTS}>
                  <CarouselContent className="gap-4">
                    {items.map((product) => (
                      <CarouselItem
                        key={product.id}
                        className="sm:basis-1/2 lg:basis-1/3"
                      >
                        <Card variant="default">
                          <div className="flex flex-col gap-3 p-4">
                            <div className="border-border bg-bg relative aspect-4/3 overflow-hidden rounded-lg border">
                              <Image
                                src={placeholderImage(product.seed, "4x3")}
                                alt={pl[product.nameKey]}
                                fill
                                sizes="(min-width: 1024px) 280px, 90vw"
                                className="object-cover"
                              />
                              <Badge
                                variant={collection.badgeVariant}
                                size="sm"
                                className="absolute top-2 left-2"
                              >
                                {pl[collection.badgeKey]}
                              </Badge>
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
                                aria-label={pl.productList7RatingAriaTemplate
                                  .replace("{name}", pl[product.nameKey])
                                  .replace(
                                    "{rating}",
                                    product.rating.toFixed(1),
                                  )}
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
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious aria-label={pl.productList7PrevAria} />
                  <CarouselNext aria-label={pl.productList7NextAria} />
                </Carousel>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </section>
  );
}
