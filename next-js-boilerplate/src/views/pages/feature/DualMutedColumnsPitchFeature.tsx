"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

export function DualMutedColumnsPitchFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
        <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
          {f.feature111Heading}
        </h2>
      </div>
      <div className="mx-auto mt-12 grid max-w-5xl gap-6 px-6 sm:grid-cols-2 lg:px-8">
        <div className="bg-surface flex flex-col gap-3 rounded-xl p-8">
          <h3 className="text-fg text-lg font-semibold">
            {f.feature111Column1Title}
          </h3>
          <p className="text-muted text-sm leading-relaxed">
            {f.feature111Column1Body}
          </p>
        </div>
        <div className="bg-surface flex flex-col gap-3 rounded-xl p-8">
          <h3 className="text-fg text-lg font-semibold">
            {f.feature111Column2Title}
          </h3>
          <p className="text-muted text-sm leading-relaxed">
            {f.feature111Column2Body}
          </p>
        </div>
      </div>
    </section>
  );
}
