"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const STEPS = [
  {
    number: 1,
    titleKey: "feature187Step1Title",
    bodyKey: "feature187Step1Body",
  },
  {
    number: 2,
    titleKey: "feature187Step2Title",
    bodyKey: "feature187Step2Body",
  },
  {
    number: 3,
    titleKey: "feature187Step3Title",
    bodyKey: "feature187Step3Body",
  },
] as const;

export function ThreeStepConnectorFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature187Heading}
          </h2>
          <p className="text-muted">{f.feature187Intro}</p>
        </div>
        <div className="relative mt-14 grid gap-10 lg:grid-cols-3 lg:gap-8">
          <div
            aria-hidden="true"
            className="border-border absolute inset-x-0 top-7 hidden border-t border-dashed lg:block"
          />
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="relative flex flex-col items-center gap-4 text-center"
            >
              <span className="border-border bg-surface text-fg relative z-10 flex size-14 items-center justify-center rounded-full border text-lg font-semibold">
                {step.number}
              </span>
              <div className="flex flex-col gap-2">
                <h3 className="text-fg text-lg font-semibold">
                  {f[step.titleKey]}
                </h3>
                <p className="text-muted text-sm">{f[step.bodyKey]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
