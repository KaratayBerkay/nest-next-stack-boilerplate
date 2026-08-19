"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const MARQUEE_CSS = `
@keyframes brand-marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
}
.animate-brand-marquee {
  animation: brand-marquee 30s linear infinite;
}
`;

const BRAND_KEYS = [
  "feature285Brand1",
  "feature285Brand2",
  "feature285Brand3",
  "feature285Brand4",
  "feature285Brand5",
  "feature285Brand6",
  "feature285Brand7",
  "feature285Brand8",
  "feature285Brand9",
  "feature285Brand10",
] as const;

export function BrandMarqueeFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8">
          <h2 className="text-fg text-center text-lg font-medium">
            {f.feature285Heading}
          </h2>
          <div className="relative w-full overflow-hidden">
            <style>{MARQUEE_CSS}</style>
            <div className="animate-brand-marquee flex w-max items-center gap-14">
              {[...BRAND_KEYS, ...BRAND_KEYS].map((brandKey, index) => (
                <span
                  key={`${brandKey}-${index}`}
                  className="text-muted text-xl font-semibold tracking-tight whitespace-nowrap"
                >
                  {f[brandKey]}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
