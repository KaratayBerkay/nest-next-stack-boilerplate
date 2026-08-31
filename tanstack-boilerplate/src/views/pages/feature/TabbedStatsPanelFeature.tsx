"use client";

import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const TAB_ONE_STATS = [
  {
    valueKey: "feature205Tab1Stat1Value",
    labelKey: "feature205Tab1Stat1Label",
  },
  {
    valueKey: "feature205Tab1Stat2Value",
    labelKey: "feature205Tab1Stat2Label",
  },
  {
    valueKey: "feature205Tab1Stat3Value",
    labelKey: "feature205Tab1Stat3Label",
  },
] as const;

const TAB_TWO_STATS = [
  {
    valueKey: "feature205Tab2Stat1Value",
    labelKey: "feature205Tab2Stat1Label",
  },
  {
    valueKey: "feature205Tab2Stat2Value",
    labelKey: "feature205Tab2Stat2Label",
  },
  {
    valueKey: "feature205Tab2Stat3Value",
    labelKey: "feature205Tab2Stat3Label",
  },
] as const;

const TAB_THREE_STATS = [
  {
    valueKey: "feature205Tab3Stat1Value",
    labelKey: "feature205Tab3Stat1Label",
  },
  {
    valueKey: "feature205Tab3Stat2Value",
    labelKey: "feature205Tab3Stat2Label",
  },
  {
    valueKey: "feature205Tab3Stat3Value",
    labelKey: "feature205Tab3Stat3Label",
  },
] as const;

interface StatTab {
  id: string;
  labelKey: string;
  titleKey: string;
  bodyKey: string;
  imageUrl: string;
  altKey: string;
  stats: readonly { valueKey: string; labelKey: string }[];
}

const STAT_TABS: StatTab[] = [
  {
    id: "reach",
    labelKey: "feature205Tab1Label",
    titleKey: "feature205Tab1Title",
    bodyKey: "feature205Tab1Body",
    imageUrl: "/img/placeholders/ph-16x9-4.webp",
    altKey: "feature205Tab1ImageAlt",
    stats: TAB_ONE_STATS,
  },
  {
    id: "engagement",
    labelKey: "feature205Tab2Label",
    titleKey: "feature205Tab2Title",
    bodyKey: "feature205Tab2Body",
    imageUrl: "/img/placeholders/ph-16x9-0.webp",
    altKey: "feature205Tab2ImageAlt",
    stats: TAB_TWO_STATS,
  },
  {
    id: "revenue",
    labelKey: "feature205Tab3Label",
    titleKey: "feature205Tab3Title",
    bodyKey: "feature205Tab3Body",
    imageUrl: "/img/placeholders/ph-16x9-0.webp",
    altKey: "feature205Tab3ImageAlt",
    stats: TAB_THREE_STATS,
  },
];

export function TabbedStatsPanelFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <Tabs defaultValue={STAT_TABS[0].id}>
          <TabsList>
            {STAT_TABS.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {f[tab.labelKey]}
              </TabsTrigger>
            ))}
          </TabsList>
          {STAT_TABS.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <div className="mt-8">
                <div className="border-border bg-surface relative overflow-hidden rounded-xl border shadow-sm">
                  <Image
                    src={tab.imageUrl}
                    alt={f[tab.altKey]}
                    width={1200}
                    height={675}
                    className="aspect-[16/9] w-full object-cover"
                  />
                  <div className="border-border bg-border relative z-10 mx-4 -mt-16 grid grid-cols-3 gap-px overflow-hidden rounded-lg border shadow-md">
                    {tab.stats.map((stat) => (
                      <div key={stat.valueKey} className="bg-surface px-4 py-4">
                        <span className="text-fg block text-xl font-semibold tracking-tight">
                          {f[stat.valueKey]}
                        </span>
                        <span className="text-muted mt-0.5 block text-xs">
                          {f[stat.labelKey]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-6 flex max-w-2xl flex-col gap-2">
                  <h3 className="text-fg text-xl font-semibold">
                    {f[tab.titleKey]}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed">
                    {f[tab.bodyKey]}
                  </p>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
