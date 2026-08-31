"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  IconChevronLeft,
  IconChevronRight,
  IconCoffee,
  IconDroplet,
  IconFlame,
  IconTruck,
} from "@tabler/icons-react";
import { IconButton } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { PagesWithProcessMessages } from "@/types/pages/process/ProcessMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const ROTATION_INTERVAL_MS = 4500 as const;

const STEPS = [
  {
    id: "source",
    icon: IconCoffee,
    titleKey: "process2Step1Title",
    bodyKey: "process2Step1Body",
    imageAltKey: "process2Step1ImageAlt",
    seed: "process2-source",
  },
  {
    id: "roast",
    icon: IconFlame,
    titleKey: "process2Step2Title",
    bodyKey: "process2Step2Body",
    imageAltKey: "process2Step2ImageAlt",
    seed: "process2-roast",
  },
  {
    id: "brew",
    icon: IconDroplet,
    titleKey: "process2Step3Title",
    bodyKey: "process2Step3Body",
    imageAltKey: "process2Step3ImageAlt",
    seed: "process2-brew",
  },
  {
    id: "deliver",
    icon: IconTruck,
    titleKey: "process2Step4Title",
    bodyKey: "process2Step4Body",
    imageAltKey: "process2Step4ImageAlt",
    seed: "process2-deliver",
  },
] as const;

export function StepImageRevealProcess() {
  const t = useMessages("pages") as unknown as PagesWithProcessMessages;
  const p = t.process;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  // Auto-advance pauses on hover/focus and stops entirely for reduced-motion
  // users; the step list and arrow buttons still switch manually.
  useEffect(() => {
    if (paused || reducedMotion) return;
    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % STEPS.length);
    }, ROTATION_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [paused, reducedMotion]);

  const active = STEPS[index];

  return (
    <section
      className="w-full py-16 lg:py-24"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-wide uppercase">
            {p.process2Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {p.process2Heading}
          </h2>
          <p className="text-muted">{p.process2Intro}</p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-12">
          <ol className="flex flex-col gap-1.5">
            {STEPS.map((step, i) => {
              const isActive = i === index;
              return (
                <li key={step.id}>
                  <button
                    type="button"
                    aria-current={isActive ? "step" : undefined}
                    onClick={() => setIndex(i)}
                    className={cn(
                      "flex w-full items-start gap-4 rounded-xl border px-4 py-3.5 text-left transition-colors",
                      isActive
                        ? "border-brand bg-brand/5"
                        : "hover:bg-surface-hover border-transparent",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
                        isActive
                          ? "border-brand bg-brand text-brand-fg"
                          : "border-border text-muted",
                      )}
                    >
                      {i + 1}
                    </span>
                    <span className="flex flex-col gap-0.5 pt-0.5">
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          isActive ? "text-fg" : "text-muted",
                        )}
                      >
                        {p[step.titleKey]}
                      </span>
                      {isActive && (
                        <span className="text-muted text-sm">
                          {p[step.bodyKey]}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="flex flex-col gap-4">
            <div className="border-border bg-surface relative aspect-[4/3] overflow-hidden rounded-2xl border">
              {STEPS.map((step, i) => (
                <Image
                  key={step.id}
                  src={placeholderImage(step.seed, "4x3")}
                  alt={p[step.imageAltKey]}
                  fill
                  aria-hidden={i !== index}
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className={cn(
                    "object-cover transition-opacity duration-500",
                    i === index ? "opacity-100" : "opacity-0",
                  )}
                />
              ))}
              <div className="absolute top-4 left-4">
                <span className="bg-bg/90 text-fg rounded-full px-3 py-1 text-xs font-medium shadow-xs backdrop-blur">
                  {p.process2CounterLabel
                    .replace("{current}", String(index + 1))
                    .replace("{total}", String(STEPS.length))}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <IconButton
                type="button"
                variant="outline"
                size="icon"
                label={p.process2PrevAria}
                icon={<IconChevronLeft size={18} aria-hidden="true" />}
                onClick={() =>
                  setIndex(
                    (current) => (current - 1 + STEPS.length) % STEPS.length,
                  )
                }
              />
              <active.icon
                size={20}
                className="text-brand"
                aria-hidden="true"
              />
              <IconButton
                type="button"
                variant="outline"
                size="icon"
                label={p.process2NextAria}
                icon={<IconChevronRight size={18} aria-hidden="true" />}
                onClick={() =>
                  setIndex((current) => (current + 1) % STEPS.length)
                }
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
