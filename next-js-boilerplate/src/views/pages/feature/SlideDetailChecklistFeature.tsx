"use client";

import Image from "next/image";
import { IconArrowRight, IconCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

interface SlideTab {
  id: string;
  labelKey: string;
  headingKey: string;
  bodyKey: string;
  ctaKey: string;
  altKey: string;
  src: string;
  checks: readonly string[];
}

const SLIDE_TABS: SlideTab[] = [
  {
    id: "planning",
    labelKey: "feature19Tab1Label",
    headingKey: "feature19Slide1Title",
    bodyKey: "feature19Slide1Body",
    ctaKey: "feature19Slide1CtaLabel",
    altKey: "feature19Slide1ImageAlt",
    src: "https://picsum.photos/seed/feature19-1/800/1000",
    checks: [
      "feature19Slide1Check1",
      "feature19Slide1Check2",
      "feature19Slide1Check3",
      "feature19Slide1Check4",
    ],
  },
  {
    id: "collaboration",
    labelKey: "feature19Tab2Label",
    headingKey: "feature19Slide2Title",
    bodyKey: "feature19Slide2Body",
    ctaKey: "feature19Slide2CtaLabel",
    altKey: "feature19Slide2ImageAlt",
    src: "https://picsum.photos/seed/feature19-2/800/1000",
    checks: [
      "feature19Slide2Check1",
      "feature19Slide2Check2",
      "feature19Slide2Check3",
      "feature19Slide2Check4",
    ],
  },
  {
    id: "reporting",
    labelKey: "feature19Tab3Label",
    headingKey: "feature19Slide3Title",
    bodyKey: "feature19Slide3Body",
    ctaKey: "feature19Slide3CtaLabel",
    altKey: "feature19Slide3ImageAlt",
    src: "https://picsum.photos/seed/feature19-3/800/1000",
    checks: [
      "feature19Slide3Check1",
      "feature19Slide3Check2",
      "feature19Slide3Check3",
      "feature19Slide3Check4",
    ],
  },
];

export function SlideDetailChecklistFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature19Heading}
          </h2>
          <p className="text-muted">{f.feature19Intro}</p>
        </div>
        <div className="mt-12">
          <Tabs defaultValue={SLIDE_TABS[0].id}>
            <div className="flex justify-center">
              <TabsList>
                {SLIDE_TABS.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    {f[tab.labelKey]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {SLIDE_TABS.map((tab) => (
              <TabsContent key={tab.id} value={tab.id}>
                <div className="mt-10 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                  <div className="border-border bg-surface order-1 aspect-[4/5] overflow-hidden rounded-lg border lg:order-2">
                    <Image
                      src={tab.src}
                      alt={f[tab.altKey]}
                      width={800}
                      height={1000}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="order-2 flex flex-col items-start gap-5 lg:order-1">
                    <h3 className="text-fg text-2xl font-semibold tracking-tight">
                      {f[tab.headingKey]}
                    </h3>
                    <p className="text-muted leading-relaxed">
                      {f[tab.bodyKey]}
                    </p>
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {tab.checks.map((checkKey) => (
                        <li key={checkKey} className="flex items-start gap-2.5">
                          <span className="bg-success/10 text-success flex size-6 shrink-0 items-center justify-center rounded-full">
                            <IconCheck size={14} aria-hidden="true" />
                          </span>
                          <span className="text-muted text-sm">
                            {f[checkKey]}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" className="mt-1">
                      <span>{f[tab.ctaKey]}</span>
                      <IconArrowRight size={16} aria-hidden="true" />
                    </Button>
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
