"use client";

import {
  IconBolt,
  IconBuildingSkyscraper,
  IconChartBar,
  IconClock,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

interface ValueCard {
  id: string;
  icon: Icon;
  titleKey: string;
  bodyKey: string;
}

const VALUES: ValueCard[] = [
  {
    id: "customer",
    icon: IconUsers,
    titleKey: "feature42Card1Title",
    bodyKey: "feature42Card1Body",
  },
  {
    id: "ownership",
    icon: IconBuildingSkyscraper,
    titleKey: "feature42Card2Title",
    bodyKey: "feature42Card2Body",
  },
  {
    id: "action",
    icon: IconBolt,
    titleKey: "feature42Card3Title",
    bodyKey: "feature42Card3Body",
  },
  {
    id: "transparency",
    icon: IconChartBar,
    titleKey: "feature42Card4Title",
    bodyKey: "feature42Card4Body",
  },
  {
    id: "craft",
    icon: IconSparkles,
    titleKey: "feature42Card5Title",
    bodyKey: "feature42Card5Body",
  },
  {
    id: "longterm",
    icon: IconClock,
    titleKey: "feature42Card6Title",
    bodyKey: "feature42Card6Body",
  },
];

export function ValuesHeadingGridFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <h2 className="text-fg max-w-3xl text-3xl font-semibold tracking-tight lg:text-4xl">
          {f.feature42Heading}
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((value) => (
            <div
              key={value.id}
              className="border-border bg-surface flex flex-col gap-3 rounded-lg border p-6"
            >
              <span className="bg-brand text-brand-fg flex size-11 shrink-0 items-center justify-center rounded-md">
                <value.icon size={20} aria-hidden="true" />
              </span>
              <h3 className="text-fg text-base font-semibold">
                {f[value.titleKey]}
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {f[value.bodyKey]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
