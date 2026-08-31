"use client";

import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const TABS = [
  {
    id: "capture",
    labelKey: "feature213Tab1Label",
    bodyKey: "feature213Tab1Body",
    altKey: "feature213Tab1ImageAlt",
    src: "/img/placeholders/ph-16x9-1.webp",
  },
  {
    id: "review",
    labelKey: "feature213Tab2Label",
    bodyKey: "feature213Tab2Body",
    altKey: "feature213Tab2ImageAlt",
    src: "/img/placeholders/ph-16x9-3.webp",
  },
  {
    id: "publish",
    labelKey: "feature213Tab3Label",
    bodyKey: "feature213Tab3Body",
    altKey: "feature213Tab3ImageAlt",
    src: "/img/placeholders/ph-16x9-5.webp",
  },
] as const;

export function VerticalTabs169Feature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature213Heading}
          </h2>
          <p className="text-muted mx-auto max-w-xl">{f.feature213Intro}</p>
        </div>
        <Tabs defaultValue={TABS[0].id} className="mt-12">
          <div className="flex flex-col gap-8 lg:flex-row">
            <TabsList className="h-auto flex-col items-stretch gap-1 lg:w-56 lg:shrink-0">
              {TABS.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="justify-start text-left"
                >
                  {f[tab.labelKey]}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="flex-1">
              {TABS.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="mt-0">
                  <div className="border-border bg-surface overflow-hidden rounded-xl border">
                    <Image
                      src={tab.src}
                      alt={f[tab.altKey]}
                      width={1200}
                      height={675}
                      className="aspect-video w-full object-cover"
                    />
                  </div>
                  <p className="text-muted mt-4 text-sm leading-relaxed">
                    {f[tab.bodyKey]}
                  </p>
                </TabsContent>
              ))}
            </div>
          </div>
        </Tabs>
      </div>
    </section>
  );
}
