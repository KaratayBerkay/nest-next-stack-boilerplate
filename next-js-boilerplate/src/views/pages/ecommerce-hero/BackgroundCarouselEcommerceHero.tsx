"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  IconChevronLeft,
  IconChevronRight,
  IconShoppingBag,
} from "@tabler/icons-react";
import { Button, IconButton } from "@/components/ui/button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithEcommerceHeroMessages } from "@/types/pages/ecommerce-hero/EcommerceHeroMessages-types";

const SLIDE_INTERVAL_MS = 4000;
const BACKDROP_SEED = "ecom-hero3-backdrop";

interface SpotlightProduct {
  id: string;
  name: string;
  price: string;
  seed: string;
}

const PRODUCTS: SpotlightProduct[] = [
  {
    id: "desert-parka",
    name: "Desert Storm Parka",
    price: "$189.00",
    seed: "ecom-hero3-a",
  },
  {
    id: "ridge-backpack",
    name: "Ridge Trail Backpack",
    price: "$134.00",
    seed: "ecom-hero3-b",
  },
  {
    id: "summit-boot",
    name: "Summit Hiking Boot",
    price: "$156.00",
    seed: "ecom-hero3-c",
  },
  {
    id: "alpine-fleece",
    name: "Alpine Half-Zip Fleece",
    price: "$88.00",
    seed: "ecom-hero3-d",
  },
];

export function BackgroundCarouselEcommerceHero() {
  const t = useMessages("pages") as unknown as PagesWithEcommerceHeroMessages;
  const eh = t.ecommerceHero;
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const active = PRODUCTS[activeIndex];

  // Auto-advance pauses while hovered/focused and stops entirely for
  // reduced-motion users; the dot controls still switch manually.
  useEffect(() => {
    if (paused || reducedMotion) return;
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % PRODUCTS.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [activeIndex, paused, reducedMotion]);

  return (
    <section
      className="relative w-full overflow-hidden py-24 lg:py-32"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <Image
        src={placeholderImage(BACKDROP_SEED, "16x9")}
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:px-8">
        <div className="flex max-w-xl flex-col gap-4">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/30 px-3 py-1 text-xs font-medium tracking-widest text-white uppercase">
            {eh.ecommerceHero3Eyebrow}
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-white lg:text-5xl">
            {eh.ecommerceHero3Heading}
          </h1>
          <p className="text-lg text-white/80">{eh.ecommerceHero3Subheading}</p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Button variant="shadow" size="lg">
              {eh.ecommerceHero3PrimaryCta}
            </Button>
            <Button variant="default" size="lg">
              {eh.ecommerceHero3SecondaryCta}
            </Button>
          </div>
        </div>

        <div className="bg-bg/95 border-border flex w-full max-w-md flex-col gap-4 rounded-3xl border p-4 shadow-xl backdrop-blur-sm sm:flex-row sm:items-center">
          <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-2xl sm:size-24">
            <Image
              src={placeholderImage(active.seed, "1x1")}
              alt={active.name}
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <span className="text-fg font-semibold">{active.name}</span>
            <span className="text-muted text-sm">{active.price}</span>
          </div>
          <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-end">
            <IconButton
              icon={<IconShoppingBag size={16} />}
              label={eh.ecommerceHero3AddToCartAria}
              variant="primary"
              size="icon-sm"
            />
            <div className="flex items-center gap-1.5">
              <IconButton
                icon={<IconChevronLeft size={14} />}
                label={eh.ecommerceHero3PrevAria}
                variant="ghost"
                size="icon-xs"
                onClick={() =>
                  setActiveIndex(
                    (current) =>
                      (current - 1 + PRODUCTS.length) % PRODUCTS.length,
                  )
                }
              />
              {PRODUCTS.map((product, index) => (
                <button
                  key={product.id}
                  type="button"
                  aria-label={product.name}
                  onClick={() => setActiveIndex(index)}
                  className={
                    index === activeIndex
                      ? "bg-brand size-1.5 rounded-full transition-colors"
                      : "bg-muted/40 hover:bg-muted/60 size-1.5 rounded-full transition-colors"
                  }
                />
              ))}
              <IconButton
                icon={<IconChevronRight size={14} />}
                label={eh.ecommerceHero3NextAria}
                variant="ghost"
                size="icon-xs"
                onClick={() =>
                  setActiveIndex((current) => (current + 1) % PRODUCTS.length)
                }
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
