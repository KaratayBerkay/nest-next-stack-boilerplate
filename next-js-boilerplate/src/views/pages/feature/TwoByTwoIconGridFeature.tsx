"use client";

import {
  IconBolt,
  IconChartBar,
  IconLock,
  IconUsers,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const ITEMS: { id: string; icon: Icon; titleKey: string; bodyKey: string }[] = [
  {
    id: "fast",
    icon: IconBolt,
    titleKey: "feature97Item1Title",
    bodyKey: "feature97Item1Body",
  },
  {
    id: "insights",
    icon: IconChartBar,
    titleKey: "feature97Item2Title",
    bodyKey: "feature97Item2Body",
  },
  {
    id: "secure",
    icon: IconLock,
    titleKey: "feature97Item3Title",
    bodyKey: "feature97Item3Body",
  },
  {
    id: "team",
    icon: IconUsers,
    titleKey: "feature97Item4Title",
    bodyKey: "feature97Item4Body",
  },
];

export function TwoByTwoIconGridFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
        <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
          {f.feature97Heading}
        </h2>
        <p className="text-muted mx-auto mt-4 max-w-xl">{f.feature97Intro}</p>
      </div>
      <div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-6 px-6 sm:grid-cols-2 lg:px-8">
        {ITEMS.map((item) => (
          <div key={item.id} className="flex items-start gap-4">
            <span className="bg-brand/10 text-brand flex size-11 shrink-0 items-center justify-center rounded-lg">
              <item.icon size={20} aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-1">
              <h3 className="text-fg text-sm font-semibold">
                {f[item.titleKey]}
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {f[item.bodyKey]}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
