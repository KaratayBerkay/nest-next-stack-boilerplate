"use client";

import { IconCheck } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const CHECK_KEYS = [
  "feature143Check1",
  "feature143Check2",
  "feature143Check3",
  "feature143Check4",
] as const;

const STATS = [
  { valueKey: "feature143StatValue1", labelKey: "feature143StatLabel1" },
  { valueKey: "feature143StatValue2", labelKey: "feature143StatLabel2" },
  { valueKey: "feature143StatValue3", labelKey: "feature143StatLabel3" },
] as const;

export function ChecklistFramedSpotlightFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="border-border bg-surface rounded-2xl border p-8 shadow-lg lg:p-14">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
            <Badge pill>{f.feature143Pill}</Badge>
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature143Heading}
            </h2>
            <p className="text-muted">{f.feature143Paragraph}</p>
          </div>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {CHECK_KEYS.map((checkKey) => (
              <li key={checkKey} className="flex items-start gap-3">
                <span className="bg-success/10 text-success flex size-6 shrink-0 items-center justify-center rounded-full">
                  <IconCheck size={14} aria-hidden="true" />
                </span>
                <span className="text-fg text-sm leading-relaxed">
                  {f[checkKey]}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-border mt-10 grid grid-cols-3 gap-6 border-t-2 border-dashed pt-8">
            {STATS.map((stat) => (
              <div key={stat.valueKey} className="flex flex-col gap-1">
                <span className="text-fg text-2xl font-semibold tracking-tight lg:text-3xl">
                  {f[stat.valueKey]}
                </span>
                <span className="text-muted text-sm">{f[stat.labelKey]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
