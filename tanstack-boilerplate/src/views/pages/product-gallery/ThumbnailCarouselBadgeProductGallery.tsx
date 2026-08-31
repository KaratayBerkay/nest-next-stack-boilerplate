"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithProductGalleryMessages } from "@/types/pages/product-gallery/ProductGalleryMessages-types";

const PRICE = 229;
const THUMB_SCROLL_STEP = 180;
const usd = (n: number) => `$${n.toFixed(2)}`;

interface GalleryImage {
  id: string;
  seed: string;
  angleKey: string;
  isNew: boolean;
}

const IMAGES: GalleryImage[] = [
  { id: "img-1", seed: "pg7-face", angleKey: "productGallery7Angle1", isNew: false },
  { id: "img-2", seed: "pg7-band", angleKey: "productGallery7Angle2", isNew: true },
  { id: "img-3", seed: "pg7-side", angleKey: "productGallery7Angle3", isNew: false },
  { id: "img-4", seed: "pg7-dock", angleKey: "productGallery7Angle4", isNew: true },
  { id: "img-5", seed: "pg7-app", angleKey: "productGallery7Angle5", isNew: false },
  { id: "img-6", seed: "pg7-lifestyle", angleKey: "productGallery7Angle6", isNew: false },
];

export function ThumbnailCarouselBadgeProductGallery() {
  const t = useMessages("pages") as unknown as PagesWithProductGalleryMessages;
  const pg = t.productGallery;
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const current = IMAGES[activeIndex];

  const scrollByStep = (direction: 1 | -1) => {
    scrollRef.current?.scrollBy({
      left: direction * THUMB_SCROLL_STEP,
      behavior: "smooth",
    });
  };

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          <span className="text-brand text-xs font-semibold tracking-wide uppercase">
            {pg.productGallery7Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {pg.productGallery7Heading}
          </h2>
          <p className="text-muted max-w-xl">{pg.productGallery7Description}</p>
        </div>

        <div className="border-border bg-surface relative mt-10 aspect-square overflow-hidden rounded-2xl border">
          <Image
            src={placeholderImage(current.seed, "1x1")}
            alt={pg[current.angleKey]}
            fill
            sizes="(min-width: 1024px) 640px, 100vw"
            className="object-cover"
          />
          {current.isNew && (
            <Badge variant="success" size="sm" className="absolute top-3 left-3">
              {pg.productGallery7NewBadgeLabel}
            </Badge>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <IconButton
            icon={<IconChevronLeft size={16} />}
            label={pg.productGallery7PrevAria}
            variant="outline"
            size="icon-sm"
            onClick={() => scrollByStep(-1)}
          />
          <div
            ref={scrollRef}
            className="flex flex-1 gap-3 overflow-x-auto scroll-smooth pb-1"
          >
            {IMAGES.map((image, index) => {
              const active = index === activeIndex;
              const label = image.isNew
                ? `${pg.productGallery7ThumbAriaPrefix} ${pg[image.angleKey]} — ${pg.productGallery7NewBadgeLabel}`
                : `${pg.productGallery7ThumbAriaPrefix} ${pg[image.angleKey]}`;
              return (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-current={active ? "true" : undefined}
                  aria-label={label}
                  className={cn(
                    "border-border bg-surface relative size-16 shrink-0 overflow-hidden rounded-xl border transition-all",
                    active
                      ? "ring-brand ring-offset-bg ring-2 ring-offset-2"
                      : "hover:border-fg/30",
                  )}
                >
                  <Image
                    src={placeholderImage(image.seed, "1x1")}
                    alt={pg[image.angleKey]}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                  {image.isNew && (
                    <span
                      aria-hidden="true"
                      className="bg-success ring-bg absolute top-1 right-1 size-2.5 rounded-full ring-2"
                    />
                  )}
                </button>
              );
            })}
          </div>
          <IconButton
            icon={<IconChevronRight size={16} />}
            label={pg.productGallery7NextAria}
            variant="outline"
            size="icon-sm"
            onClick={() => scrollByStep(1)}
          />
        </div>

        <div className="border-border mt-8 flex items-center justify-between gap-4 border-t pt-6">
          <span className="text-fg text-lg font-semibold">
            {pg.productGallery7ProductName}
          </span>
          <span className="text-fg text-lg font-semibold tabular-nums">
            {usd(PRICE)}
          </span>
        </div>
      </div>
    </section>
  );
}
