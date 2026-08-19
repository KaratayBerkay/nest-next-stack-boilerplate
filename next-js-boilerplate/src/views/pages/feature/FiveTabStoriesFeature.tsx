"use client";

import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const TAB_ONE_SUBS = [
  { titleKey: "feature54Tab1Sub1Title", bodyKey: "feature54Tab1Sub1Body" },
  { titleKey: "feature54Tab1Sub2Title", bodyKey: "feature54Tab1Sub2Body" },
  { titleKey: "feature54Tab1Sub3Title", bodyKey: "feature54Tab1Sub3Body" },
] as const;

const TAB_TWO_SUBS = [
  { titleKey: "feature54Tab2Sub1Title", bodyKey: "feature54Tab2Sub1Body" },
  { titleKey: "feature54Tab2Sub2Title", bodyKey: "feature54Tab2Sub2Body" },
  { titleKey: "feature54Tab2Sub3Title", bodyKey: "feature54Tab2Sub3Body" },
] as const;

const TAB_THREE_SUBS = [
  { titleKey: "feature54Tab3Sub1Title", bodyKey: "feature54Tab3Sub1Body" },
  { titleKey: "feature54Tab3Sub2Title", bodyKey: "feature54Tab3Sub2Body" },
  { titleKey: "feature54Tab3Sub3Title", bodyKey: "feature54Tab3Sub3Body" },
] as const;

const TAB_FOUR_SUBS = [
  { titleKey: "feature54Tab4Sub1Title", bodyKey: "feature54Tab4Sub1Body" },
  { titleKey: "feature54Tab4Sub2Title", bodyKey: "feature54Tab4Sub2Body" },
  { titleKey: "feature54Tab4Sub3Title", bodyKey: "feature54Tab4Sub3Body" },
] as const;

const TAB_FIVE_SUBS = [
  { titleKey: "feature54Tab5Sub1Title", bodyKey: "feature54Tab5Sub1Body" },
  { titleKey: "feature54Tab5Sub2Title", bodyKey: "feature54Tab5Sub2Body" },
  { titleKey: "feature54Tab5Sub3Title", bodyKey: "feature54Tab5Sub3Body" },
] as const;

interface StoryTab {
  id: string;
  labelKey: string;
  imageUrl: string;
  altKey: string;
  subs: readonly { titleKey: string; bodyKey: string }[];
}

const STORY_TABS: StoryTab[] = [
  {
    id: "capture",
    labelKey: "feature54Tab1Label",
    imageUrl: "https://picsum.photos/seed/feature54-tab1/1200/675",
    altKey: "feature54Image1Alt",
    subs: TAB_ONE_SUBS,
  },
  {
    id: "organize",
    labelKey: "feature54Tab2Label",
    imageUrl: "https://picsum.photos/seed/feature54-tab2/1200/675",
    altKey: "feature54Image2Alt",
    subs: TAB_TWO_SUBS,
  },
  {
    id: "automate",
    labelKey: "feature54Tab3Label",
    imageUrl: "https://picsum.photos/seed/feature54-tab3/1200/675",
    altKey: "feature54Image3Alt",
    subs: TAB_THREE_SUBS,
  },
  {
    id: "report",
    labelKey: "feature54Tab4Label",
    imageUrl: "https://picsum.photos/seed/feature54-tab4/1200/675",
    altKey: "feature54Image4Alt",
    subs: TAB_FOUR_SUBS,
  },
  {
    id: "scale",
    labelKey: "feature54Tab5Label",
    imageUrl: "https://picsum.photos/seed/feature54-tab5/1200/675",
    altKey: "feature54Image5Alt",
    subs: TAB_FIVE_SUBS,
  },
];

const SUB_TILE_CLASS =
  "border-border bg-surface rounded-lg border p-5" as const;

export function FiveTabStoriesFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature54Heading}
          </h2>
        </div>
        <div className="mt-12">
          <Tabs defaultValue={STORY_TABS[0].id}>
            <TabsList>
              {STORY_TABS.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {f[tab.labelKey]}
                </TabsTrigger>
              ))}
            </TabsList>
            {STORY_TABS.map((tab) => (
              <TabsContent key={tab.id} value={tab.id}>
                <div className="border-border bg-surface relative mt-8 aspect-video overflow-hidden rounded-lg border">
                  <Image
                    src={tab.imageUrl}
                    alt={f[tab.altKey]}
                    width={1200}
                    height={675}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {tab.subs.map((sub) => (
                    <div key={sub.titleKey} className={SUB_TILE_CLASS}>
                      <h4 className="text-fg text-sm font-semibold">
                        {f[sub.titleKey]}
                      </h4>
                      <p className="text-muted mt-1.5 text-sm leading-relaxed">
                        {f[sub.bodyKey]}
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  );
}
