"use client";

import Image from "next/image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const CHIPS = [
  { id: "s1", nameKey: "feature92Chip1" },
  { id: "s2", nameKey: "feature92Chip2" },
  { id: "s3", nameKey: "feature92Chip3" },
  { id: "s4", nameKey: "feature92Chip4" },
  { id: "s5", nameKey: "feature92Chip5" },
] as const;

export function SocialIntegrationsStripFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
        <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
          {f.feature92Heading}
        </h2>
        <p className="text-muted mx-auto mt-4 max-w-xl">{f.feature92Intro}</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {CHIPS.map((chip) => (
            <span
              key={chip.id}
              className="border-border bg-surface inline-flex items-center gap-2 rounded-full border px-4 py-2"
            >
              <Image
                src="/img/placeholders/ph-1x1-2.webp"
                alt=""
                aria-hidden="true"
                width={20}
                height={20}
                className="size-5 rounded-full object-cover"
              />
              <span className="text-fg text-sm font-medium">
                {f[chip.nameKey]}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
