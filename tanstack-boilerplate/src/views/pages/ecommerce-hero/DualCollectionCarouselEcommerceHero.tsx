"use client";

import Link from "next/link";
import Image from "next/image";
import { IconArrowRight } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
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

interface CollectionProduct {
  id: string;
  name: string;
  price: string;
  seed: string;
}

interface Collection {
  id: string;
  titleKey: string;
  ctaKey: string;
  prevAriaKey: string;
  nextAriaKey: string;
  products: CollectionProduct[];
}

const COLLECTIONS: Collection[] = [
  {
    id: "new-arrivals",
    titleKey: "ecommerceHero8Collection1Title",
    ctaKey: "ecommerceHero8Collection1Cta",
    prevAriaKey: "ecommerceHero8Collection1PrevAria",
    nextAriaKey: "ecommerceHero8Collection1NextAria",
    products: [
      {
        id: "na-1",
        name: "Cloud Knit Sweater",
        price: "$86.00",
        seed: "ecom-hero8-a",
      },
      {
        id: "na-2",
        name: "Ribbed Beanie",
        price: "$28.00",
        seed: "ecom-hero8-b",
      },
      {
        id: "na-3",
        name: "Flannel Overshirt",
        price: "$74.00",
        seed: "ecom-hero8-c",
      },
    ],
  },
  {
    id: "best-sellers",
    titleKey: "ecommerceHero8Collection2Title",
    ctaKey: "ecommerceHero8Collection2Cta",
    prevAriaKey: "ecommerceHero8Collection2PrevAria",
    nextAriaKey: "ecommerceHero8Collection2NextAria",
    products: [
      {
        id: "bs-1",
        name: "Classic Denim Jacket",
        price: "$142.00",
        seed: "ecom-hero8-d",
      },
      {
        id: "bs-2",
        name: "Everyday Sneaker",
        price: "$98.00",
        seed: "ecom-hero8-e",
      },
      {
        id: "bs-3",
        name: "Canvas Duffel",
        price: "$116.00",
        seed: "ecom-hero8-f",
      },
    ],
  },
];

export function DualCollectionCarouselEcommerceHero() {
  const t = useMessages("pages") as unknown as PagesWithEcommerceHeroMessages;
  const eh = t.ecommerceHero;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <Badge variant="soft">{eh.ecommerceHero8Eyebrow}</Badge>
          <h1 className="text-fg text-4xl font-semibold tracking-tight lg:text-5xl">
            {eh.ecommerceHero8Heading}
          </h1>
          <p className="text-muted text-lg">{eh.ecommerceHero8Subheading}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-8">
          {COLLECTIONS.map((collection) => (
            <div key={collection.id} className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-fg text-lg font-semibold">
                  {eh[collection.titleKey]}
                </h2>
                <Link
                  href="#"
                  className="text-brand flex items-center gap-1 text-sm font-medium"
                >
                  {eh[collection.ctaKey]}
                  <IconArrowRight size={14} />
                </Link>
              </div>
              <Carousel opts={CAROUSEL_OPTS}>
                <CarouselContent className="gap-4">
                  {collection.products.map((product) => (
                    <CarouselItem key={product.id} className="basis-1/2">
                      <div className="border-border bg-surface flex flex-col overflow-hidden rounded-2xl border shadow-xs">
                        <div className="relative aspect-square">
                          <Image
                            src={placeholderImage(product.seed, "1x1")}
                            alt={product.name}
                            fill
                            sizes="(min-width: 1024px) 20vw, 40vw"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col gap-0.5 p-3">
                          <span className="text-fg text-sm font-medium">
                            {product.name}
                          </span>
                          <span className="text-muted text-xs">
                            {product.price}
                          </span>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious aria-label={eh[collection.prevAriaKey]} />
                <CarouselNext aria-label={eh[collection.nextAriaKey]} />
              </Carousel>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
