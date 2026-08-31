"use client";

import { IconChartBar, IconCloud, IconLock } from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

interface LinkedRow {
  id: string;
  icon: Icon;
  titleKey: string;
  bodyKey: string;
}

const ROWS: LinkedRow[] = [
  { id: "insights", icon: IconChartBar, titleKey: "feature123Row1Title", bodyKey: "feature123Row1Body" },
  { id: "storage", icon: IconCloud, titleKey: "feature123Row2Title", bodyKey: "feature123Row2Body" },
  { id: "protection", icon: IconLock, titleKey: "feature123Row3Title", bodyKey: "feature123Row3Body" },
];

export function GradientLinkedFeaturesFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
          <div className="flex flex-col gap-4">
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature123Heading}
            </h2>
            <p className="text-muted leading-relaxed">{f.feature123Intro}</p>
          </div>
          <div className="relative flex flex-col">
            <div
              aria-hidden="true"
              className="from-brand via-brand/30 absolute top-2 bottom-2 left-5 w-px bg-gradient-to-b to-transparent"
            />
            {ROWS.map((row) => (
              <div key={row.id} className="relative flex gap-5 pb-10 last:pb-0">
                <span className="border-brand/30 bg-bg text-brand relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2">
                  <row.icon size={18} aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1.5 pt-1.5">
                  <h3 className="text-fg text-base font-semibold">
                    {f[row.titleKey]}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed">
                    {f[row.bodyKey]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
