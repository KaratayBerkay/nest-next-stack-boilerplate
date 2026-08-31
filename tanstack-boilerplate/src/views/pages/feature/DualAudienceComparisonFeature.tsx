"use client";

import { IconCheck } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const COLUMNS = [
  {
    id: "startups",
    titleKey: "feature91Column1Title",
    checkKeys: ["feature91Column1Check1", "feature91Column1Check2", "feature91Column1Check3"],
  },
  {
    id: "enterprise",
    titleKey: "feature91Column2Title",
    checkKeys: ["feature91Column2Check1", "feature91Column2Check2", "feature91Column2Check3"],
  },
] as const;

export function DualAudienceComparisonFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature91Heading}
          </h2>
          <p className="text-muted mx-auto max-w-xl">{f.feature91Intro}</p>
        </div>
        <div className="border-border mt-12 grid overflow-hidden rounded-2xl border sm:grid-cols-2 sm:divide-x">
          {COLUMNS.map((column) => (
            <div key={column.id} className="bg-surface flex flex-col gap-4 p-8">
              <h3 className="text-fg text-lg font-semibold">{f[column.titleKey]}</h3>
              <ul className="flex flex-col gap-2.5">
                {column.checkKeys.map((checkKey) => (
                  <li key={checkKey} className="flex items-center gap-2.5">
                    <IconCheck size={16} className="text-brand shrink-0" aria-hidden="true" />
                    <span className="text-muted text-sm">{f[checkKey]}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
