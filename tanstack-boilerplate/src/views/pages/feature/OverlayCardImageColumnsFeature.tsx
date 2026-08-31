"use client";

import Image from "next/image";
import { IconChartBar, IconRocket, IconShieldCheck } from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const COLUMNS: { id: string; icon: Icon; titleKey: string; src: string; altKey: string }[] = [
  { id: "launch", icon: IconRocket, titleKey: "feature117Col1Title", src: "/img/placeholders/ph-3x4-1.webp", altKey: "feature117Col1ImageAlt" },
  { id: "insights", icon: IconChartBar, titleKey: "feature117Col2Title", src: "/img/placeholders/ph-3x4-3.webp", altKey: "feature117Col2ImageAlt" },
  { id: "secure", icon: IconShieldCheck, titleKey: "feature117Col3Title", src: "/img/placeholders/ph-3x4-5.webp", altKey: "feature117Col3ImageAlt" },
];

export function OverlayCardImageColumnsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature117Heading}
          </h2>
          <p className="text-muted mx-auto max-w-xl">{f.feature117Intro}</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.id} className="relative overflow-hidden rounded-xl">
              <Image
                src={col.src}
                alt={f[col.altKey]}
                width={400}
                height={533}
                className="aspect-[3/4] w-full object-cover"
              />
              <div className="border-border bg-bg/90 absolute inset-x-3 bottom-3 flex items-center gap-2.5 rounded-lg border px-3 py-2.5 backdrop-blur-sm">
                <span className="bg-brand/10 text-brand flex size-8 shrink-0 items-center justify-center rounded-md">
                  <col.icon size={16} aria-hidden="true" />
                </span>
                <span className="text-fg text-sm font-medium">{f[col.titleKey]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
