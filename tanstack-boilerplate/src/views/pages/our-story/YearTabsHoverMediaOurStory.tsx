"use client";

import { useState } from "react";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { cn } from "@/lib/cn";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithOurStoryMessages } from "@/types/pages/our-story/OurStoryMessages-types";

interface YearEntry {
  id: string;
  labelKey: string;
  headingKey: string;
  bodyKey: string;
  imageAltKey: string;
  seed: string;
}

const YEARS: YearEntry[] = [
  {
    id: "napkin",
    labelKey: "ourStory5Year1Label",
    headingKey: "ourStory5Year1Heading",
    bodyKey: "ourStory5Year1Body",
    imageAltKey: "ourStory5Year1ImageAlt",
    seed: "our-story-5-napkin",
  },
  {
    id: "workspace",
    labelKey: "ourStory5Year2Label",
    headingKey: "ourStory5Year2Heading",
    bodyKey: "ourStory5Year2Body",
    imageAltKey: "ourStory5Year2ImageAlt",
    seed: "our-story-5-workspace",
  },
  {
    id: "team",
    labelKey: "ourStory5Year3Label",
    headingKey: "ourStory5Year3Heading",
    bodyKey: "ourStory5Year3Body",
    imageAltKey: "ourStory5Year3ImageAlt",
    seed: "our-story-5-team",
  },
  {
    id: "remote",
    labelKey: "ourStory5Year4Label",
    headingKey: "ourStory5Year4Heading",
    bodyKey: "ourStory5Year4Body",
    imageAltKey: "ourStory5Year4ImageAlt",
    seed: "our-story-5-remote",
  },
  {
    id: "studio",
    labelKey: "ourStory5Year5Label",
    headingKey: "ourStory5Year5Heading",
    bodyKey: "ourStory5Year5Body",
    imageAltKey: "ourStory5Year5ImageAlt",
    seed: "our-story-5-studio",
  },
];

const IMAGE_SIZES = "(max-width: 768px) 100vw, 45vw";

export function YearTabsHoverMediaOurStory() {
  const t = useMessages("pages") as unknown as PagesWithOurStoryMessages;
  const os = t.ourStory;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const activeIndex = hoveredIndex ?? selectedIndex;
  const active = YEARS[activeIndex];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 lg:gap-14 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {os.ourStory5Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {os.ourStory5Intro}
          </Typography>
        </div>

        <div className="flex flex-col gap-10 md:flex-row md:gap-14">
          <div className="flex shrink-0 flex-row gap-1 overflow-x-auto md:w-1/3 md:flex-col md:gap-1 md:overflow-visible">
            {YEARS.map((year, index) => (
              <button
                key={year.id}
                type="button"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onFocus={() => setHoveredIndex(index)}
                onBlur={() => setHoveredIndex(null)}
                onClick={() => setSelectedIndex(index)}
                aria-current={index === activeIndex}
                className={cn(
                  "border-border shrink-0 border-l-2 px-4 py-3 text-left transition-colors",
                  index === activeIndex
                    ? "border-brand text-fg"
                    : "text-muted hover:text-fg border-transparent",
                )}
              >
                <span className="text-2xl font-medium tracking-tight tabular-nums md:text-3xl">
                  {os[year.labelKey]}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-5 md:w-2/3">
            <AspectRatio
              ratio={3 / 2}
              className="bg-surface relative rounded-2xl"
            >
              <Image
                src={placeholderImage(active.seed, "3x2")}
                alt={os[active.imageAltKey]}
                fill
                sizes={IMAGE_SIZES}
                className="object-cover"
              />
            </AspectRatio>
            <Typography
              variant="h3"
              className="text-2xl font-medium tracking-tighter md:text-3xl"
            >
              {os[active.headingKey]}
            </Typography>
            <Typography variant="body" className="text-muted">
              {os[active.bodyKey]}
            </Typography>
          </div>
        </div>
      </div>
    </section>
  );
}
