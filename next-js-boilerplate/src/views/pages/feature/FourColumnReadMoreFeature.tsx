"use client";

import { IconArrowRight } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const COLUMNS = [
  {
    titleKey: "feature277Column1Title",
    bodyKey: "feature277Column1Body",
    linkLabelKey: "feature277Column1LinkLabel",
  },
  {
    titleKey: "feature277Column2Title",
    bodyKey: "feature277Column2Body",
    linkLabelKey: "feature277Column2LinkLabel",
  },
  {
    titleKey: "feature277Column3Title",
    bodyKey: "feature277Column3Body",
    linkLabelKey: "feature277Column3LinkLabel",
  },
  {
    titleKey: "feature277Column4Title",
    bodyKey: "feature277Column4Body",
    linkLabelKey: "feature277Column4LinkLabel",
  },
] as const;

export function FourColumnReadMoreFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature277Heading}
          </h2>
          <p className="text-muted leading-relaxed">{f.feature277Intro}</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {COLUMNS.map((column) => (
            <article
              key={column.titleKey}
              className="border-border bg-surface flex flex-col gap-3 rounded-lg border p-6"
            >
              <h3 className="text-fg text-lg font-semibold">
                {f[column.titleKey]}
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {f[column.bodyKey]}
              </p>
              <span className="text-fg mt-auto inline-flex items-center gap-1.5 text-sm font-medium">
                {f[column.linkLabelKey]}
                <IconArrowRight size={14} aria-hidden="true" />
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
