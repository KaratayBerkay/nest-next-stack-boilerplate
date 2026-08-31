"use client";

import { useState } from "react";
import Image from "next/image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const SLIDES = [
  {
    id: "s1",
    src: "/img/placeholders/ph-4x3-0.webp",
    altKey: "feature209Slide1Alt",
  },
  {
    id: "s2",
    src: "/img/placeholders/ph-4x3-2.webp",
    altKey: "feature209Slide2Alt",
  },
  {
    id: "s3",
    src: "/img/placeholders/ph-4x3-4.webp",
    altKey: "feature209Slide3Alt",
  },
  {
    id: "s4",
    src: "/img/placeholders/ph-4x3-6.webp",
    altKey: "feature209Slide4Alt",
  },
] as const;

export function ThumbnailCrossfadeGalleryFeature() {
  const [activeIndex, setActiveIndex] = useState(0);
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature209Heading}
          </h2>
          <p className="text-muted mx-auto max-w-xl">{f.feature209Intro}</p>
        </div>
        <div className="border-border bg-surface relative mt-10 aspect-[4/3] overflow-hidden rounded-xl border">
          {SLIDES.map((slide, index) => (
            <Image
              key={slide.id}
              src={slide.src}
              alt={f[slide.altKey]}
              fill
              className={`object-cover transition-opacity duration-500 ${index === activeIndex ? "opacity-100" : "opacity-0"}`}
            />
          ))}
        </div>
        <div className="mt-4 flex justify-center gap-3">
          {SLIDES.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              data-state={index === activeIndex ? "active" : "inactive"}
              aria-label={f[slide.altKey]}
              className="data-[state=active]:ring-brand overflow-hidden rounded-lg ring-2 ring-transparent transition-all data-[state=inactive]:opacity-60"
            >
              <Image
                src={slide.src}
                alt=""
                aria-hidden="true"
                width={64}
                height={48}
                className="aspect-[4/3] w-16 object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
