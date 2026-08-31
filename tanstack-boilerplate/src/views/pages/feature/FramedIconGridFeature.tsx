"use client";

import { IconBolt, IconChartBar, IconCloud, IconLock, IconUsers, IconWand } from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

interface GridItem {
  id: string;
  icon: Icon;
  titleKey: string;
}

const ITEMS: GridItem[] = [
  { id: "fast", icon: IconBolt, titleKey: "feature68Item1" },
  { id: "insights", icon: IconChartBar, titleKey: "feature68Item2" },
  { id: "cloud", icon: IconCloud, titleKey: "feature68Item3" },
  { id: "secure", icon: IconLock, titleKey: "feature68Item4" },
  { id: "team", icon: IconUsers, titleKey: "feature68Item5" },
  { id: "automate", icon: IconWand, titleKey: "feature68Item6" },
];

export function FramedIconGridFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
        <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
          {f.feature68Heading}
        </h2>
        <p className="text-muted mx-auto mt-4 max-w-xl">{f.feature68Intro}</p>
      </div>
      <div className="border-border bg-surface mx-auto mt-10 max-w-4xl rounded-2xl border p-6 lg:p-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {ITEMS.map((item) => (
            <div key={item.id} className="flex flex-col items-center gap-2.5 text-center">
              <span className="bg-brand/10 text-brand flex size-10 shrink-0 items-center justify-center rounded-full">
                <item.icon size={18} aria-hidden="true" />
              </span>
              <span className="text-fg text-sm font-medium">{f[item.titleKey]}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
