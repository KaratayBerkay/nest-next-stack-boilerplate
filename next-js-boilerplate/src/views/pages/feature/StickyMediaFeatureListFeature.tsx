"use client";

import { useState } from "react";
import Image from "next/image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const ROWS = [
  {
    id: "collect",
    titleKey: "feature199Row1Title",
    bodyKey: "feature199Row1Body",
    altKey: "feature199Row1ImageAlt",
    src: "/img/placeholders/ph-4x5-1.webp",
  },
  {
    id: "organize",
    titleKey: "feature199Row2Title",
    bodyKey: "feature199Row2Body",
    altKey: "feature199Row2ImageAlt",
    src: "/img/placeholders/ph-4x5-3.webp",
  },
  {
    id: "act",
    titleKey: "feature199Row3Title",
    bodyKey: "feature199Row3Body",
    altKey: "feature199Row3ImageAlt",
    src: "/img/placeholders/ph-4x5-5.webp",
  },
] as const;

export function StickyMediaFeatureListFeature() {
  const [activeId, setActiveId] = useState<string>(ROWS[0].id);
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;
  const active = ROWS.find((row) => row.id === activeId) ?? ROWS[0];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
          <div className="flex flex-col">
            {ROWS.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => setActiveId(row.id)}
                data-state={row.id === activeId ? "active" : "inactive"}
                className="border-border data-[state=active]:border-brand flex flex-col gap-2 border-l-2 px-6 py-6 text-left transition-colors first:pt-0 last:pb-0"
              >
                <h3 className="data-[state=active]:text-fg text-muted text-lg font-semibold">
                  {f[row.titleKey]}
                </h3>
                {row.id === activeId ? (
                  <p className="text-muted text-sm leading-relaxed">
                    {f[row.bodyKey]}
                  </p>
                ) : null}
              </button>
            ))}
          </div>
          <div className="border-border bg-surface sticky top-24 h-fit overflow-hidden rounded-xl border">
            <Image
              src={active.src}
              alt={f[active.altKey]}
              width={480}
              height={600}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
