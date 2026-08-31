"use client";

import { useState } from "react";
import Image from "next/image";
import { IconStar } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithProductGalleryMessages } from "@/types/pages/product-gallery/ProductGalleryMessages-types";

const PRICE = 142;
const RATING = "4.8";
const usd = (n: number) => `$${n.toFixed(2)}`;

interface GalleryImage {
  id: string;
  seed: string;
  angleKey: string;
}

const IMAGES: GalleryImage[] = [
  { id: "img-1", seed: "pg4-side", angleKey: "productGallery4Angle1" },
  { id: "img-2", seed: "pg4-top", angleKey: "productGallery4Angle2" },
  { id: "img-3", seed: "pg4-sole", angleKey: "productGallery4Angle3" },
  { id: "img-4", seed: "pg4-heel", angleKey: "productGallery4Angle4" },
  { id: "img-5", seed: "pg4-lifestyle", angleKey: "productGallery4Angle5" },
];

export function ThumbnailSidebarProductGallery() {
  const t = useMessages("pages") as unknown as PagesWithProductGalleryMessages;
  const pg = t.productGallery;
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const current = IMAGES[activeIndex];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          <span className="text-brand text-xs font-semibold tracking-wide uppercase">
            {pg.productGallery4Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {pg.productGallery4Heading}
          </h2>
          <p className="text-muted max-w-xl">{pg.productGallery4Description}</p>
        </div>

        <div className="mt-10 flex flex-col-reverse gap-4 lg:flex-row">
          <div
            aria-label={pg.productGallery4RailAriaLabel}
            className="flex gap-3 overflow-x-auto pb-1 lg:w-20 lg:flex-col lg:overflow-visible lg:pb-0"
          >
            {IMAGES.map((image, index) => {
              const active = index === activeIndex;
              return (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-current={active ? "true" : undefined}
                  aria-label={`${pg.productGallery4ThumbAriaPrefix} ${pg[image.angleKey]}`}
                  className={cn(
                    "border-border bg-surface relative size-16 shrink-0 overflow-hidden rounded-xl border transition-all lg:size-20",
                    active
                      ? "ring-brand ring-offset-bg ring-2 ring-offset-2"
                      : "hover:border-fg/30",
                  )}
                >
                  <Image
                    src={placeholderImage(image.seed, "1x1")}
                    alt={pg[image.angleKey]}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              );
            })}
          </div>

          <div className="border-border bg-surface relative aspect-square flex-1 overflow-hidden rounded-2xl border lg:aspect-[4/5]">
            <Image
              src={placeholderImage(current.seed, "4x5")}
              alt={pg[current.angleKey]}
              fill
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        <div className="border-border mt-8 flex items-center justify-between gap-4 border-t pt-6">
          <div className="flex flex-col gap-1">
            <span className="text-fg text-lg font-semibold">
              {pg.productGallery4ProductName}
            </span>
            <div className="text-muted flex items-center gap-1.5 text-sm">
              <IconStar
                size={14}
                className="text-warning"
                fill="currentColor"
              />
              {RATING}
            </div>
          </div>
          <span className="text-fg text-lg font-semibold tabular-nums">
            {usd(PRICE)}
          </span>
        </div>
      </div>
    </section>
  );
}
