"use client";

import { Badge } from "@/components/ui/Badge";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const LINK_URL = "#" as const;

const CARDS = [
  {
    captionKey: "feature8Card1Caption",
    titleKey: "feature8Card1Title",
    bodyKey: "feature8Card1Body",
  },
  {
    captionKey: "feature8Card2Caption",
    titleKey: "feature8Card2Title",
    bodyKey: "feature8Card2Body",
  },
] as const;

export function FrameworkCardsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Badge>{f.feature8Badge}</Badge>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature8Heading}
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {CARDS.map((card) => (
            <div
              key={card.titleKey}
              className="border-border bg-surface group hover:bg-surface-hover flex flex-col gap-3 rounded-lg border p-8 transition-colors"
            >
              <span className="text-muted text-xs font-medium tracking-widest uppercase">
                {f[card.captionKey]}
              </span>
              <h3 className="text-fg text-xl font-semibold tracking-tight">
                {f[card.titleKey]}
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {f[card.bodyKey]}
              </p>
              <a
                href={LINK_URL}
                className="text-fg mt-auto inline-flex items-center gap-1.5 text-sm font-medium opacity-0 transition-opacity group-hover:opacity-100"
              >
                {f.feature8LearnMore}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
