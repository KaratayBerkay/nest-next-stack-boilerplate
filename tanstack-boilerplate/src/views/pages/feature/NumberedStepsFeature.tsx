"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const STEPS = [
  { titleKey: "feature99Step1Title", bodyKey: "feature99Step1Body" },
  { titleKey: "feature99Step2Title", bodyKey: "feature99Step2Body" },
  { titleKey: "feature99Step3Title", bodyKey: "feature99Step3Body" },
] as const;

export function NumberedStepsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center gap-2.5">
            <span
              className="bg-success size-2.5 shrink-0 rounded-full"
              aria-hidden="true"
            />
            <span className="text-muted text-sm">{f.feature99StatusLabel}</span>
          </div>
          <h2 className="text-fg mt-4 text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature99Heading}
          </h2>
        </div>
        <div className="flex flex-col gap-8">
          {STEPS.map((step, index) => (
            <div
              key={step.titleKey}
              className="border-border flex flex-col gap-3 border-l pl-6"
            >
              <span className="text-muted text-sm font-medium">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-fg text-lg font-semibold">
                  {f[step.titleKey]}
                </h3>
                <p className="text-muted leading-relaxed">{f[step.bodyKey]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
