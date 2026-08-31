"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import {
  placeholderImage,
  type PlaceholderAspect,
} from "@/views/pages/_shared/placeholder-image";
import type { PagesWithGalleryBlocksMessages } from "@/types/pages/gallery/GalleryBlocksMessages-types";

interface BentoPhoto {
  id: string;
  seed: string;
  aspect: PlaceholderAspect;
  titleKey: string;
  tagKey: string;
  spanClassName: string;
}

const PHOTOS: BentoPhoto[] = [
  {
    id: "golden-hour-skyline",
    seed: "gallery8-golden-hour-skyline",
    aspect: "4x3",
    titleKey: "galleryBlocks8Photo1Title",
    tagKey: "galleryBlocks8Photo1Tag",
    spanClassName: "sm:col-span-2 sm:row-span-2",
  },
  {
    id: "rainy-window-study",
    seed: "gallery8-rainy-window-study",
    aspect: "1x1",
    titleKey: "galleryBlocks8Photo2Title",
    tagKey: "galleryBlocks8Photo2Tag",
    spanClassName: "sm:col-span-1 sm:row-span-1",
  },
  {
    id: "trailside-rest",
    seed: "gallery8-trailside-rest",
    aspect: "1x1",
    titleKey: "galleryBlocks8Photo3Title",
    tagKey: "galleryBlocks8Photo3Tag",
    spanClassName: "sm:col-span-1 sm:row-span-1",
  },
  {
    id: "wide-open-plains",
    seed: "gallery8-wide-open-plains",
    aspect: "16x9",
    titleKey: "galleryBlocks8Photo4Title",
    tagKey: "galleryBlocks8Photo4Tag",
    spanClassName: "sm:col-span-2 sm:row-span-1",
  },
  {
    id: "corner-bakery",
    seed: "gallery8-corner-bakery",
    aspect: "3x4",
    titleKey: "galleryBlocks8Photo5Title",
    tagKey: "galleryBlocks8Photo5Tag",
    spanClassName: "sm:col-span-1 sm:row-span-2",
  },
  {
    id: "quiet-library-aisle",
    seed: "gallery8-quiet-library-aisle",
    aspect: "1x1",
    titleKey: "galleryBlocks8Photo6Title",
    tagKey: "galleryBlocks8Photo6Tag",
    spanClassName: "sm:col-span-1 sm:row-span-1",
  },
  {
    id: "riverside-fog",
    seed: "gallery8-riverside-fog",
    aspect: "1x1",
    titleKey: "galleryBlocks8Photo7Title",
    tagKey: "galleryBlocks8Photo7Tag",
    spanClassName: "sm:col-span-1 sm:row-span-1",
  },
  {
    id: "late-shift",
    seed: "gallery8-late-shift",
    aspect: "1x1",
    titleKey: "galleryBlocks8Photo8Title",
    tagKey: "galleryBlocks8Photo8Tag",
    spanClassName: "sm:col-span-1 sm:row-span-1",
  },
  {
    id: "winter-harbor",
    seed: "gallery8-winter-harbor",
    aspect: "16x9",
    titleKey: "galleryBlocks8Photo9Title",
    tagKey: "galleryBlocks8Photo9Tag",
    spanClassName: "sm:col-span-2 sm:row-span-1",
  },
];

export function BentoHoverGallery() {
  const t = useMessages("pages") as unknown as PagesWithGalleryBlocksMessages;
  const gb = t.galleryBlocks;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-wide uppercase">
            {gb.galleryBlocks8Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {gb.galleryBlocks8Heading}
          </h2>
          <p className="text-muted">{gb.galleryBlocks8Intro}</p>
        </div>

        <div
          className="mt-12 grid auto-rows-[9rem] grid-cols-2 gap-4 sm:grid-cols-4"
          aria-label={gb.galleryBlocks8GridAria}
        >
          {PHOTOS.map((photo) => (
            <button
              key={photo.id}
              type="button"
              className={cn(
                "group border-border focus-visible:ring-brand relative block overflow-hidden rounded-2xl border text-left focus-visible:ring-2 focus-visible:outline-none",
                photo.spanClassName,
              )}
            >
              <Image
                src={placeholderImage(photo.seed, photo.aspect)}
                alt=""
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105 group-focus-visible:scale-105"
              />
              <div className="from-fg/85 absolute inset-0 flex flex-col justify-end gap-2 bg-gradient-to-t via-transparent to-transparent p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                <Badge variant="soft" size="sm" className="w-fit">
                  {gb[photo.tagKey]}
                </Badge>
                <span className="text-bg text-sm font-semibold">
                  {gb[photo.titleKey]}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
