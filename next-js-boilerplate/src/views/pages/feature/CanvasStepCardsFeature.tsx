"use client";

import {
  IconCode,
  IconPalette,
  IconRocket,
  IconTarget,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const STEPS = [
  {
    numKey: "feature275Step1Num",
    titleKey: "feature275Step1Title",
    bodyKey: "feature275Step1Body",
    Icon: IconTarget,
  },
  {
    numKey: "feature275Step2Num",
    titleKey: "feature275Step2Title",
    bodyKey: "feature275Step2Body",
    Icon: IconPalette,
  },
  {
    numKey: "feature275Step3Num",
    titleKey: "feature275Step3Title",
    bodyKey: "feature275Step3Body",
    Icon: IconCode,
  },
  {
    numKey: "feature275Step4Num",
    titleKey: "feature275Step4Title",
    bodyKey: "feature275Step4Body",
    Icon: IconRocket,
  },
] as const;

export function CanvasStepCardsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature275Heading}
          </h2>
          <p className="text-muted">{f.feature275Intro}</p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <div
              key={step.numKey}
              className="border-border bg-surface flex flex-col gap-5 rounded-lg border p-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-fg text-4xl font-semibold tracking-tight">
                  {f[step.numKey]}
                </span>
                <span className="bg-brand/10 text-brand flex size-10 items-center justify-center rounded-md">
                  <step.Icon size={20} aria-hidden="true" />
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-fg text-lg font-semibold">
                  {f[step.titleKey]}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {f[step.bodyKey]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
