"use client";

import Image from "next/image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithGalleryBlocksMessages } from "@/types/pages/gallery/GalleryBlocksMessages-types";

interface Polaroid {
  id: string;
  seed: string;
  captionKey: string;
  dateKey: string;
  rotate: number;
}

const PHOTOS: Polaroid[] = [
  {
    id: "beach-cleanup",
    seed: "gallery6-beach-cleanup",
    captionKey: "galleryBlocks6Photo1Caption",
    dateKey: "galleryBlocks6Photo1Date",
    rotate: -6,
  },
  {
    id: "first-snow",
    seed: "gallery6-first-snow",
    captionKey: "galleryBlocks6Photo2Caption",
    dateKey: "galleryBlocks6Photo2Date",
    rotate: 4,
  },
  {
    id: "backyard-barbecue",
    seed: "gallery6-backyard-barbecue",
    captionKey: "galleryBlocks6Photo3Caption",
    dateKey: "galleryBlocks6Photo3Date",
    rotate: -3,
  },
  {
    id: "road-trip",
    seed: "gallery6-road-trip",
    captionKey: "galleryBlocks6Photo4Caption",
    dateKey: "galleryBlocks6Photo4Date",
    rotate: 7,
  },
  {
    id: "studio-wrap",
    seed: "gallery6-studio-wrap",
    captionKey: "galleryBlocks6Photo5Caption",
    dateKey: "galleryBlocks6Photo5Date",
    rotate: -8,
  },
  {
    id: "farmers-market",
    seed: "gallery6-farmers-market",
    captionKey: "galleryBlocks6Photo6Caption",
    dateKey: "galleryBlocks6Photo6Date",
    rotate: 2,
  },
  {
    id: "new-years-eve",
    seed: "gallery6-new-years-eve",
    captionKey: "galleryBlocks6Photo7Caption",
    dateKey: "galleryBlocks6Photo7Date",
    rotate: 5,
  },
];

export function PolaroidScatterGallery() {
  const t = useMessages("pages") as unknown as PagesWithGalleryBlocksMessages;
  const gb = t.galleryBlocks;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-wide uppercase">
            {gb.galleryBlocks6Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {gb.galleryBlocks6Heading}
          </h2>
          <p className="text-muted">{gb.galleryBlocks6Intro}</p>
        </div>

        <div
          className="bg-surface mt-12 flex flex-wrap items-start justify-center gap-x-2 gap-y-10 rounded-3xl p-8 sm:p-12"
          aria-label={gb.galleryBlocks6BoardAria}
        >
          {PHOTOS.map((photo) => (
            <button
              key={photo.id}
              type="button"
              style={{ transform: `rotate(${photo.rotate}deg)` }}
              className="border-border bg-bg focus-visible:ring-brand relative w-36 shrink-0 rounded-sm border p-2.5 pb-5 text-center shadow-md transition-transform duration-200 hover:z-10 hover:-translate-y-2 hover:rotate-0 hover:shadow-xl focus-visible:z-10 focus-visible:-translate-y-2 focus-visible:rotate-0 focus-visible:shadow-xl focus-visible:ring-2 focus-visible:outline-none sm:w-44"
            >
              <span
                aria-hidden="true"
                className="bg-error absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rounded-full shadow"
              />
              <span className="bg-surface relative block aspect-square overflow-hidden">
                <Image
                  src={placeholderImage(photo.seed, "1x1")}
                  alt=""
                  fill
                  sizes="(min-width: 640px) 176px, 144px"
                  className="object-cover"
                />
              </span>
              <span className="mt-2.5 flex flex-col items-center">
                <span className="text-fg font-serif text-sm italic">
                  {gb[photo.captionKey]}
                </span>
                <span className="text-muted mt-0.5 text-xs">
                  {gb[photo.dateKey]}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
