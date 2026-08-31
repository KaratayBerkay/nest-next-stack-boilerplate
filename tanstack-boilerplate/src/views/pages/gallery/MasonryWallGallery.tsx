"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import {
  placeholderImage,
  type PlaceholderAspect,
} from "@/views/pages/_shared/placeholder-image";
import type { PagesWithGalleryBlocksMessages } from "@/types/pages/gallery/GalleryBlocksMessages-types";

const ASPECT_CLASS: Record<PlaceholderAspect, string> = {
  "1x1": "aspect-square",
  "4x3": "aspect-[4/3]",
  "3x2": "aspect-[3/2]",
  "16x9": "aspect-video",
  "2x1": "aspect-[2/1]",
  "4x5": "aspect-[4/5]",
  "3x4": "aspect-[3/4]",
  "1x2": "aspect-[1/2]",
};

interface MasonryPhoto {
  id: string;
  seed: string;
  aspect: PlaceholderAspect;
  titleKey: string;
  locationKey: string;
}

const PHOTOS: MasonryPhoto[] = [
  {
    id: "coastal-overlook",
    seed: "gallery1-coastal-overlook",
    aspect: "3x4",
    titleKey: "galleryBlocks1Photo1Title",
    locationKey: "galleryBlocks1Photo1Location",
  },
  {
    id: "terracotta-rooftops",
    seed: "gallery1-terracotta-rooftops",
    aspect: "1x1",
    titleKey: "galleryBlocks1Photo2Title",
    locationKey: "galleryBlocks1Photo2Location",
  },
  {
    id: "morning-market",
    seed: "gallery1-morning-market",
    aspect: "4x3",
    titleKey: "galleryBlocks1Photo3Title",
    locationKey: "galleryBlocks1Photo3Location",
  },
  {
    id: "glasshouse-reflection",
    seed: "gallery1-glasshouse-reflection",
    aspect: "1x2",
    titleKey: "galleryBlocks1Photo4Title",
    locationKey: "galleryBlocks1Photo4Location",
  },
  {
    id: "canyon-switchbacks",
    seed: "gallery1-canyon-switchbacks",
    aspect: "3x2",
    titleKey: "galleryBlocks1Photo5Title",
    locationKey: "galleryBlocks1Photo5Location",
  },
  {
    id: "harbor-at-dusk",
    seed: "gallery1-harbor-at-dusk",
    aspect: "4x5",
    titleKey: "galleryBlocks1Photo6Title",
    locationKey: "galleryBlocks1Photo6Location",
  },
  {
    id: "alpine-trailhead",
    seed: "gallery1-alpine-trailhead",
    aspect: "1x1",
    titleKey: "galleryBlocks1Photo7Title",
    locationKey: "galleryBlocks1Photo7Location",
  },
  {
    id: "neon-backstreet",
    seed: "gallery1-neon-backstreet",
    aspect: "3x4",
    titleKey: "galleryBlocks1Photo8Title",
    locationKey: "galleryBlocks1Photo8Location",
  },
  {
    id: "wheat-field-horizon",
    seed: "gallery1-wheat-field-horizon",
    aspect: "4x3",
    titleKey: "galleryBlocks1Photo9Title",
    locationKey: "galleryBlocks1Photo9Location",
  },
];

export function MasonryWallGallery() {
  const t = useMessages("pages") as unknown as PagesWithGalleryBlocksMessages;
  const gb = t.galleryBlocks;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-wide uppercase">
            {gb.galleryBlocks1Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {gb.galleryBlocks1Heading}
          </h2>
          <p className="text-muted">{gb.galleryBlocks1Intro}</p>
        </div>

        <div
          className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3"
          role="list"
          aria-label={gb.galleryBlocks1GridAria}
        >
          {PHOTOS.map((photo) => (
            <figure
              key={photo.id}
              role="listitem"
              className="mb-5 break-inside-avoid"
            >
              <div
                className={cn(
                  "border-border bg-surface relative overflow-hidden rounded-2xl border",
                  ASPECT_CLASS[photo.aspect],
                )}
              >
                <Image
                  src={placeholderImage(photo.seed, photo.aspect)}
                  alt={gb[photo.titleKey]}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-2 flex flex-col">
                <span className="text-fg text-sm font-semibold">
                  {gb[photo.titleKey]}
                </span>
                <span className="text-muted text-xs">
                  {gb[photo.locationKey]}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
