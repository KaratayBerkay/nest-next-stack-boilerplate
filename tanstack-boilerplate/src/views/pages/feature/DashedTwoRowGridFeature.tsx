"use client";

import {
  IconBolt,
  IconChartBar,
  IconHistory,
  IconShieldCheck,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const ITEMS = [
  {
    titleKey: "feature172Item1Title",
    bodyKey: "feature172Item1Body",
    Icon: IconBolt,
  },
  {
    titleKey: "feature172Item2Title",
    bodyKey: "feature172Item2Body",
    Icon: IconShieldCheck,
  },
  {
    titleKey: "feature172Item3Title",
    bodyKey: "feature172Item3Body",
    Icon: IconChartBar,
  },
  {
    titleKey: "feature172Item4Title",
    bodyKey: "feature172Item4Body",
    Icon: IconHistory,
  },
] as const;

const ITEM_CLASSES = [
  "",
  "border-t-2 border-dashed pt-8 lg:border-t-0 lg:pt-0",
  "border-t-2 border-dashed pt-8",
  "border-t-2 border-dashed pt-8 lg:border-l-2 lg:pl-8",
] as const;

export function DashedTwoRowGridFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature172Heading}
          </h2>
          <p className="text-muted">{f.feature172Intro}</p>
        </div>
        <div className="border-border bg-surface mt-12 rounded-2xl border p-8 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-2">
            {ITEMS.map((item, index) => (
              <div
                key={item.titleKey}
                className={`border-border flex flex-col gap-4 ${ITEM_CLASSES[index]}`}
              >
                <span className="bg-brand text-brand-fg flex size-11 items-center justify-center rounded-lg">
                  <item.Icon size={22} aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-fg text-base font-semibold">
                    {f[item.titleKey]}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed">
                    {f[item.bodyKey]}
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
