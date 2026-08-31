"use client";

import { Badge } from "@/components/ui/Badge";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const MARQUEE_CSS = `
@keyframes dual-marquee-forward {
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
}
@keyframes dual-marquee-reverse {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
.animate-dual-marquee-forward { animation: dual-marquee-forward 26s linear infinite; }
.animate-dual-marquee-reverse { animation: dual-marquee-reverse 26s linear infinite; }
@media (prefers-reduced-motion: reduce) {
  .animate-dual-marquee-forward, .animate-dual-marquee-reverse { animation: none; }
}
`;

const ROW_1_KEYS = [
  "feature154Badge1",
  "feature154Badge2",
  "feature154Badge3",
  "feature154Badge4",
  "feature154Badge5",
] as const;

const ROW_2_KEYS = [
  "feature154Badge6",
  "feature154Badge7",
  "feature154Badge8",
  "feature154Badge9",
  "feature154Badge10",
] as const;

export function DualMarqueeBadgeRowsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature154Heading}
          </h2>
          <p className="text-muted mx-auto max-w-xl">{f.feature154Intro}</p>
        </div>
        <style>{MARQUEE_CSS}</style>
        <div className="mt-12 flex flex-col gap-4">
          <div className="relative overflow-hidden">
            <div className="animate-dual-marquee-forward flex w-max items-center gap-3">
              {[...ROW_1_KEYS, ...ROW_1_KEYS].map((key, index) => (
                <Badge key={`${key}-${index}`}>{f[key]}</Badge>
              ))}
            </div>
          </div>
          <div className="relative overflow-hidden">
            <div className="animate-dual-marquee-reverse flex w-max items-center gap-3">
              {[...ROW_2_KEYS, ...ROW_2_KEYS].map((key, index) => (
                <Badge key={`${key}-${index}`}>{f[key]}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
