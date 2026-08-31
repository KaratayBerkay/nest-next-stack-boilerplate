"use client";

import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const TABS = [
  {
    id: "overview",
    labelKey: "feature169Tab1Label",
    altKey: "feature169Tab1ImageAlt",
    src: "/img/placeholders/ph-16x9-0.webp",
  },
  {
    id: "pipeline",
    labelKey: "feature169Tab2Label",
    altKey: "feature169Tab2ImageAlt",
    src: "/img/placeholders/ph-16x9-3.webp",
  },
  {
    id: "reports",
    labelKey: "feature169Tab3Label",
    altKey: "feature169Tab3ImageAlt",
    src: "/img/placeholders/ph-16x9-6.webp",
  },
] as const;

export function LineTabsScreenshotFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature169Heading}
          </h2>
          <p className="text-muted max-w-xl">{f.feature169Intro}</p>
        </div>
        <Tabs defaultValue={TABS[0].id} className="mt-10">
          <TabsList className="mx-auto justify-center">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} variant="underline">
                {f[tab.labelKey]}
              </TabsTrigger>
            ))}
          </TabsList>
          {TABS.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <div className="border-border bg-surface mt-8 overflow-hidden rounded-xl border shadow-sm">
                <Image
                  src={tab.src}
                  alt={f[tab.altKey]}
                  width={1280}
                  height={720}
                  className="aspect-video w-full object-cover"
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
