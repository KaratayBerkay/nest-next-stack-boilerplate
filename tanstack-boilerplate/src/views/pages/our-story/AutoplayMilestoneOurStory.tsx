"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { IconButton } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/cn";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithOurStoryMessages } from "@/types/pages/our-story/OurStoryMessages-types";

interface Milestone {
  id: string;
  yearKey: string;
  headingKey: string;
  bodyKey: string;
  imageAltKey: string;
  dotAriaKey: string;
  seed: string;
}

const MILESTONES: Milestone[] = [
  {
    id: "spark",
    yearKey: "ourStory2Milestone1Year",
    headingKey: "ourStory2Milestone1Heading",
    bodyKey: "ourStory2Milestone1Body",
    imageAltKey: "ourStory2Milestone1ImageAlt",
    dotAriaKey: "ourStory2Milestone1DotAria",
    seed: "our-story-2-spark",
  },
  {
    id: "customer",
    yearKey: "ourStory2Milestone2Year",
    headingKey: "ourStory2Milestone2Heading",
    bodyKey: "ourStory2Milestone2Body",
    imageAltKey: "ourStory2Milestone2ImageAlt",
    dotAriaKey: "ourStory2Milestone2DotAria",
    seed: "our-story-2-customer",
  },
  {
    id: "team",
    yearKey: "ourStory2Milestone3Year",
    headingKey: "ourStory2Milestone3Heading",
    bodyKey: "ourStory2Milestone3Body",
    imageAltKey: "ourStory2Milestone3ImageAlt",
    dotAriaKey: "ourStory2Milestone3DotAria",
    seed: "our-story-2-team",
  },
  {
    id: "scale",
    yearKey: "ourStory2Milestone4Year",
    headingKey: "ourStory2Milestone4Heading",
    bodyKey: "ourStory2Milestone4Body",
    imageAltKey: "ourStory2Milestone4ImageAlt",
    dotAriaKey: "ourStory2Milestone4DotAria",
    seed: "our-story-2-scale",
  },
  {
    id: "today",
    yearKey: "ourStory2Milestone5Year",
    headingKey: "ourStory2Milestone5Heading",
    bodyKey: "ourStory2Milestone5Body",
    imageAltKey: "ourStory2Milestone5ImageAlt",
    dotAriaKey: "ourStory2Milestone5DotAria",
    seed: "our-story-2-today",
  },
];

const SEGMENT_MS = 4500;
const TICK_MS = 100;
const IMAGE_SIZES = "(max-width: 768px) 100vw, 40vw";

export function AutoplayMilestoneOurStory() {
  const t = useMessages("pages") as unknown as PagesWithOurStoryMessages;
  const os = t.ourStory;
  const reducedMotion = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const auto = !paused && !reducedMotion;

  // `elapsed` is a monotonic tick counter; the active segment and its fill
  // percentage are derived from it during render instead of tracked as
  // separate state, so there is nothing to reset or resync by hand.
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => {
      setElapsed((prev) => prev + TICK_MS);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [auto]);

  const totalMs = SEGMENT_MS * MILESTONES.length;
  const cycleElapsed = elapsed % totalMs;
  const activeIndex = Math.floor(cycleElapsed / SEGMENT_MS);
  const segmentProgress = ((cycleElapsed % SEGMENT_MS) / SEGMENT_MS) * 100;
  const active = MILESTONES[activeIndex];

  return (
    <section className="w-full py-16 lg:py-24">
      <div
        className="mx-auto flex max-w-5xl flex-col gap-8 px-4 lg:px-8"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {os.ourStory2Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {os.ourStory2Intro}
          </Typography>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex flex-1 gap-1.5">
            {MILESTONES.map((milestone, index) => {
              const fill =
                index < activeIndex
                  ? 100
                  : index === activeIndex
                    ? segmentProgress
                    : 0;
              return (
                <button
                  key={milestone.id}
                  type="button"
                  aria-label={os[milestone.dotAriaKey]}
                  onClick={() => setElapsed(index * SEGMENT_MS)}
                  className="bg-muted/25 h-1.5 flex-1 overflow-hidden rounded-full"
                >
                  <span
                    className={cn(
                      "bg-brand block h-full rounded-full",
                      index === activeIndex &&
                        auto &&
                        "transition-[width] duration-100 ease-linear",
                    )}
                    style={{ width: `${fill}%` }}
                  />
                </button>
              );
            })}
          </div>
          <IconButton
            icon={
              paused ? (
                <IconPlayerPlay size={16} />
              ) : (
                <IconPlayerPause size={16} />
              )
            }
            label={paused ? os.ourStory2PlayAria : os.ourStory2PauseAria}
            variant="ghost"
            size="icon-sm"
            onClick={() => setPaused((p) => !p)}
          />
        </div>

        <div className="flex flex-col items-center gap-8 md:flex-row md:gap-12">
          <div className="w-full md:w-2/5">
            <AspectRatio
              ratio={4 / 3}
              className="bg-surface relative rounded-2xl"
            >
              <Image
                src={placeholderImage(active.seed, "4x3")}
                alt={os[active.imageAltKey]}
                fill
                sizes={IMAGE_SIZES}
                className="object-cover"
              />
            </AspectRatio>
          </div>
          <div className="flex w-full flex-col gap-3 md:w-3/5">
            <span className="text-brand font-mono text-sm font-medium tabular-nums">
              {os[active.yearKey]}
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
          </div>
        </div>
      </div>
    </section>
  );
}
