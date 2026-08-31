"use client";

import { Button } from "@/components/ui/Button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/Carousel";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const LINK_URL = "#" as const;
const CAROUSEL_OPTS = { align: "start", loop: true } as const;

const LEFT_SLIDES = [
  { titleKey: "feature114Left1Title", bodyKey: "feature114Left1Body" },
  { titleKey: "feature114Left2Title", bodyKey: "feature114Left2Body" },
  { titleKey: "feature114Left3Title", bodyKey: "feature114Left3Body" },
  { titleKey: "feature114Left4Title", bodyKey: "feature114Left4Body" },
] as const;

const RIGHT_SLIDES = [
  { titleKey: "feature114Right1Title", bodyKey: "feature114Right1Body" },
  { titleKey: "feature114Right2Title", bodyKey: "feature114Right2Body" },
  { titleKey: "feature114Right3Title", bodyKey: "feature114Right3Body" },
  { titleKey: "feature114Right4Title", bodyKey: "feature114Right4Body" },
] as const;

export function VerticalCarouselSplitFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
          <div className="flex flex-col items-start gap-5 lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature114Heading}
            </h2>
            <p className="text-muted leading-relaxed">
              {f.feature114Paragraph}
            </p>
            <Button asChild variant="outline">
              <a href={LINK_URL}>{f.feature114CtaLabel}</a>
            </Button>
          </div>
          <div className="lg:col-span-2">
            <Carousel opts={CAROUSEL_OPTS}>
              <CarouselContent className="h-64 lg:h-72">
                {LEFT_SLIDES.map((slide) => (
                  <CarouselItem key={slide.titleKey} className="h-full">
                    <div className="border-border bg-surface flex h-full flex-col gap-3 rounded-lg border p-6">
                      <h3 className="text-fg text-lg font-semibold tracking-tight">
                        {f[slide.titleKey]}
                      </h3>
                      <p className="text-muted text-sm leading-relaxed">
                        {f[slide.bodyKey]}
                      </p>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious aria-label={f.feature114LeftPrevAria} />
              <CarouselNext aria-label={f.feature114LeftNextAria} />
            </Carousel>
          </div>
          <div className="lg:col-span-2 lg:col-start-2">
            <Carousel opts={CAROUSEL_OPTS}>
              <CarouselContent className="h-64 lg:h-72">
                {RIGHT_SLIDES.map((slide) => (
                  <CarouselItem key={slide.titleKey} className="h-full">
                    <div className="border-border bg-surface flex h-full flex-col gap-3 rounded-lg border p-6">
                      <h3 className="text-fg text-lg font-semibold tracking-tight">
                        {f[slide.titleKey]}
                      </h3>
                      <p className="text-muted text-sm leading-relaxed">
                        {f[slide.bodyKey]}
                      </p>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious aria-label={f.feature114RightPrevAria} />
              <CarouselNext aria-label={f.feature114RightNextAria} />
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
}
