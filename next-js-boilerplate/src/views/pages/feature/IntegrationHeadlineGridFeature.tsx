"use client";

import Image from "next/image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const LOGOS = [
  { id: "l1", nameKey: "feature82Logo1" },
  { id: "l2", nameKey: "feature82Logo2" },
  { id: "l3", nameKey: "feature82Logo3" },
  { id: "l4", nameKey: "feature82Logo4" },
  { id: "l5", nameKey: "feature82Logo5" },
  { id: "l6", nameKey: "feature82Logo6" },
] as const;

export function IntegrationHeadlineGridFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="border-border flex flex-col gap-4 border-b pb-8 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature82Heading}
          </h2>
          <p className="text-muted max-w-sm">{f.feature82Intro}</p>
        </div>
        <div className="border-border mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-transparent sm:grid-cols-3">
          {LOGOS.map((logo) => (
            <div
              key={logo.id}
              className="bg-surface flex items-center justify-center gap-2 p-8"
            >
              <Image
                src="/img/placeholders/ph-1x1-3.webp"
                alt=""
                aria-hidden="true"
                width={28}
                height={28}
                className="size-7 rounded-md object-cover"
              />
              <span className="text-fg text-sm font-semibold">
                {f[logo.nameKey]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
