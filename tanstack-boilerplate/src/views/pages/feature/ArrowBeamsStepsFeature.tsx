"use client";

import { IconArrowRight, IconBolt } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const STEPS = [
  {
    numKey: "feature272Step1Num",
    titleKey: "feature272Step1Title",
    bodyKey: "feature272Step1Body",
  },
  {
    numKey: "feature272Step2Num",
    titleKey: "feature272Step2Title",
    bodyKey: "feature272Step2Body",
  },
  {
    numKey: "feature272Step3Num",
    titleKey: "feature272Step3Title",
    bodyKey: "feature272Step3Body",
  },
] as const;

export function ArrowBeamsStepsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="border-border bg-bg relative overflow-hidden rounded-xl border px-6 py-14 lg:px-14 lg:py-16">
          <div
            aria-hidden="true"
            className="border-border absolute -top-16 -right-16 h-56 w-56 rotate-45 border-t-2 border-dashed"
          />
          <div
            aria-hidden="true"
            className="border-border absolute -bottom-16 -left-16 h-56 w-56 -rotate-45 border-t-2 border-dashed"
          />
          <span
            aria-hidden="true"
            className="text-brand/40 absolute top-6 right-6"
          >
            <IconBolt size={24} />
          </span>
          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
            <span className="border-border text-fg inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-widest uppercase">
              {f.feature272Eyebrow}
            </span>
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature272Heading}
            </h2>
            <p className="text-muted leading-relaxed">{f.feature272Intro}</p>
          </div>
          <div className="relative mt-12 grid gap-10 md:grid-cols-3 md:gap-16">
            <div
              aria-hidden="true"
              className="border-border bg-bg text-fg absolute top-1/2 left-1/3 hidden -translate-x-1/2 -translate-y-1/2 md:flex md:size-9 md:items-center md:justify-center md:rounded-full md:border"
            >
              <IconArrowRight size={16} />
            </div>
            <div
              aria-hidden="true"
              className="border-border bg-bg text-fg absolute top-1/2 left-2/3 hidden -translate-x-1/2 -translate-y-1/2 md:flex md:size-9 md:items-center md:justify-center md:rounded-full md:border"
            >
              <IconArrowRight size={16} />
            </div>
            {STEPS.map((step) => (
              <div
                key={step.titleKey}
                className="flex flex-col items-center gap-3 text-center md:items-start md:text-left"
              >
                <span className="border-border text-fg flex size-11 items-center justify-center rounded-full border text-sm font-semibold">
                  {f[step.numKey]}
                </span>
                <h3 className="text-fg text-lg font-semibold">
                  {f[step.titleKey]}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {f[step.bodyKey]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
