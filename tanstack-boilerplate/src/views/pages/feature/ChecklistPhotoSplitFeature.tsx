"use client";

import Image from "next/image";
import { IconCheck } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const IMAGE_SRC = "/img/placeholders/ph-4x3-6.webp" as const;
const IMAGE_SIZES = "(max-width: 1024px) 100vw, 50vw";

const ITEMS = [
  { termKey: "feature227Item1Term", descKey: "feature227Item1Desc" },
  { termKey: "feature227Item2Term", descKey: "feature227Item2Desc" },
  { termKey: "feature227Item3Term", descKey: "feature227Item3Desc" },
  { termKey: "feature227Item4Term", descKey: "feature227Item4Desc" },
] as const;

export function ChecklistPhotoSplitFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-5">
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature227Heading}
            </h2>
            <p className="text-muted leading-relaxed">{f.feature227Intro}</p>
            <dl className="flex flex-col gap-5">
              {ITEMS.map((item) => (
                <div key={item.termKey} className="flex items-start gap-3">
                  <span className="bg-brand/10 text-brand mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full">
                    <IconCheck size={14} aria-hidden="true" />
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-fg text-sm font-semibold">
                      {f[item.termKey]}
                    </dt>
                    <dd className="text-muted text-sm">{f[item.descKey]}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
          <div className="border-border bg-surface overflow-hidden rounded-lg border">
            <Image
              src={IMAGE_SRC}
              alt={f.feature227ImageAlt}
              width={800}
              height={600}
              sizes={IMAGE_SIZES}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
