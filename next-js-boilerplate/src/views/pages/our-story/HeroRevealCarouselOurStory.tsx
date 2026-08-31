"use client";

import { useState } from "react";
import Image from "next/image";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { IconButton } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { cn } from "@/lib/cn";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithOurStoryMessages } from "@/types/pages/our-story/OurStoryMessages-types";

interface Chapter {
  id: string;
  headingKey: string;
  bodyKey: string;
  imageAltKey: string;
  dotAriaKey: string;
  seed: string;
}

const CHAPTERS: Chapter[] = [
  {
    id: "question",
    headingKey: "ourStory3Chapter1Heading",
    bodyKey: "ourStory3Chapter1Body",
    imageAltKey: "ourStory3Chapter1ImageAlt",
    dotAriaKey: "ourStory3Chapter1DotAria",
    seed: "our-story-3-question",
  },
  {
    id: "build",
    headingKey: "ourStory3Chapter2Heading",
    bodyKey: "ourStory3Chapter2Body",
    imageAltKey: "ourStory3Chapter2ImageAlt",
    dotAriaKey: "ourStory3Chapter2DotAria",
    seed: "our-story-3-build",
  },
  {
    id: "notice",
    headingKey: "ourStory3Chapter3Heading",
    bodyKey: "ourStory3Chapter3Body",
    imageAltKey: "ourStory3Chapter3ImageAlt",
    dotAriaKey: "ourStory3Chapter3DotAria",
    seed: "our-story-3-notice",
  },
  {
    id: "begin",
    headingKey: "ourStory3Chapter4Heading",
    bodyKey: "ourStory3Chapter4Body",
    imageAltKey: "ourStory3Chapter4ImageAlt",
    dotAriaKey: "ourStory3Chapter4DotAria",
    seed: "our-story-3-begin",
  },
];

export function HeroRevealCarouselOurStory() {
  const t = useMessages("pages") as unknown as PagesWithOurStoryMessages;
  const os = t.ourStory;
  const [activeIndex, setActiveIndex] = useState(0);
  const active = CHAPTERS[activeIndex];

  const goTo = (index: number) => {
    setActiveIndex((index + CHAPTERS.length) % CHAPTERS.length);
  };

  return (
    <section className="relative w-full overflow-hidden py-24 lg:py-32">
      <Image
        src={placeholderImage(active.seed, "16x9")}
        alt={os[active.imageAltKey]}
        fill
        sizes="100vw"
        className="object-cover"
        priority
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10"
      />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-8 px-6 text-center lg:px-8">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/30 px-3 py-1 text-xs font-medium tracking-widest text-white uppercase">
          {os.ourStory3Eyebrow}
        </span>

        <div className="bg-bg/95 border-border flex w-full max-w-xl flex-col gap-5 rounded-3xl border p-6 text-left shadow-xl backdrop-blur-sm sm:p-8">
          <span className="text-muted font-mono text-xs tabular-nums">
            {String(activeIndex + 1).padStart(2, "0")} /{" "}
            {String(CHAPTERS.length).padStart(2, "0")}
          </span>
          <Typography
            variant="h3"
            className="text-2xl font-medium tracking-tighter md:text-3xl"
          >
            {os[active.headingKey]}
          </Typography>
          <Typography variant="body" className="text-muted">
            {os[active.bodyKey]}
          </Typography>

          <div className="flex items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-1.5">
              {CHAPTERS.map((chapter, index) => (
                <button
                  key={chapter.id}
                  type="button"
                  aria-label={os[chapter.dotAriaKey]}
                  aria-current={index === activeIndex}
                  onClick={() => goTo(index)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    index === activeIndex
                      ? "bg-brand w-6"
                      : "bg-muted/40 hover:bg-muted/60 w-1.5",
                  )}
                />
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <IconButton
                icon={<IconChevronLeft size={16} />}
                label={os.ourStory3PrevAria}
                variant="outline"
                size="icon-sm"
                onClick={() => goTo(activeIndex - 1)}
              />
              <IconButton
                icon={<IconChevronRight size={16} />}
                label={os.ourStory3NextAria}
                variant="outline"
                size="icon-sm"
                onClick={() => goTo(activeIndex + 1)}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
