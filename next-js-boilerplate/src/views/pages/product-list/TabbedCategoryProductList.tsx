"use client";

import { useState } from "react";
import Image from "next/image";
import {
  IconCheck,
  IconShoppingCart,
  IconStarFilled,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithProductListMessages } from "@/types/pages/product-list/ProductListMessages-types";

type CategoryId = "desks" | "chairs" | "accessories";

interface ProductEntry {
  id: string;
  seed: string;
  category: CategoryId;
  nameKey: string;
  blurbKey: string;
  price: number;
  rating: number;
}

const PRODUCTS: ProductEntry[] = [
  {
    id: "tcp-1",
    seed: "tcp-anchor-desk",
    category: "desks",
    nameKey: "productList3Product1Name",
    blurbKey: "productList3Product1Blurb",
    price: 480,
    rating: 4.7,
  },
  {
    id: "tcp-2",
    seed: "tcp-cove-desk",
    category: "desks",
    nameKey: "productList3Product2Name",
    blurbKey: "productList3Product2Blurb",
    price: 260,
    rating: 4.3,
  },
  {
    id: "tcp-3",
    seed: "tcp-bramble-desk",
    category: "desks",
    nameKey: "productList3Product3Name",
    blurbKey: "productList3Product3Blurb",
    price: 390,
    rating: 4.5,
  },
  {
    id: "tcp-4",
    seed: "tcp-ember-chair",
    category: "chairs",
    nameKey: "productList3Product4Name",
    blurbKey: "productList3Product4Blurb",
    price: 310,
    rating: 4.8,
  },
  {
    id: "tcp-5",
    seed: "tcp-wick-chair",
    category: "chairs",
    nameKey: "productList3Product5Name",
    blurbKey: "productList3Product5Blurb",
    price: 275,
    rating: 4.4,
  },
  {
    id: "tcp-6",
    seed: "tcp-bolt-chair",
    category: "chairs",
    nameKey: "productList3Product6Name",
    blurbKey: "productList3Product6Blurb",
    price: 140,
    rating: 4.1,
  },
  {
    id: "tcp-7",
    seed: "tcp-glide-arm",
    category: "accessories",
    nameKey: "productList3Product7Name",
    blurbKey: "productList3Product7Blurb",
    price: 65,
    rating: 4.2,
  },
  {
    id: "tcp-8",
    seed: "tcp-nest-organizer",
    category: "accessories",
    nameKey: "productList3Product8Name",
    blurbKey: "productList3Product8Blurb",
    price: 38,
    rating: 4.0,
  },
  {
    id: "tcp-9",
    seed: "tcp-halo-lamp",
    category: "accessories",
    nameKey: "productList3Product9Name",
    blurbKey: "productList3Product9Blurb",
    price: 72,
    rating: 4.6,
  },
];

const TABS: { value: "all" | CategoryId; labelKey: string }[] = [
  { value: "all", labelKey: "productList3TabAll" },
  { value: "desks", labelKey: "productList3TabDesks" },
  { value: "chairs", labelKey: "productList3TabChairs" },
  { value: "accessories", labelKey: "productList3TabAccessories" },
];

const usd = (n: number) => `$${n.toFixed(2)}`;

export function TabbedCategoryProductList() {
  const t = useMessages("pages") as unknown as PagesWithProductListMessages;
  const pl = t.productList;
  const [added, setAdded] = useState<string[]>([]);

  const toggleAdded = (id: string) => {
    setAdded((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  };

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {pl.productList3Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {pl.productList3Heading}
          </h2>
          <p className="text-muted leading-relaxed">{pl.productList3Intro}</p>
        </div>

        <Tabs defaultValue="all" className="mt-10">
          <TabsList className="mx-auto w-fit">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {pl[tab.labelKey]}
              </TabsTrigger>
            ))}
          </TabsList>

          {TABS.map((tab) => {
            const items =
              tab.value === "all"
                ? PRODUCTS
                : PRODUCTS.filter((p) => p.category === tab.value);
            return (
              <TabsContent key={tab.value} value={tab.value} className="mt-8">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((product) => {
                    const isAdded = added.includes(product.id);
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
                          </div>
                          <div>
                            <p className="text-fg text-sm font-semibold">
                              {pl[product.nameKey]}
                            </p>
                            <p className="text-muted mt-1 text-xs leading-relaxed">
                              {pl[product.blurbKey]}
                            </p>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-fg text-sm font-semibold tabular-nums">
                              {usd(product.price)}
                            </span>
                            <span
                              className="text-muted flex items-center gap-1 text-xs"
                              aria-label={pl.productList3RatingAriaTemplate
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
                          <Button
                            type="button"
                            variant={isAdded ? "soft" : "outline"}
                            size="sm"
                            leftIcon={
                              isAdded ? (
                                <IconCheck size={16} aria-hidden="true" />
                              ) : (
                                <IconShoppingCart
                                  size={16}
                                  aria-hidden="true"
                                />
                              )
                            }
                            onClick={() => toggleAdded(product.id)}
                          >
                            {isAdded
                              ? pl.productList3AddedLabel
                              : pl.productList3AddToCartLabel}
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </section>
  );
}
