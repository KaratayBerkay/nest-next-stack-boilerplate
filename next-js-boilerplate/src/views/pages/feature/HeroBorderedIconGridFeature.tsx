"use client";

import {
  IconBolt,
  IconChartBar,
  IconCloud,
  IconLock,
  IconUsers,
  IconWand,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

interface GridItem {
  id: string;
  icon: Icon;
  labelKey: string;
}

const ITEMS: GridItem[] = [
  { id: "fast", icon: IconBolt, labelKey: "feature85Item1" },
  { id: "insights", icon: IconChartBar, labelKey: "feature85Item2" },
  { id: "cloud", icon: IconCloud, labelKey: "feature85Item3" },
  { id: "secure", icon: IconLock, labelKey: "feature85Item4" },
  { id: "team", icon: IconUsers, labelKey: "feature85Item5" },
  { id: "automate", icon: IconWand, labelKey: "feature85Item6" },
];

export function HeroBorderedIconGridFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 text-center lg:px-8">
        <h2 className="text-fg text-4xl font-semibold tracking-tight lg:text-5xl">
          {f.feature85Heading}
        </h2>
        <p className="text-muted mx-auto mt-4 max-w-xl">{f.feature85Intro}</p>
      </div>
      <div className="border-border mx-auto mt-14 grid max-w-5xl grid-cols-2 border-t border-l sm:grid-cols-3">
        {ITEMS.map((item) => (
          <div
            key={item.id}
            className="border-border flex flex-col items-center gap-2.5 border-r border-b px-4 py-8 text-center"
          >
            <span className="bg-brand/10 text-brand flex size-10 shrink-0 items-center justify-center rounded-full">
              <item.icon size={18} aria-hidden="true" />
            </span>
            <span className="text-fg text-sm font-medium">
              {f[item.labelKey]}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
