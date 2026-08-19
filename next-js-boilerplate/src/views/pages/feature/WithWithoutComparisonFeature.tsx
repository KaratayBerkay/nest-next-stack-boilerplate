"use client";

import { IconCheck, IconX } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const WITH_KEYS = [
  "feature180With1",
  "feature180With2",
  "feature180With3",
  "feature180With4",
] as const;

const WITHOUT_KEYS = [
  "feature180Without1",
  "feature180Without2",
  "feature180Without3",
  "feature180Without4",
] as const;

export function WithWithoutComparisonFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature180Heading}
          </h2>
          <p className="text-muted">{f.feature180Intro}</p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="border-border bg-surface rounded-xl border p-8">
            <div className="flex items-center gap-3">
              <span className="bg-success/10 text-success flex size-8 shrink-0 items-center justify-center rounded-full">
                <IconCheck size={18} aria-hidden="true" />
              </span>
              <h3 className="text-fg text-lg font-semibold">
                {f.feature180WithHeading}
              </h3>
            </div>
            <ul className="mt-6 flex flex-col gap-3.5">
              {WITH_KEYS.map((key) => (
                <li key={key} className="flex items-start gap-3">
                  <IconCheck
                    size={18}
                    className="text-success mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-muted text-sm leading-relaxed">
                    {f[key]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-border bg-surface rounded-xl border p-8">
            <div className="flex items-center gap-3">
              <span className="border-border bg-bg text-muted flex size-8 shrink-0 items-center justify-center rounded-full border">
                <IconX size={18} aria-hidden="true" />
              </span>
              <h3 className="text-fg text-lg font-semibold">
                {f.feature180WithoutHeading}
              </h3>
            </div>
            <ul className="mt-6 flex flex-col gap-3.5">
              {WITHOUT_KEYS.map((key) => (
                <li key={key} className="flex items-start gap-3">
                  <IconX
                    size={18}
                    className="text-muted mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-muted text-sm leading-relaxed">
                    {f[key]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
