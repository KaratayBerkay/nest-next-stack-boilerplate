"use client";

import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

export function HeadlineOutlineBtnFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <span className="border-border text-fg inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-widest uppercase">
            {f.feature55Eyebrow}
          </span>
          <h2 className="text-fg text-4xl font-semibold tracking-tight lg:text-5xl">
            {f.feature55Heading}
          </h2>
          <p className="text-muted leading-relaxed">{f.feature55Intro}</p>
          <Button variant="outline">{f.feature55ButtonLabel}</Button>
        </div>
      </div>
    </section>
  );
}
