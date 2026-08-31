"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { IconButton } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/initials";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithTestimonialMessages } from "@/types/pages/testimonial/TestimonialMessages-types";

const ROTATION_INTERVAL_MS = 5000 as const;

interface CarouselSlide {
  id: string;
  nameKey: string;
  roleKey: string;
  quoteKey: string;
}

const SLIDES: CarouselSlide[] = [
  { id: "slide-1", nameKey: "testimonial3Slide1Name", roleKey: "testimonial3Slide1Role", quoteKey: "testimonial3Slide1Quote" },
  { id: "slide-2", nameKey: "testimonial3Slide2Name", roleKey: "testimonial3Slide2Role", quoteKey: "testimonial3Slide2Quote" },
  { id: "slide-3", nameKey: "testimonial3Slide3Name", roleKey: "testimonial3Slide3Role", quoteKey: "testimonial3Slide3Quote" },
  { id: "slide-4", nameKey: "testimonial3Slide4Name", roleKey: "testimonial3Slide4Role", quoteKey: "testimonial3Slide4Quote" },
  { id: "slide-5", nameKey: "testimonial3Slide5Name", roleKey: "testimonial3Slide5Role", quoteKey: "testimonial3Slide5Quote" },
];

function goToSlide(setIndex: Dispatch<SetStateAction<number>>, index: number) {
  setIndex(index);
}

export function RotatingQuoteCarouselTestimonial() {
  const t = useMessages("pages") as unknown as PagesWithTestimonialMessages;
  const tm = t.testimonial;
  const [index, setIndex] = useState(0);
  const [pausedByUser, setPausedByUser] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const paused = pausedByUser || reducedMotion;

  useEffect(() => {
    if (paused) return;
    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, ROTATION_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [paused]);

  const active = SLIDES[index];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {tm.testimonial3Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {tm.testimonial3Heading}
          </h2>
          <p className="text-muted leading-relaxed">{tm.testimonial3Intro}</p>
        </div>

        <div className="border-border bg-surface relative mt-10 rounded-2xl border p-8 lg:p-12">
          <div key={active.id} className="animate-fade-in-up flex flex-col items-center gap-6 text-center">
            <p className="text-fg max-w-xl text-xl leading-relaxed font-medium lg:text-2xl">
              {tm[active.quoteKey]}
            </p>
            <div className="flex items-center gap-3">
              <Avatar fallback={initials(tm[active.nameKey])} size="md" variant="brand" />
              <div className="text-left">
                <p className="text-fg text-sm font-semibold">{tm[active.nameKey]}</p>
                <p className="text-muted text-xs">{tm[active.roleKey]}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4">
          <ul className="flex gap-2" aria-label={tm.testimonial3Heading}>
            {SLIDES.map((slide, slideIndex) => (
              <li key={slide.id}>
                <button
                  type="button"
                  aria-label={tm.testimonial3GoToAriaTemplate.replace(
                    "{name}",
                    tm[slide.nameKey],
                  )}
                  aria-current={slideIndex === index ? "true" : undefined}
                  onClick={() => goToSlide(setIndex, slideIndex)}
                  className={cn(
                    "size-2 rounded-full transition-colors",
                    slideIndex === index ? "bg-brand" : "bg-border hover:bg-muted",
                  )}
                />
              </li>
            ))}
          </ul>
          {!reducedMotion && (
            <IconButton
              icon={
                pausedByUser ? (
                  <IconPlayerPlay size={14} aria-hidden="true" />
                ) : (
                  <IconPlayerPause size={14} aria-hidden="true" />
                )
              }
              label={
                pausedByUser ? tm.testimonial3PlayAria : tm.testimonial3PauseAria
              }
              variant="ghost"
              size="icon-sm"
              onClick={() => setPausedByUser((current) => !current)}
            />
          )}
        </div>
      </div>
    </section>
  );
}
