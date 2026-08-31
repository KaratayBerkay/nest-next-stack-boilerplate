"use client";

import { useState } from "react";
import Image from "next/image";
import {
  IconCheck,
  IconCode,
  IconPalette,
  IconRocket,
  IconSearch,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithProcessMessages } from "@/types/pages/process/ProcessMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const STEPS = [
  {
    id: "discover",
    icon: IconSearch,
    labelKey: "process1Step1Label",
    titleKey: "process1Step1Title",
    bodyKey: "process1Step1Body",
    point1Key: "process1Step1Point1",
    point2Key: "process1Step1Point2",
    imageAltKey: "process1Step1ImageAlt",
    seed: "process1-discover",
  },
  {
    id: "design",
    icon: IconPalette,
    labelKey: "process1Step2Label",
    titleKey: "process1Step2Title",
    bodyKey: "process1Step2Body",
    point1Key: "process1Step2Point1",
    point2Key: "process1Step2Point2",
    imageAltKey: "process1Step2ImageAlt",
    seed: "process1-design",
  },
  {
    id: "build",
    icon: IconCode,
    labelKey: "process1Step3Label",
    titleKey: "process1Step3Title",
    bodyKey: "process1Step3Body",
    point1Key: "process1Step3Point1",
    point2Key: "process1Step3Point2",
    imageAltKey: "process1Step3ImageAlt",
    seed: "process1-build",
  },
  {
    id: "launch",
    icon: IconRocket,
    labelKey: "process1Step4Label",
    titleKey: "process1Step4Title",
    bodyKey: "process1Step4Body",
    point1Key: "process1Step4Point1",
    point2Key: "process1Step4Point2",
    imageAltKey: "process1Step4ImageAlt",
    seed: "process1-launch",
  },
] as const;

export function StickyStepNavProcess() {
  const t = useMessages("pages") as unknown as PagesWithProcessMessages;
  const p = t.process;
  const [activeId, setActiveId] = useState<(typeof STEPS)[number]["id"]>(
    STEPS[0].id,
  );

  const activeIndex = STEPS.findIndex((step) => step.id === activeId);
  const active = STEPS[activeIndex] ?? STEPS[0];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-wide uppercase">
            {p.process1Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {p.process1Heading}
          </h2>
          <p className="text-muted">{p.process1Intro}</p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[280px_1fr] lg:gap-12">
          <nav
            aria-label={p.process1NavAria}
            className="flex flex-row gap-2 lg:sticky lg:top-24 lg:h-fit lg:flex-col lg:gap-1.5"
          >
            {STEPS.map((step, index) => {
              const isActive = step.id === activeId;
              return (
                <button
                  key={step.id}
                  type="button"
                  aria-current={isActive ? "step" : undefined}
                  aria-label={`${p.process1StepAriaPrefix} ${p[step.labelKey]}`}
                  onClick={() => setActiveId(step.id)}
                  className={cn(
                    "flex flex-1 items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors lg:flex-none",
                    isActive
                      ? "border-brand bg-brand/5"
                      : "border-border hover:bg-surface-hover",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                      isActive
                        ? "bg-brand text-brand-fg"
                        : "bg-surface text-muted",
                    )}
                  >
                    {index + 1}
                  </span>
                  <span
                    className={cn(
                      "hidden text-sm font-medium sm:inline",
                      isActive ? "text-fg" : "text-muted",
                    )}
                  >
                    {p[step.labelKey]}
                  </span>
                </button>
              );
            })}
          </nav>

          <div
            key={active.id}
            className="animate-fade-in-up border-border bg-surface flex flex-col gap-6 rounded-2xl border p-6 lg:p-8"
          >
            <div className="flex items-center justify-between gap-3">
              <Badge variant="soft">
                {p.process1ProgressLabel
                  .replace("{current}", String(activeIndex + 1))
                  .replace("{total}", String(STEPS.length))}
              </Badge>
              <span className="bg-brand/10 text-brand flex size-10 items-center justify-center rounded-full">
                <active.icon size={20} aria-hidden="true" />
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-fg text-xl font-semibold">
                {p[active.titleKey]}
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {p[active.bodyKey]}
              </p>
            </div>

            <ul className="flex flex-col gap-2 text-sm">
              <li className="flex items-center gap-2">
                <IconCheck
                  size={16}
                  className="text-success shrink-0"
                  aria-hidden="true"
                />
                <span className="text-fg">{p[active.point1Key]}</span>
              </li>
              <li className="flex items-center gap-2">
                <IconCheck
                  size={16}
                  className="text-success shrink-0"
                  aria-hidden="true"
                />
                <span className="text-fg">{p[active.point2Key]}</span>
              </li>
            </ul>

            <div className="border-border bg-muted/40 relative aspect-[3/2] overflow-hidden rounded-lg border">
              <Image
                src={placeholderImage(active.seed, "3x2")}
                alt={p[active.imageAltKey]}
                fill
                sizes="(min-width: 1024px) 480px, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
