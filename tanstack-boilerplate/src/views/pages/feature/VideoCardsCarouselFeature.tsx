"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction, SyntheticEvent } from "react";
import Image from "next/image";
import { IconPlayerPlay } from "@tabler/icons-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/Carousel";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const CAROUSEL_OPTS = { align: "start", loop: true } as const;

const SLIDES = [
  {
    titleKey: "feature215Card1Title",
    bodyKey: "feature215Card1Body",
    altKey: "feature215Card1ImageAlt",
    src: "/img/placeholders/ph-4x3-6.webp",
  },
  {
    titleKey: "feature215Card2Title",
    bodyKey: "feature215Card2Body",
    altKey: "feature215Card2ImageAlt",
    src: "/img/placeholders/ph-4x3-2.webp",
  },
  {
    titleKey: "feature215Card3Title",
    bodyKey: "feature215Card3Body",
    altKey: "feature215Card3ImageAlt",
    src: "/img/placeholders/ph-4x3-0.webp",
  },
  {
    titleKey: "feature215Card4Title",
    bodyKey: "feature215Card4Body",
    altKey: "feature215Card4ImageAlt",
    src: "/img/placeholders/ph-4x3-4.webp",
  },
  {
    titleKey: "feature215Card5Title",
    bodyKey: "feature215Card5Body",
    altKey: "feature215Card5ImageAlt",
    src: "/img/placeholders/ph-4x3-4.webp",
  },
  {
    titleKey: "feature215Card6Title",
    bodyKey: "feature215Card6Body",
    altKey: "feature215Card6ImageAlt",
    src: "/img/placeholders/ph-4x3-1.webp",
  },
] as const;

const IMAGE_SIZES = "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw";

function handleSelect(
  setSelectedIndex: Dispatch<SetStateAction<number>>,
): (index: number | SyntheticEvent) => void {
  return (index: number | SyntheticEvent) => {
    if (typeof index === "number") {
      setSelectedIndex(index);
    }
  };
}

export function VideoCardsCarouselFeature() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature215Heading}
          </h2>
          <p className="text-muted leading-relaxed">{f.feature215Intro}</p>
        </div>
        <div className="mt-12">
          <Carousel
            opts={CAROUSEL_OPTS}
            onSelect={handleSelect(setSelectedIndex)}
          >
            <CarouselContent>
              {SLIDES.map((slide) => (
                <CarouselItem
                  key={slide.titleKey}
                  className="md:basis-1/2 lg:basis-1/3"
                >
                  <article className="border-border bg-surface group flex h-full flex-col overflow-hidden rounded-xl border shadow-sm">
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={slide.src}
                        alt={f[slide.altKey]}
                        width={800}
                        height={600}
                        sizes={IMAGE_SIZES}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-bg/70 flex size-14 items-center justify-center rounded-full backdrop-blur-sm">
                          <IconPlayerPlay
                            size={24}
                            className="text-fg ml-0.5"
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 p-5">
                      <h3 className="text-fg text-lg font-semibold">
                        {f[slide.titleKey]}
                      </h3>
                      <p className="text-muted text-sm leading-relaxed">
                        {f[slide.bodyKey]}
                      </p>
                    </div>
                  </article>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious aria-label={f.feature215PrevAria} />
            <CarouselNext aria-label={f.feature215NextAria} />
          </Carousel>
          <span className="text-muted mt-6 flex justify-center text-sm tabular-nums">
            {String(selectedIndex + 1).padStart(2, "0")}
            <span className="mx-1">/</span>
            {String(SLIDES.length).padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
}
