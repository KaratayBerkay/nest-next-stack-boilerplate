"use client";

import { useState } from "react";
import Image from "next/image";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const STEPS = [
  { id: "step1", labelKey: "feature216Step1Label", src: "/img/placeholders/ph-16x9-0.webp", altKey: "feature216Step1ImageAlt" },
  { id: "step2", labelKey: "feature216Step2Label", src: "/img/placeholders/ph-16x9-2.webp", altKey: "feature216Step2ImageAlt" },
  { id: "step3", labelKey: "feature216Step3Label", src: "/img/placeholders/ph-16x9-4.webp", altKey: "feature216Step3ImageAlt" },
] as const;

export function RoundStepIconTabsFeature() {
  const [index, setIndex] = useState(0);
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;
  const active = STEPS[index];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature216Heading}
          </h2>
          <p className="text-muted max-w-xl">{f.feature216Intro}</p>
        </div>
        <div className="mt-10 flex justify-center gap-2">
          {STEPS.map((step, stepIndex) => (
            <button
              key={step.id}
              type="button"
              onClick={() => setIndex(stepIndex)}
              data-state={stepIndex === index ? "active" : "inactive"}
              className="data-[state=active]:bg-brand data-[state=active]:text-brand-fg data-[state=inactive]:bg-surface data-[state=inactive]:text-muted rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
            >
              {f[step.labelKey]}
            </button>
          ))}
        </div>
        <div className="border-border bg-surface relative mt-8 overflow-hidden rounded-xl border">
          <Image
            src={active.src}
            alt={f[active.altKey]}
            width={1200}
            height={675}
            className="aspect-video w-full object-cover"
          />
        </div>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setIndex((i) => (i === 0 ? STEPS.length - 1 : i - 1))}
            aria-label={f.feature216PrevAria}
            className="border-border bg-surface hover:bg-surface-hover flex size-10 items-center justify-center rounded-full border"
          >
            <IconChevronLeft size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => (i === STEPS.length - 1 ? 0 : i + 1))}
            aria-label={f.feature216NextAria}
            className="border-border bg-surface hover:bg-surface-hover flex size-10 items-center justify-center rounded-full border"
          >
            <IconChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
