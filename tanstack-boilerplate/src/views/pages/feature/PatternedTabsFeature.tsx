"use client";

import { useState } from "react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const DOT_PATTERN_STYLE = {
  backgroundImage:
    "radial-gradient(color-mix(in srgb, var(--fg) 10%, transparent) 1px, transparent 1px)",
  backgroundSize: "18px 18px",
} as const;

const PANELS = [
  {
    id: "plan",
    labelKey: "feature186Tab1Label",
    titleKey: "feature186Tab1Title",
    bodyKey: "feature186Tab1Body",
    altKey: "feature186Tab1ImageAlt",
    src: "/img/placeholders/ph-16x9-2.webp",
  },
  {
    id: "build",
    labelKey: "feature186Tab2Label",
    titleKey: "feature186Tab2Title",
    bodyKey: "feature186Tab2Body",
    altKey: "feature186Tab2ImageAlt",
    src: "/img/placeholders/ph-16x9-5.webp",
  },
  {
    id: "launch",
    labelKey: "feature186Tab3Label",
    titleKey: "feature186Tab3Title",
    bodyKey: "feature186Tab3Body",
    altKey: "feature186Tab3ImageAlt",
    src: "/img/placeholders/ph-16x9-7.webp",
  },
] as const;

export function PatternedTabsFeature() {
  const [active, setActive] = useState(0);
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="bg-surface relative w-full overflow-hidden py-16 lg:py-24">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={DOT_PATTERN_STYLE}
      />
      <div className="relative mx-auto max-w-5xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature186Heading}
          </h2>
          <p className="text-muted max-w-xl">{f.feature186Intro}</p>
        </div>
        <div className="mt-12">
          <Tabs
            defaultValue={PANELS[0].id}
            onValueChange={(value) =>
              setActive(PANELS.findIndex((panel) => panel.id === value))
            }
          >
            <TabsList className="mx-auto rounded-full">
              {PANELS.map((panel) => (
                <TabsTrigger key={panel.id} value={panel.id} variant="pills">
                  {f[panel.labelKey]}
                </TabsTrigger>
              ))}
            </TabsList>
            {PANELS.map((panel) => (
              <TabsContent key={panel.id} value={panel.id}>
                <div className="border-border bg-bg mt-8 overflow-hidden rounded-xl border">
                  <Image
                    src={panel.src}
                    alt={f[panel.altKey]}
                    width={1200}
                    height={675}
                    className="aspect-video w-full object-cover"
                  />
                  <div className="flex flex-col gap-2 p-6">
                    <h3 className="text-fg text-lg font-semibold">
                      {f[panel.titleKey]}
                    </h3>
                    <p className="text-muted text-sm leading-relaxed">
                      {f[panel.bodyKey]}
                    </p>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
          <div className="mt-6 flex items-center justify-center gap-2 sm:hidden">
            {PANELS.map((panel, index) => (
              <span
                key={panel.id}
                aria-hidden="true"
                className={`h-1.5 rounded-full transition-all ${
                  index === active ? "bg-brand w-6" : "bg-border w-1.5"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
