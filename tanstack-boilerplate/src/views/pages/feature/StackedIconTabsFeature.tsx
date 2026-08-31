"use client";

import { useState } from "react";
import Image from "next/image";
import { IconChartBar, IconCloud, IconLock } from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const TABS: { id: string; icon: Icon; labelKey: string; src: string; altKey: string }[] = [
  { id: "insights", icon: IconChartBar, labelKey: "feature51Tab1Label", src: "/img/placeholders/ph-4x3-1.webp", altKey: "feature51Tab1ImageAlt" },
  { id: "cloud", icon: IconCloud, labelKey: "feature51Tab2Label", src: "/img/placeholders/ph-4x3-3.webp", altKey: "feature51Tab2ImageAlt" },
  { id: "secure", icon: IconLock, labelKey: "feature51Tab3Label", src: "/img/placeholders/ph-4x3-5.webp", altKey: "feature51Tab3ImageAlt" },
];

export function StackedIconTabsFeature() {
  const [activeId, setActiveId] = useState<string>(TABS[0].id);
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;
  const active = TABS.find((tab) => tab.id === activeId) ?? TABS[0];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-3">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveId(tab.id)}
                data-state={tab.id === activeId ? "active" : "inactive"}
                className="data-[state=active]:border-brand data-[state=active]:bg-surface data-[state=inactive]:border-border flex items-center gap-3 rounded-lg border p-4 text-left transition-colors"
              >
                <span className="bg-brand/10 text-brand flex size-9 shrink-0 items-center justify-center rounded-md">
                  <tab.icon size={18} aria-hidden="true" />
                </span>
                <span className="text-fg text-sm font-medium">{f[tab.labelKey]}</span>
              </button>
            ))}
          </div>
          <div className="border-border bg-surface overflow-hidden rounded-xl border">
            <Image
              src={active.src}
              alt={f[active.altKey]}
              width={640}
              height={480}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
