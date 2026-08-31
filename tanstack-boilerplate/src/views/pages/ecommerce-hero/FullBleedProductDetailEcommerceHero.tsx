"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction, SyntheticEvent } from "react";
import Image from "next/image";
import {
  IconMinus,
  IconPlus,
  IconShoppingBag,
  IconStar,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button, IconButton } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithEcommerceHeroMessages } from "@/types/pages/ecommerce-hero/EcommerceHeroMessages-types";

const CAROUSEL_OPTS = { loop: true } as const;
const MIN_QUANTITY = 1;
const MAX_QUANTITY = 9;
const SIZE_LABELS = ["S", "M", "L", "XL"] as const;

interface FeaturedProduct {
  id: string;
  name: string;
  price: string;
  rating: string;
  seed: string;
}

const PRODUCTS: FeaturedProduct[] = [
  {
    id: "aero-jacket",
    name: "Aero Shell Jacket",
    price: "$248.00",
    rating: "4.9",
    seed: "ecom-hero7-a",
  },
  {
    id: "trek-pant",
    name: "Trek Utility Pant",
    price: "$118.00",
    rating: "4.7",
    seed: "ecom-hero7-b",
  },
  {
    id: "glacier-vest",
    name: "Glacier Insulated Vest",
    price: "$164.00",
    rating: "4.8",
    seed: "ecom-hero7-c",
  },
];

function handleSelect(
  setSelectedIndex: Dispatch<SetStateAction<number>>,
): (index: number | SyntheticEvent) => void {
  return (index: number | SyntheticEvent) => {
    if (typeof index === "number") setSelectedIndex(index);
  };
}

export function FullBleedProductDetailEcommerceHero() {
  const t = useMessages("pages") as unknown as PagesWithEcommerceHeroMessages;
  const eh = t.ecommerceHero;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [size, setSize] = useState<(typeof SIZE_LABELS)[number]>("M");
  const [quantity, setQuantity] = useState(MIN_QUANTITY);
  const product = PRODUCTS[selectedIndex];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto mb-8 flex max-w-6xl flex-col gap-1.5 px-6 lg:px-8">
        <span className="text-muted text-xs font-medium tracking-widest uppercase">
          {eh.ecommerceHero7Eyebrow}
        </span>
        <h1 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
          {eh.ecommerceHero7Heading}
        </h1>
      </div>

      <Carousel
        opts={CAROUSEL_OPTS}
        onSelect={handleSelect(setSelectedIndex)}
        className="w-full"
      >
        <CarouselContent>
          {PRODUCTS.map((item) => (
            <CarouselItem key={item.id}>
              <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[21/9]">
                <Image
                  src={placeholderImage(item.seed, "16x9")}
                  alt={item.name}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious aria-label={eh.ecommerceHero7PrevAria} />
        <CarouselNext aria-label={eh.ecommerceHero7NextAria} />
      </Carousel>

      {/* Overlaps the bottom edge of the carousel image once there is
          enough height for it not to collide with the nav arrows above;
          on narrow screens it simply falls into normal flow below. */}
      <div className="mx-auto max-w-6xl px-6 sm:-mt-24 lg:px-8">
        <div className="border-border bg-bg flex w-full max-w-md flex-col gap-4 rounded-3xl border p-6 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-fg text-lg font-semibold">
                {product.name}
              </span>
              <div className="text-muted flex items-center gap-1.5 text-sm">
                <IconStar
                  size={14}
                  className="text-warning"
                  fill="currentColor"
                />
                {product.rating}
              </div>
            </div>
            <Badge variant="success" size="sm">
              {eh.ecommerceHero7InStock}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted text-sm">
              {eh.ecommerceHero7SizeLabel}
            </span>
            <div className="flex gap-1.5">
              {SIZE_LABELS.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setSize(label)}
                  data-state={size === label ? "active" : "inactive"}
                  className="data-[state=active]:bg-brand data-[state=active]:text-brand-fg data-[state=inactive]:bg-surface data-[state=inactive]:text-muted size-8 rounded-full text-xs font-medium transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-fg text-2xl font-semibold tracking-tight">
              {product.price}
            </span>
            <div className="border-border flex items-center gap-1 rounded-full border p-1">
              <IconButton
                icon={<IconMinus size={14} />}
                label={eh.ecommerceHero7DecreaseAria}
                variant="ghost"
                size="icon-xs"
                disabled={quantity <= MIN_QUANTITY}
                onClick={() =>
                  setQuantity((q) => Math.max(MIN_QUANTITY, q - 1))
                }
              />
              <span className="text-fg w-5 text-center text-sm tabular-nums">
                {quantity}
              </span>
              <IconButton
                icon={<IconPlus size={14} />}
                label={eh.ecommerceHero7IncreaseAria}
                variant="ghost"
                size="icon-xs"
                disabled={quantity >= MAX_QUANTITY}
                onClick={() =>
                  setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))
                }
              />
            </div>
          </div>

          <Button variant="primary" className="w-full">
            <IconShoppingBag size={16} />
            {eh.ecommerceHero7AddToCart}
          </Button>
        </div>
      </div>
    </section>
  );
}
