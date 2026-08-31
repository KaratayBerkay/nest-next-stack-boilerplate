"use client";

import Image from "next/image";
import { IconPlayerPlayFilled } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const STATS = [
  { id: "s1", valueKey: "feature220bStat1Value", labelKey: "feature220bStat1Label" },
  { id: "s2", valueKey: "feature220bStat2Value", labelKey: "feature220bStat2Label" },
  { id: "s3", valueKey: "feature220bStat3Value", labelKey: "feature220bStat3Label" },
] as const;

export function StatsVideoCopyFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <button
            type="button"
            className="border-border bg-surface group relative overflow-hidden rounded-xl border text-left"
          >
            <Image
              src="/img/placeholders/ph-16x9-2.webp"
              alt={f.feature220bImageAlt}
              width={640}
              height={360}
              className="aspect-video w-full object-cover"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30"
            >
              <span className="flex size-14 items-center justify-center rounded-full bg-white/90 text-black">
                <IconPlayerPlayFilled size={22} aria-hidden="true" />
              </span>
            </span>
          </button>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
                {f.feature220bHeading}
              </h2>
              <p className="text-muted leading-relaxed">{f.feature220bBody}</p>
            </div>
            <div className="border-border grid grid-cols-3 gap-4 border-t pt-6">
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
        </div>
      </div>
    </section>
  );
}
