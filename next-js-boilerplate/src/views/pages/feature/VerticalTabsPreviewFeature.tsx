"use client";

import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const PREVIEW_TABS = [
  {
    id: "overview",
    labelKey: "feature175Tab1Label",
    titleKey: "feature175Tab1Title",
    bodyKey: "feature175Tab1Body",
    imageUrl: "https://picsum.photos/seed/feature175-tab1/1200/675",
    altKey: "feature175Tab1ImageAlt",
  },
  {
    id: "reports",
    labelKey: "feature175Tab2Label",
    titleKey: "feature175Tab2Title",
    bodyKey: "feature175Tab2Body",
    imageUrl: "https://picsum.photos/seed/feature175-tab2/1200/675",
    altKey: "feature175Tab2ImageAlt",
  },
  {
    id: "settings",
    labelKey: "feature175Tab3Label",
    titleKey: "feature175Tab3Title",
    bodyKey: "feature175Tab3Body",
    imageUrl: "https://picsum.photos/seed/feature175-tab3/1200/675",
    altKey: "feature175Tab3ImageAlt",
  },
] as const;

export function VerticalTabsPreviewFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <Tabs defaultValue={PREVIEW_TABS[0].id} orientation="vertical">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="flex flex-col items-start gap-5 lg:col-span-4">
              <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
                {f.feature175Heading}
              </h2>
              <p className="text-muted leading-relaxed">{f.feature175Intro}</p>
              <TabsList className="flex flex-col items-start gap-1">
                {PREVIEW_TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="w-full justify-start"
                  >
                    {f[tab.labelKey]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <div className="lg:col-span-8">
              {PREVIEW_TABS.map((tab) => (
                <TabsContent key={tab.id} value={tab.id}>
                  <div className="border-border bg-surface overflow-hidden rounded-lg border">
                    <Image
                      src={tab.imageUrl}
                      alt={f[tab.altKey]}
                      width={1200}
                      height={675}
                      className="h-full w-full object-cover"
                    />
                    <div className="flex flex-col gap-2 p-6">
                      <h3 className="text-fg text-xl font-semibold">
                        {f[tab.titleKey]}
                      </h3>
                      <p className="text-muted leading-relaxed">
                        {f[tab.bodyKey]}
                      </p>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </div>
          </div>
        </Tabs>
      </div>
    </section>
  );
}
