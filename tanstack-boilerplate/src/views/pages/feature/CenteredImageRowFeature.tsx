"use client";

import Image from "next/image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const IMAGES = [
  {
    src: "/img/placeholders/ph-4x3-7.webp",
    altKey: "feature23Image1Alt",
    captionKey: "feature23Image1Caption",
  },
  {
    src: "/img/placeholders/ph-4x3-1.webp",
    altKey: "feature23Image2Alt",
    captionKey: "feature23Image2Caption",
  },
  {
    src: "/img/placeholders/ph-4x3-6.webp",
    altKey: "feature23Image3Alt",
    captionKey: "feature23Image3Caption",
  },
  {
    src: "/img/placeholders/ph-4x3-5.webp",
    altKey: "feature23Image4Alt",
    captionKey: "feature23Image4Caption",
  },
] as const;

export function CenteredImageRowFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature23Heading}
          </h2>
          <p className="text-muted">{f.feature23Intro}</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {IMAGES.map((image) => (
            <figure key={image.src} className="flex flex-col gap-3">
              <div className="border-border bg-surface overflow-hidden rounded-lg border">
                <Image
                  src={image.src}
                  alt={f[image.altKey]}
                  width={800}
                  height={600}
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              <figcaption className="text-muted text-center text-sm">
                {f[image.captionKey]}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
