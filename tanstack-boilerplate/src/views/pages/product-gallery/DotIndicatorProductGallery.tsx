"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from "@/components/ui/carousel";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type {
  PagesWithProductGalleryMessages,
  ProductGalleryMessages,
} from "@/types/pages/product-gallery/ProductGalleryMessages-types";

const CAROUSEL_OPTS = { loop: true } as const;
const PRICE = 68;
const usd = (n: number) => `$${n.toFixed(2)}`;

interface GalleryImage {
  id: string;
  seed: string;
  angleKey: string;
}

const IMAGES: GalleryImage[] = [
  { id: "img-1", seed: "pg3-overview", angleKey: "productGallery3Angle1" },
  { id: "img-2", seed: "pg3-carafe", angleKey: "productGallery3Angle2" },
  { id: "img-3", seed: "pg3-dripper", angleKey: "productGallery3Angle3" },
  { id: "img-4", seed: "pg3-pouring", angleKey: "productGallery3Angle4" },
  { id: "img-5", seed: "pg3-packaging", angleKey: "productGallery3Angle5" },
];

function DotIndicators({ pg }: { pg: ProductGalleryMessages }) {
  const { selectedIndex, scrollTo } = useCarousel();

  return (
    <div className="mt-5 flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        {IMAGES.map((image, index) => {
          const active = index === selectedIndex;
          return (
            <button
              key={image.id}
              type="button"
              onClick={() => scrollTo(index)}
              aria-current={active ? "true" : undefined}
              aria-label={`${pg.productGallery3DotAriaPrefix} ${pg[image.angleKey]}`}
              className={cn(
                "h-2 rounded-full transition-all",
                active ? "bg-brand w-6" : "bg-fg/20 hover:bg-fg/40 w-2",
              )}
            />
          );
        })}
      </div>
      <span className="text-muted text-xs tabular-nums">
        {pg.productGallery3CounterLabel
          .replace("{current}", String(selectedIndex + 1))
          .replace("{total}", String(IMAGES.length))}
      </span>
    </div>
  );
}

export function DotIndicatorProductGallery() {
  const t = useMessages("pages") as unknown as PagesWithProductGalleryMessages;
  const pg = t.productGallery;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-xl flex-col items-center px-6 text-center lg:px-8">
        <span className="text-brand text-xs font-semibold tracking-wide uppercase">
          {pg.productGallery3Eyebrow}
        </span>
        <h2 className="text-fg mt-3 text-3xl font-semibold tracking-tight lg:text-4xl">
          {pg.productGallery3Heading}
        </h2>
        <p className="text-muted mt-3">{pg.productGallery3Description}</p>

        <div className="mt-8 flex w-full items-baseline justify-between gap-4">
          <span className="text-fg text-lg font-semibold">
            {pg.productGallery3ProductName}
          </span>
          <span className="text-fg text-lg font-semibold tabular-nums">
            {usd(PRICE)}
          </span>
        </div>

        <Carousel opts={CAROUSEL_OPTS} className="mt-4 w-full">
          <CarouselContent>
            {IMAGES.map((image) => (
              <CarouselItem key={image.id}>
                <div className="border-border bg-surface relative aspect-[4/5] overflow-hidden rounded-3xl border">
                  <Image
                    src={placeholderImage(image.seed, "4x5")}
                    alt={pg[image.angleKey]}
                    fill
                    sizes="(min-width: 1024px) 560px, 100vw"
                    className="object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <DotIndicators pg={pg} />
        </Carousel>
      </div>
    </section>
  );
}
