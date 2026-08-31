"use client";

import Image from "next/image";
import { IconVolume3 } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const STATS = [
  { id: "s1", valueKey: "feature220Stat1Value", labelKey: "feature220Stat1Label" },
  { id: "s2", valueKey: "feature220Stat2Value", labelKey: "feature220Stat2Label" },
] as const;

export function MutedAutoplayVideoStatsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
                {f.feature220Heading}
              </h2>
              <p className="text-muted leading-relaxed">{f.feature220Body}</p>
            </div>
            <div className="border-border grid grid-cols-2 gap-6 border-t pt-6">
              {STATS.map((stat) => (
                <div key={stat.id} className="flex flex-col gap-0.5">
                  <span className="text-fg text-2xl font-semibold tracking-tight">
                    {f[stat.valueKey]}
                  </span>
                  <span className="text-muted text-xs">{f[stat.labelKey]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-border bg-surface relative overflow-hidden rounded-xl border">
            <Image
              src="/img/placeholders/ph-4x3-6.webp"
              alt={f.feature220ImageAlt}
              width={640}
              height={480}
              className="aspect-[4/3] w-full object-cover"
            />
            <span className="bg-bg/90 text-muted absolute right-3 bottom-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs">
              <IconVolume3 size={12} aria-hidden="true" />
              {f.feature220MutedLabel}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
