"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  IconChevronLeft,
  IconChevronRight,
  IconShoppingBag,
  IconStar,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button, IconButton } from "@/components/ui/button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithEcommerceHeroMessages } from "@/types/pages/ecommerce-hero/EcommerceHeroMessages-types";

const SLIDE_INTERVAL_MS = 5000;

interface PairedProduct {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  rating: string;
  badgeKey?: string;
  seed: string;
}

const PRODUCTS: PairedProduct[] = [
  {
    id: "trail-runner",
    name: "Trail Runner Sneaker",
    price: "$128.00",
    rating: "4.8",
    badgeKey: "ecommerceHero1BadgeNew",
    seed: "ecom-hero1-a",
  },
  {
    id: "canvas-tote",
    name: "Canvas Weekender Tote",
    price: "$64.00",
    originalPrice: "$82.00",
    rating: "4.6",
    seed: "ecom-hero1-b",
  },
  {
    id: "wool-jacket",
    name: "Wool Field Jacket",
    price: "$212.00",
    rating: "4.9",
    badgeKey: "ecommerceHero1BadgeBestseller",
    seed: "ecom-hero1-c",
  },
  {
    id: "leather-belt",
    name: "Leather Utility Belt",
    price: "$48.00",
    rating: "4.5",
    seed: "ecom-hero1-d",
  },
  {
    id: "linen-shirt",
    name: "Linen Overshirt",
    price: "$96.00",
    originalPrice: "$120.00",
    rating: "4.7",
    badgeKey: "ecommerceHero1BadgeNew",
    seed: "ecom-hero1-e",
  },
  {
    id: "suede-boot",
    name: "Suede Chukka Boot",
    price: "$168.00",
    rating: "4.8",
    seed: "ecom-hero1-f",
  },
];

const SLIDES: [PairedProduct, PairedProduct][] = [
  [PRODUCTS[0], PRODUCTS[1]],
  [PRODUCTS[2], PRODUCTS[3]],
  [PRODUCTS[4], PRODUCTS[5]],
];

export function PairedCardsCarouselEcommerceHero() {
  const t = useMessages("pages") as unknown as PagesWithEcommerceHeroMessages;
  const eh = t.ecommerceHero;
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const pair = SLIDES[activeIndex];

  // Auto-advance pauses while hovered/focused and stops entirely for
  // reduced-motion users; the dot controls still switch manually.
  useEffect(() => {
    if (paused || reducedMotion) return;
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % SLIDES.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [activeIndex, paused, reducedMotion]);

  return (
    <section
      className="w-full py-16 lg:py-24"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-center lg:px-8">
        <Badge variant="soft">{eh.ecommerceHero1Eyebrow}</Badge>
        <h1 className="text-fg max-w-2xl text-4xl font-semibold tracking-tight lg:text-5xl">
          {eh.ecommerceHero1Heading}
        </h1>
        <p className="text-muted max-w-xl text-lg">
          {eh.ecommerceHero1Subheading}
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Button variant="primary" size="lg">
            {eh.ecommerceHero1PrimaryCta}
          </Button>
          <Button variant="outline" size="lg">
            {eh.ecommerceHero1SecondaryCta}
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-6xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {pair.map((product) => (
            <article
              key={product.id}
              className="border-border bg-surface ring-border flex flex-col overflow-hidden rounded-3xl border shadow-xs ring-1 ring-inset"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={placeholderImage(product.seed, "4x3")}
                  alt={product.name}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
                {product.badgeKey && (
                  <Badge size="sm" className="absolute top-3 left-3">
                    {eh[product.badgeKey]}
                  </Badge>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <h3 className="text-fg font-semibold">{product.name}</h3>
                <div className="text-muted flex items-center gap-1.5 text-sm">
                  <IconStar
                    size={14}
                    className="text-warning"
                    fill="currentColor"
                  />
                  {product.rating}
                </div>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-fg text-lg font-semibold">
                      {product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-muted text-sm line-through">
                        {product.originalPrice}
                      </span>
                    )}
                  </div>
                  <IconButton
                    icon={<IconShoppingBag size={16} />}
                    label={eh.ecommerceHero1AddToCartAria}
                    variant="outline"
                    size="icon-sm"
                  />
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-4">
          <IconButton
            icon={<IconChevronLeft size={16} />}
            label={eh.ecommerceHero1PrevAria}
            variant="outline"
            size="icon-sm"
            onClick={() =>
              setActiveIndex(
                (current) => (current - 1 + SLIDES.length) % SLIDES.length,
              )
            }
          />
          <div className="flex items-center gap-2">
            {SLIDES.map((slidePair, index) => (
              <button
                key={`${slidePair[0].id}-${slidePair[1].id}`}
                type="button"
                aria-label={`${slidePair[0].name} & ${slidePair[1].name}`}
                onClick={() => setActiveIndex(index)}
                className={
                  index === activeIndex
                    ? "bg-brand size-2.5 rounded-full transition-colors"
                    : "bg-muted/30 hover:bg-muted/50 size-2.5 rounded-full transition-colors"
                }
              />
            ))}
          </div>
          <IconButton
            icon={<IconChevronRight size={16} />}
            label={eh.ecommerceHero1NextAria}
            variant="outline"
            size="icon-sm"
            onClick={() =>
              setActiveIndex((current) => (current + 1) % SLIDES.length)
            }
          />
        </div>
      </div>
    </section>
  );
}
