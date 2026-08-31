"use client";

import Image from "next/image";
import { IconPlus } from "@tabler/icons-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { IconButton } from "@/components/ui/button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithShopTheLookMessages } from "@/types/pages/shop-the-look/ShopTheLookMessages-types";

const usd = (n: number) => `$${n.toFixed(2)}`;
const CAROUSEL_OPTS = { loop: true } as const;

interface StripProduct {
  id: string;
  nameKey: string;
  price: number;
  seed: string;
}

interface CarouselLook {
  id: string;
  nameKey: string;
  seed: string;
  products: StripProduct[];
}

const LOOKS: CarouselLook[] = [
  {
    id: "weekend",
    nameKey: "shopTheLook6Look1Name",
    seed: "stl6-look-1",
    products: [
      { id: "w1", nameKey: "shopTheLook6Look1Product1Name", price: 64, seed: "stl6-look1-p1" },
      { id: "w2", nameKey: "shopTheLook6Look1Product2Name", price: 88, seed: "stl6-look1-p2" },
      { id: "w3", nameKey: "shopTheLook6Look1Product3Name", price: 122, seed: "stl6-look1-p3" },
    ],
  },
  {
    id: "office",
    nameKey: "shopTheLook6Look2Name",
    seed: "stl6-look-2",
    products: [
      { id: "o1", nameKey: "shopTheLook6Look2Product1Name", price: 96, seed: "stl6-look2-p1" },
      { id: "o2", nameKey: "shopTheLook6Look2Product2Name", price: 148, seed: "stl6-look2-p2" },
      { id: "o3", nameKey: "shopTheLook6Look2Product3Name", price: 58, seed: "stl6-look2-p3" },
    ],
  },
  {
    id: "evening",
    nameKey: "shopTheLook6Look3Name",
    seed: "stl6-look-3",
    products: [
      { id: "e1", nameKey: "shopTheLook6Look3Product1Name", price: 176, seed: "stl6-look3-p1" },
      { id: "e2", nameKey: "shopTheLook6Look3Product2Name", price: 84, seed: "stl6-look3-p2" },
      { id: "e3", nameKey: "shopTheLook6Look3Product3Name", price: 132, seed: "stl6-look3-p3" },
    ],
  },
];

export function LookCarouselProductStripShopTheLook() {
  const t = useMessages("pages") as unknown as PagesWithShopTheLookMessages;
  const stl = t.shopTheLook;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="flex max-w-xl flex-col gap-3">
          <span className="text-brand text-xs font-semibold tracking-wide uppercase">
            {stl.shopTheLook6Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {stl.shopTheLook6Heading}
          </h2>
          <p className="text-muted">{stl.shopTheLook6Description}</p>
        </div>

        <Carousel opts={CAROUSEL_OPTS} className="mt-10 w-full">
          <CarouselContent>
            {LOOKS.map((look) => (
              <CarouselItem key={look.id}>
                <div className="flex flex-col gap-4 px-1">
                  <div className="border-border bg-surface relative aspect-[16/9] overflow-hidden rounded-3xl border">
                    <Image
                      src={placeholderImage(look.seed, "16x9")}
                      alt={`${stl.shopTheLook6PhotoAltPrefix} ${stl[look.nameKey]}`}
                      fill
                      sizes="(min-width: 1024px) 960px, 100vw"
                      className="object-cover"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                    />
                    <span className="absolute bottom-4 left-5 text-lg font-semibold text-white">
                      {stl[look.nameKey]}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {look.products.map((product) => (
                      <div
                        key={product.id}
                        className="border-border bg-surface flex items-center gap-2 rounded-2xl border p-2 sm:gap-3 sm:p-3"
                      >
                        <div className="bg-surface-hover relative size-10 shrink-0 overflow-hidden rounded-lg sm:size-12">
                          <Image
                            src={placeholderImage(product.seed, "1x1")}
                            alt={stl[product.nameKey]}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="text-fg truncate text-xs font-medium sm:text-sm">
                            {stl[product.nameKey]}
                          </span>
                          <span className="text-muted text-xs">
                            {usd(product.price)}
                          </span>
                        </div>
                        <IconButton
                          icon={<IconPlus size={14} />}
                          label={`${stl.shopTheLook6AddAriaPrefix} ${stl[product.nameKey]}`}
                          variant="outline"
                          size="icon-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious aria-label={stl.shopTheLook6PrevAria} />
          <CarouselNext aria-label={stl.shopTheLook6NextAria} />
        </Carousel>
      </div>
    </section>
  );
}
