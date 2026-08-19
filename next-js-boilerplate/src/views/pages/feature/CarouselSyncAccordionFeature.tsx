"use client";

import Image from "next/image";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import type { Dispatch, SetStateAction, SyntheticEvent } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
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
    value: "slide1",
    titleKey: "feature70Slide1Title",
    bodyKey: "feature70Slide1Body",
    altKey: "feature70Slide1ImageAlt",
    src: "https://picsum.photos/seed/feature70-1/800/600",
  },
  {
    value: "slide2",
    titleKey: "feature70Slide2Title",
    bodyKey: "feature70Slide2Body",
    altKey: "feature70Slide2ImageAlt",
    src: "https://picsum.photos/seed/feature70-2/800/600",
  },
  {
    value: "slide3",
    titleKey: "feature70Slide3Title",
    bodyKey: "feature70Slide3Body",
    altKey: "feature70Slide3ImageAlt",
    src: "https://picsum.photos/seed/feature70-3/800/600",
  },
  {
    value: "slide4",
    titleKey: "feature70Slide4Title",
    bodyKey: "feature70Slide4Body",
    altKey: "feature70Slide4ImageAlt",
    src: "https://picsum.photos/seed/feature70-4/800/600",
  },
] as const;

function handleSelect(
  setActiveIndex: Dispatch<SetStateAction<number>>,
): (index: number | SyntheticEvent) => void {
  return (index: number | SyntheticEvent) => {
    if (typeof index === "number") {
      setActiveIndex(index);
    }
  };
}

function handleAccordionValueChange(
  value: string,
  slides: readonly (typeof SLIDES)[number][],
  setActiveIndex: Dispatch<SetStateAction<number>>,
) {
  const index = slides.findIndex((slide) => slide.value === value);
  if (index >= 0) {
    setActiveIndex(index);
  }
}

export function CarouselSyncAccordionFeature() {
  const [activeIndex, setActiveIndex] = useState(0);
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;
  const activeSlide = SLIDES[activeIndex];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature70Heading}
          </h2>
          <p className="text-muted leading-relaxed">{f.feature70Intro}</p>
        </div>
        <div className="mt-12 grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="border-border bg-surface overflow-hidden rounded-lg border">
            <Carousel
              opts={CAROUSEL_OPTS}
              onSelect={handleSelect(setActiveIndex)}
            >
              <CarouselContent>
                {SLIDES.map((slide) => (
                  <CarouselItem key={slide.value}>
                    <Image
                      src={slide.src}
                      alt={f[slide.altKey]}
                      width={800}
                      height={600}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious aria-label={f.feature70PrevAria} />
              <CarouselNext aria-label={f.feature70NextAria} />
            </Carousel>
          </div>
          <Accordion
            type="single"
            value={activeSlide.value}
            onValueChange={(value) =>
              handleAccordionValueChange(value, SLIDES, setActiveIndex)
            }
          >
            {SLIDES.map((slide) => (
              <AccordionItem key={slide.value} value={slide.value}>
                <AccordionTrigger>
                  <span>{f[slide.titleKey]}</span>
                  <IconPlus
                    size={16}
                    className="shrink-0 transition-transform duration-300 data-[state=open]:rotate-45"
                    aria-hidden="true"
                  />
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted leading-relaxed">
                    {f[slide.bodyKey]}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
