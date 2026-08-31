"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const STEPS = [
  {
    id: "request",
    numberKey: "feature207Step1Number",
    titleKey: "feature207Step1Title",
    bodyKey: "feature207Step1Body",
  },
  {
    id: "review",
    numberKey: "feature207Step2Number",
    titleKey: "feature207Step2Title",
    bodyKey: "feature207Step2Body",
  },
  {
    id: "approve",
    numberKey: "feature207Step3Number",
    titleKey: "feature207Step3Title",
    bodyKey: "feature207Step3Body",
  },
] as const;

export function NumberedWorkflowSeparatorsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature207Heading}
          </h2>
          <p className="text-muted mx-auto max-w-xl">{f.feature207Intro}</p>
        </div>
        <div className="border-border mt-12 grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className="border-border flex flex-col gap-2 px-6 py-6 first:pt-0 first:pl-0 last:pb-0 sm:py-0 sm:first:pl-0 sm:last:pr-0"
            >
              <span className="text-brand text-sm font-semibold tabular-nums">
                {f[step.numberKey]}
              </span>
              <h3 className="text-fg text-base font-semibold">
                {f[step.titleKey]}
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {f[step.bodyKey]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
