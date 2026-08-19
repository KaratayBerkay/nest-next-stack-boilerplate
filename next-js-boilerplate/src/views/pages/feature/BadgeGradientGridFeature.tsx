"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const ITEMS = [
  {
    badgeKey: "feature221Item1Badge",
    titleKey: "feature221Item1Title",
    bodyKey: "feature221Item1Body",
    badgeClass: "bg-brand/10 text-brand-fg",
  },
  {
    badgeKey: "feature221Item2Badge",
    titleKey: "feature221Item2Title",
    bodyKey: "feature221Item2Body",
    badgeClass: "bg-success/10 text-success",
  },
  {
    badgeKey: "feature221Item3Badge",
    titleKey: "feature221Item3Title",
    bodyKey: "feature221Item3Body",
    badgeClass: "bg-brand/10 text-brand-fg",
  },
  {
    badgeKey: "feature221Item4Badge",
    titleKey: "feature221Item4Title",
    bodyKey: "feature221Item4Body",
    badgeClass: "bg-success/10 text-success",
  },
  {
    badgeKey: "feature221Item5Badge",
    titleKey: "feature221Item5Title",
    bodyKey: "feature221Item5Body",
    badgeClass: "bg-brand/10 text-brand-fg",
  },
  {
    badgeKey: "feature221Item6Badge",
    titleKey: "feature221Item6Title",
    bodyKey: "feature221Item6Body",
    badgeClass: "bg-success/10 text-success",
  },
] as const;

export function BadgeGradientGridFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature221Heading}
          </h2>
          <p className="text-muted leading-relaxed">{f.feature221Intro}</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item) => (
            <article
              key={item.titleKey}
              className="border-border bg-surface flex flex-col gap-3 rounded-lg border p-6"
            >
              <span
                className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${item.badgeClass}`}
              >
                {f[item.badgeKey]}
              </span>
              <h3 className="text-fg text-lg font-semibold">
                {f[item.titleKey]}
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {f[item.bodyKey]}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
