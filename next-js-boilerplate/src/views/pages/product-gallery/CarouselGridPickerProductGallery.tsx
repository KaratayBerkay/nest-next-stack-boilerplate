"use client";

import Image from "next/image";
import { IconCheck } from "@tabler/icons-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
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
const PRICE = 179;
const usd = (n: number) => `$${n.toFixed(2)}`;

interface GalleryImage {
  id: string;
  seed: string;
  angleKey: string;
}

const IMAGES: GalleryImage[] = [
  { id: "img-1", seed: "pg1-front", angleKey: "productGallery1Angle1" },
  { id: "img-2", seed: "pg1-side", angleKey: "productGallery1Angle2" },
  { id: "img-3", seed: "pg1-folded", angleKey: "productGallery1Angle3" },
  { id: "img-4", seed: "pg1-cushion", angleKey: "productGallery1Angle4" },
  { id: "img-5", seed: "pg1-case", angleKey: "productGallery1Angle5" },
  { id: "img-6", seed: "pg1-lifestyle", angleKey: "productGallery1Angle6" },
];

function GridPicker({ pg }: { pg: ProductGalleryMessages }) {
  const { selectedIndex, scrollTo } = useCarousel();

  return (
    <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
      {IMAGES.map((image, index) => {
        const active = index === selectedIndex;
        return (
          <button
            key={image.id}
            type="button"
            onClick={() => scrollTo(index)}
            aria-label={`${pg.productGallery1ThumbAriaPrefix} ${pg[image.angleKey]}`}
            aria-current={active ? "true" : undefined}
            className={cn(
              "border-border bg-surface relative aspect-square overflow-hidden rounded-xl border transition-all",
              active
                ? "ring-brand ring-offset-bg ring-2 ring-offset-2"
                : "hover:border-fg/30",
            )}
          >
            <Image
              src={placeholderImage(image.seed, "1x1")}
              alt={pg[image.angleKey]}
              fill
              sizes="120px"
              className="object-cover"
            />
            {active && (
              <span className="bg-brand text-brand-fg absolute top-1 right-1 flex size-5 items-center justify-center rounded-full">
                <IconCheck size={12} stroke={3} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function CarouselGridPickerProductGallery() {
  const t = useMessages("pages") as unknown as PagesWithProductGalleryMessages;
  const pg = t.productGallery;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          <span className="text-brand text-xs font-semibold tracking-wide uppercase">
            {pg.productGallery1Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {pg.productGallery1Heading}
          </h2>
          <p className="text-muted">{pg.productGallery1Description}</p>
        </div>

        <div className="mt-10 flex items-center justify-between gap-4">
          <span className="text-fg text-lg font-semibold">
            {pg.productGallery1ProductName}
          </span>
          <span className="text-fg text-lg font-semibold tabular-nums">
            {usd(PRICE)}
          </span>
        </div>

        <Carousel opts={CAROUSEL_OPTS} className="mt-4 w-full">
          <CarouselContent>
            {IMAGES.map((image) => (
              <CarouselItem key={image.id}>
                <div className="border-border bg-surface relative aspect-square overflow-hidden rounded-2xl border">
                  <Image
                    src={placeholderImage(image.seed, "1x1")}
                    alt={pg[image.angleKey]}
                    fill
                    sizes="(min-width: 1024px) 640px, 100vw"
                    className="object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious aria-label={pg.productGallery1PrevAria} />
          <CarouselNext aria-label={pg.productGallery1NextAria} />
          <GridPicker pg={pg} />
        </Carousel>
      </div>
    </section>
  );
}
