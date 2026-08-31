"use client";

import { useState } from "react";
import Image from "next/image";
import { IconBolt, IconChartBar, IconCloud } from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const TABS: {
  id: string;
  icon: Icon;
  ariaKey: string;
  src: string;
  altKey: string;
}[] = [
  {
    id: "speed",
    icon: IconBolt,
    ariaKey: "feature105Tab1Aria",
    src: "/img/placeholders/ph-16x9-1.webp",
    altKey: "feature105Tab1ImageAlt",
  },
  {
    id: "insights",
    icon: IconChartBar,
    ariaKey: "feature105Tab2Aria",
    src: "/img/placeholders/ph-16x9-3.webp",
    altKey: "feature105Tab2ImageAlt",
  },
  {
    id: "cloud",
    icon: IconCloud,
    ariaKey: "feature105Tab3Aria",
    src: "/img/placeholders/ph-16x9-5.webp",
    altKey: "feature105Tab3ImageAlt",
  },
];

export function IconTabsSwappedImagesFeature() {
  const [activeId, setActiveId] = useState<string>(TABS[0].id);
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;
  const active = TABS.find((tab) => tab.id === activeId) ?? TABS[0];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature105Heading}
          </h2>
          <p className="text-muted max-w-xl">{f.feature105Intro}</p>
        </div>
        <div className="mt-8 flex justify-center gap-3">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveId(tab.id)}
              data-state={tab.id === activeId ? "active" : "inactive"}
              aria-label={f[tab.ariaKey]}
              className="data-[state=active]:bg-brand data-[state=active]:text-brand-fg data-[state=inactive]:bg-surface data-[state=inactive]:text-muted flex size-11 items-center justify-center rounded-full transition-colors"
            >
              <tab.icon size={20} aria-hidden="true" />
            </button>
          ))}
        </div>
        <div className="border-border bg-surface mt-8 overflow-hidden rounded-xl border">
          <Image
            src={active.src}
            alt={f[active.altKey]}
            width={1200}
            height={675}
            className="aspect-video w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
