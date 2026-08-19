"use client";

import Image from "next/image";
import { IconArrowRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

interface DemoTab {
  id: string;
  labelKey: string;
  titleKey: string;
  bodyKey: string;
  altKey: string;
  src: string;
}

const DEMO_TABS: DemoTab[] = [
  {
    id: "analyze",
    labelKey: "feature78Tab1Label",
    titleKey: "feature78Tab1Title",
    bodyKey: "feature78Tab1Body",
    altKey: "feature78Tab1ImageAlt",
    src: "https://picsum.photos/seed/feature78-1/800/600",
  },
  {
    id: "automate",
    labelKey: "feature78Tab2Label",
    titleKey: "feature78Tab2Title",
    bodyKey: "feature78Tab2Body",
    altKey: "feature78Tab2ImageAlt",
    src: "https://picsum.photos/seed/feature78-2/800/600",
  },
  {
    id: "collaborate",
    labelKey: "feature78Tab3Label",
    titleKey: "feature78Tab3Title",
    bodyKey: "feature78Tab3Body",
    altKey: "feature78Tab3ImageAlt",
    src: "https://picsum.photos/seed/feature78-3/800/600",
  },
];

export function TabbedDemoFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-2xl flex-col items-start gap-4">
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature78Heading}
            </h2>
            <p className="text-muted">{f.feature78Intro}</p>
          </div>
          <Button className="shrink-0">
            <span>{f.feature78BookDemo}</span>
            <IconArrowRight size={16} aria-hidden="true" />
          </Button>
        </div>
        <div className="mt-12">
          <Tabs defaultValue={DEMO_TABS[0].id}>
            <div className="flex justify-center">
              <TabsList>
                {DEMO_TABS.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    {f[tab.labelKey]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {DEMO_TABS.map((tab) => (
              <TabsContent key={tab.id} value={tab.id}>
                <div className="mt-10 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                  <div className="border-border bg-surface overflow-hidden rounded-lg border">
                    <Image
                      src={tab.src}
                      alt={f[tab.altKey]}
                      width={800}
                      height={600}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col items-start gap-4">
                    <h3 className="text-fg text-2xl font-semibold tracking-tight">
                      {f[tab.titleKey]}
                    </h3>
                    <p className="text-muted leading-relaxed">
                      {f[tab.bodyKey]}
                    </p>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  );
}
