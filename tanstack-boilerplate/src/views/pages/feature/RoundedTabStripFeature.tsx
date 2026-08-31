"use client";

import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const STRIP_TABS = [
  { id: "projects", labelKey: "feature211Tab1Label" },
  { id: "analytics", labelKey: "feature211Tab2Label" },
  { id: "automations", labelKey: "feature211Tab3Label" },
] as const;

export function RoundedTabStripFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature211Heading}
          </h2>
          <p className="text-muted max-w-xl">{f.feature211Intro}</p>
        </div>
        <div className="mt-12">
          <Tabs defaultValue={STRIP_TABS[0].id}>
            <TabsList className="rounded-full">
              {STRIP_TABS.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} variant="pills">
                  {f[tab.labelKey]}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="projects">
              <div className="border-border bg-surface mt-8 grid overflow-hidden rounded-lg border sm:grid-cols-2">
                <div className="aspect-square">
                  <Image
                    src="/img/placeholders/ph-1x1-6.webp"
                    alt={f.feature211Tab1ImageAlt}
                    width={800}
                    height={800}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center gap-2 p-8">
                  <h3 className="text-fg text-xl font-semibold">
                    {f.feature211Tab1Title}
                  </h3>
                  <p className="text-muted leading-relaxed">
                    {f.feature211Tab1Body}
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="analytics">
              <div className="border-border bg-surface mt-8 overflow-hidden rounded-lg border">
                <div className="aspect-[16/9]">
                  <Image
                    src="/img/placeholders/ph-16x9-4.webp"
                    alt={f.feature211Tab2ImageAlt}
                    width={1200}
                    height={675}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-2 p-8">
                  <h3 className="text-fg text-xl font-semibold">
                    {f.feature211Tab2Title}
                  </h3>
                  <p className="text-muted leading-relaxed">
                    {f.feature211Tab2Body}
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="automations">
              <div className="border-border bg-surface mt-8 overflow-hidden rounded-lg border">
                <div className="aspect-video">
                  <Image
                    src="/img/placeholders/ph-16x9-1.webp"
                    alt={f.feature211Tab3ImageAlt}
                    width={1200}
                    height={675}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-2 p-8">
                  <h3 className="text-fg text-xl font-semibold">
                    {f.feature211Tab3Title}
                  </h3>
                  <p className="text-muted leading-relaxed">
                    {f.feature211Tab3Body}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
