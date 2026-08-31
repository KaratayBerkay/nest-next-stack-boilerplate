"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction, SyntheticEvent } from "react";
import {
  IconBuildingSkyscraper,
  IconChartBar,
  IconPalette,
  IconPlug,
  IconShieldCheck,
  IconTemplate,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/Carousel";
import { Progress } from "@/components/ui/Progress";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const CAROUSEL_OPTS = { align: "start", loop: true } as const;

const SLIDES = [
  {
    titleKey: "feature12Slide1Title",
    bodyKey: "feature12Slide1Body",
    Icon: IconPlug,
  },
  {
    titleKey: "feature12Slide2Title",
    bodyKey: "feature12Slide2Body",
    Icon: IconShieldCheck,
  },
  {
    titleKey: "feature12Slide3Title",
    bodyKey: "feature12Slide3Body",
    Icon: IconChartBar,
  },
  {
    titleKey: "feature12Slide4Title",
    bodyKey: "feature12Slide4Body",
    Icon: IconPalette,
  },
  {
    titleKey: "feature12Slide5Title",
    bodyKey: "feature12Slide5Body",
    Icon: IconTemplate,
  },
  {
    titleKey: "feature12Slide6Title",
    bodyKey: "feature12Slide6Body",
    Icon: IconBuildingSkyscraper,
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

export function CarouselProgressFeature() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  const progress = Math.round(((selectedIndex + 1) / SLIDES.length) * 100);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Badge>{f.feature12Badge}</Badge>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature12Heading}
          </h2>
        </div>
        <div className="mt-12">
          <Carousel
            opts={CAROUSEL_OPTS}
            onSelect={handleSelect(setSelectedIndex)}
          >
            <CarouselContent>
              {SLIDES.map((slide) => (
                <CarouselItem key={slide.titleKey}>
                  <div className="border-border bg-surface flex h-full flex-col gap-4 rounded-lg border p-7">
                    <span className="bg-brand text-brand-fg flex size-11 items-center justify-center rounded-md">
                      <slide.Icon size={22} aria-hidden="true" />
                    </span>
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
            <CarouselPrevious aria-label={f.feature12PrevAria} />
            <CarouselNext aria-label={f.feature12NextAria} />
          </Carousel>
          <div className="mt-8 flex items-center gap-4">
            <span className="text-muted text-sm tabular-nums">
              {String(selectedIndex + 1).padStart(2, "0")}
              <span className="mx-1">/</span>
              {String(SLIDES.length).padStart(2, "0")}
            </span>
            <Progress value={progress} className="flex-1" />
            <span className="text-muted text-sm">{f.feature12TrackLabel}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
