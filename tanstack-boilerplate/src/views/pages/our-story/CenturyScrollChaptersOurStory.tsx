"use client";

import Image from "next/image";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useScrollFadeX } from "@/hooks/useScrollFadeX";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithOurStoryMessages } from "@/types/pages/our-story/OurStoryMessages-types";

interface Chapter {
  id: string;
  eraKey: string;
  headingKey: string;
  bodyKey: string;
  imageAltKey: string;
  seed: string;
}

const CHAPTERS: Chapter[] = [
  {
    id: "workshop",
    eraKey: "ourStory6Chapter1Era",
    headingKey: "ourStory6Chapter1Heading",
    bodyKey: "ourStory6Chapter1Body",
    imageAltKey: "ourStory6Chapter1ImageAlt",
    seed: "our-story-6-workshop",
  },
  {
    id: "storefront",
    eraKey: "ourStory6Chapter2Era",
    headingKey: "ourStory6Chapter2Heading",
    bodyKey: "ourStory6Chapter2Body",
    imageAltKey: "ourStory6Chapter2ImageAlt",
    seed: "our-story-6-storefront",
  },
  {
    id: "online",
    eraKey: "ourStory6Chapter3Era",
    headingKey: "ourStory6Chapter3Heading",
    bodyKey: "ourStory6Chapter3Body",
    imageAltKey: "ourStory6Chapter3ImageAlt",
    seed: "our-story-6-online",
  },
  {
    id: "team",
    eraKey: "ourStory6Chapter4Era",
    headingKey: "ourStory6Chapter4Heading",
    bodyKey: "ourStory6Chapter4Body",
    imageAltKey: "ourStory6Chapter4ImageAlt",
    seed: "our-story-6-team",
  },
  {
    id: "rebuild",
    eraKey: "ourStory6Chapter5Era",
    headingKey: "ourStory6Chapter5Heading",
    bodyKey: "ourStory6Chapter5Body",
    imageAltKey: "ourStory6Chapter5ImageAlt",
    seed: "our-story-6-rebuild",
  },
  {
    id: "today",
    eraKey: "ourStory6Chapter6Era",
    headingKey: "ourStory6Chapter6Heading",
    bodyKey: "ourStory6Chapter6Body",
    imageAltKey: "ourStory6Chapter6ImageAlt",
    seed: "our-story-6-today",
  },
];

const SCROLL_STEP_PX = 336;
const IMAGE_SIZES = "280px";

export function CenturyScrollChaptersOurStory() {
  const t = useMessages("pages") as unknown as PagesWithOurStoryMessages;
  const os = t.ourStory;
  const scrollFadeRef = useScrollFadeX<HTMLDivElement>();

  const scrollBy = (delta: number) => {
    scrollFadeRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex max-w-2xl flex-col gap-3">
            <Typography
              variant="h2"
              className="text-4xl font-medium tracking-tighter md:text-5xl"
            >
              {os.ourStory6Heading}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {os.ourStory6Intro}
            </Typography>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <IconButton
              icon={<IconArrowLeft size={16} />}
              label={os.ourStory6PrevAria}
              variant="outline"
              size="icon-sm"
              onClick={() => scrollBy(-SCROLL_STEP_PX)}
            />
            <IconButton
              icon={<IconArrowRight size={16} />}
              label={os.ourStory6NextAria}
              variant="outline"
              size="icon-sm"
              onClick={() => scrollBy(SCROLL_STEP_PX)}
            />
          </div>
        </div>

        <div
          ref={scrollFadeRef}
          className="snap-x snap-mandatory scroll-smooth overflow-x-auto"
        >
          <div className="flex gap-5 pb-2">
            {CHAPTERS.map((chapter) => (
              <Card
                key={chapter.id}
                className="w-[280px] shrink-0 snap-start overflow-hidden p-0 sm:w-[320px]"
              >
                <AspectRatio ratio={3 / 2} className="bg-surface relative">
                  <Image
                    src={placeholderImage(chapter.seed, "3x2")}
                    alt={os[chapter.imageAltKey]}
                    fill
                    sizes={IMAGE_SIZES}
                    className="object-cover"
                  />
                </AspectRatio>
                <div className="flex flex-col gap-2 p-5">
                  <span className="text-muted font-mono text-xs tracking-wide tabular-nums">
                    {os[chapter.eraKey]}
                  </span>
                  <Typography
                    variant="h3"
                    className="text-lg font-medium tracking-tight"
                  >
                    {os[chapter.headingKey]}
                  </Typography>
                  <Typography variant="bodySmall" className="text-muted">
                    {os[chapter.bodyKey]}
                  </Typography>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
