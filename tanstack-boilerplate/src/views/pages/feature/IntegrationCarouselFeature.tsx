"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction, SyntheticEvent } from "react";
import {
  IconArrowRight,
  IconBrandAsana,
  IconBrandFigma,
  IconBrandGithub,
  IconBrandGoogle,
  IconBrandJira,
  IconBrandNotion,
  IconBrandSlack,
  IconBrandStripe,
  IconBrandVercel,
} from "@tabler/icons-react";
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
    titleKey: "feature153Slide1Title",
    bodyKey: "feature153Slide1Body",
    rows: [
      {
        titleKey: "feature153Slide1Row1Title",
        bodyKey: "feature153Slide1Row1Body",
        Icon: IconBrandSlack,
      },
      {
        titleKey: "feature153Slide1Row2Title",
        bodyKey: "feature153Slide1Row2Body",
        Icon: IconBrandNotion,
      },
      {
        titleKey: "feature153Slide1Row3Title",
        bodyKey: "feature153Slide1Row3Body",
        Icon: IconBrandGoogle,
      },
    ],
  },
  {
    titleKey: "feature153Slide2Title",
    bodyKey: "feature153Slide2Body",
    rows: [
      {
        titleKey: "feature153Slide2Row1Title",
        bodyKey: "feature153Slide2Row1Body",
        Icon: IconBrandFigma,
      },
      {
        titleKey: "feature153Slide2Row2Title",
        bodyKey: "feature153Slide2Row2Body",
        Icon: IconBrandGithub,
      },
      {
        titleKey: "feature153Slide2Row3Title",
        bodyKey: "feature153Slide2Row3Body",
        Icon: IconBrandVercel,
      },
    ],
  },
  {
    titleKey: "feature153Slide3Title",
    bodyKey: "feature153Slide3Body",
    rows: [
      {
        titleKey: "feature153Slide3Row1Title",
        bodyKey: "feature153Slide3Row1Body",
        Icon: IconBrandStripe,
      },
      {
        titleKey: "feature153Slide3Row2Title",
        bodyKey: "feature153Slide3Row2Body",
        Icon: IconBrandAsana,
      },
      {
        titleKey: "feature153Slide3Row3Title",
        bodyKey: "feature153Slide3Row3Body",
        Icon: IconBrandJira,
      },
    ],
  },
] as const;

function handleSelect(
  setSelectedIndex: Dispatch<SetStateAction<number>>,
): (index: number | SyntheticEvent) => void {
  return (index: number | SyntheticEvent) => {
    if (typeof index === "number") {
      setSelectedIndex(index);
    }
  };
}

export function IntegrationCarouselFeature() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-2xl flex-col gap-4">
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature153Heading}
            </h2>
            <p className="text-muted leading-relaxed">{f.feature153Intro}</p>
          </div>
          <span className="text-muted text-sm tabular-nums">
            {String(selectedIndex + 1).padStart(2, "0")}
            <span className="mx-1">/</span>
            {String(SLIDES.length).padStart(2, "0")}
          </span>
        </div>
        <div className="mt-12">
          <Carousel
            opts={CAROUSEL_OPTS}
            onSelect={handleSelect(setSelectedIndex)}
          >
            <CarouselContent>
              {SLIDES.map((slide) => (
                <CarouselItem key={slide.titleKey}>
                  <div className="border-border bg-surface overflow-hidden rounded-xl border shadow-sm">
                    <div className="flex flex-col gap-1 px-6 pt-6 pb-6">
                      <h3 className="text-fg text-lg font-semibold">
                        {f[slide.titleKey]}
                      </h3>
                      <p className="text-muted text-sm leading-relaxed">
                        {f[slide.bodyKey]}
                      </p>
                    </div>
                    <div className="divide-border-border border-border divide-y border-t">
                      {slide.rows.map((row) => (
                        <div
                          key={row.titleKey}
                          className="flex items-center gap-4 px-6 py-5"
                        >
                          <span className="border-border bg-surface-hover flex size-11 shrink-0 items-center justify-center rounded-lg border">
                            <row.Icon
                              size={20}
                              className="text-fg"
                              aria-hidden="true"
                            />
                          </span>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-fg text-sm font-semibold">
                              {f[row.titleKey]}
                            </h4>
                            <p className="text-muted truncate text-sm">
                              {f[row.bodyKey]}
                            </p>
                          </div>
                          <IconArrowRight
                            size={16}
                            className="text-muted shrink-0"
                            aria-hidden="true"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious aria-label={f.feature153PrevAria} />
            <CarouselNext aria-label={f.feature153NextAria} />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
