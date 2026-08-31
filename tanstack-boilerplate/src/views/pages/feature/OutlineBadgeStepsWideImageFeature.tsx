"use client";

import Image from "next/image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const STEPS = [
  { id: "s1", numberKey: "feature119Step1Number", titleKey: "feature119Step1Title" },
  { id: "s2", numberKey: "feature119Step2Number", titleKey: "feature119Step2Title" },
  { id: "s3", numberKey: "feature119Step3Number", titleKey: "feature119Step3Title" },
] as const;

export function OutlineBadgeStepsWideImageFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature119Heading}
          </h2>
        </div>
        <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:justify-center sm:gap-12">
          {STEPS.map((step) => (
            <div key={step.id} className="flex items-center gap-3 sm:flex-col sm:text-center">
              <span className="border-brand text-brand flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold">
                {f[step.numberKey]}
              </span>
              <span className="text-fg text-sm font-medium">{f[step.titleKey]}</span>
            </div>
          ))}
        </div>
        <div className="border-border bg-surface mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl border">
          <Image
            src="/img/placeholders/ph-2x1-3.webp"
            alt={f.feature119ImageAlt}
            width={1200}
            height={600}
            className="aspect-[2/1] w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
