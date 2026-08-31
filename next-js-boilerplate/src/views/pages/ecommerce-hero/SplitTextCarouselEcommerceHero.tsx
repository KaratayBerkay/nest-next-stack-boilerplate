"use client";

import Image from "next/image";
import { IconCheck } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const CAROUSEL_OPTS = { align: "start", loop: true } as const;

interface SplitProduct {
  id: string;
  name: string;
  price: string;
  seed: string;
}

const PRODUCTS: SplitProduct[] = [
  {
    id: "ceramic-mug-set",
    name: "Ceramic Mug Set of Four",
    price: "$42.00",
    seed: "ecom-hero6-a",
  },
  {
    id: "walnut-tray",
    name: "Walnut Serving Tray",
    price: "$58.00",
    seed: "ecom-hero6-b",
  },
  {
    id: "linen-napkins",
    name: "Linen Napkin Set",
    price: "$36.00",
    seed: "ecom-hero6-c",
  },
  {
    id: "pour-over-kettle",
    name: "Pour-Over Kettle",
    price: "$74.00",
    seed: "ecom-hero6-d",
  },
];

const FEATURE_KEYS = [
  "ecommerceHero6Feature1",
  "ecommerceHero6Feature2",
  "ecommerceHero6Feature3",
] as const;

export function SplitTextCarouselEcommerceHero() {
  const t = useMessages("pages") as unknown as PagesWithEcommerceHeroMessages;
  const eh = t.ecommerceHero;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
        <div className="flex flex-col items-start gap-5">
          <Badge variant="soft">{eh.ecommerceHero6Eyebrow}</Badge>
          <h1 className="text-fg text-4xl font-semibold tracking-tight lg:text-5xl">
            {eh.ecommerceHero6Heading}
          </h1>
          <p className="text-muted text-lg">{eh.ecommerceHero6Subheading}</p>
          <ul className="flex flex-col gap-2.5">
            {FEATURE_KEYS.map((key) => (
              <li
                key={key}
                className="text-fg flex items-center gap-2.5 text-sm"
              >
                <IconCheck size={16} className="text-success shrink-0" />
                {eh[key]}
              </li>
            ))}
          </ul>
          <div className="mt-2 flex flex-wrap gap-3">
            <Button variant="primary" size="lg">
              {eh.ecommerceHero6PrimaryCta}
            </Button>
            <Button variant="outline" size="lg">
              {eh.ecommerceHero6SecondaryCta}
            </Button>
          </div>
        </div>

        <Carousel opts={CAROUSEL_OPTS}>
          <CarouselContent>
            {PRODUCTS.map((product) => (
              <CarouselItem key={product.id}>
                <div className="border-border bg-surface flex flex-col overflow-hidden rounded-3xl border shadow-xs">
                  <div className="relative aspect-square">
                    <Image
                      src={placeholderImage(product.seed, "1x1")}
                      alt={product.name}
                      fill
                      sizes="(min-width: 1024px) 40vw, 90vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 p-5">
                    <div className="flex flex-col">
                      <span className="text-fg font-semibold">
                        {product.name}
                      </span>
                      <span className="text-muted text-sm">
                        {product.price}
                      </span>
                    </div>
                    <Button size="sm">{eh.ecommerceHero6AddToCart}</Button>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious aria-label={eh.ecommerceHero6PrevAria} />
          <CarouselNext aria-label={eh.ecommerceHero6NextAria} />
        </Carousel>
      </div>
    </section>
  );
}
