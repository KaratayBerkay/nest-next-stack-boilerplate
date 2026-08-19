"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const BRANDS = [
  {
    index: "01",
    nameKey: "feature53Brand1Name",
  },
  {
    index: "02",
    nameKey: "feature53Brand2Name",
  },
  {
    index: "03",
    nameKey: "feature53Brand3Name",
  },
  {
    index: "04",
    nameKey: "feature53Brand4Name",
  },
  {
    index: "05",
    nameKey: "feature53Brand5Name",
  },
  {
    index: "06",
    nameKey: "feature53Brand6Name",
  },
  {
    index: "07",
    nameKey: "feature53Brand7Name",
  },
  {
    index: "08",
    nameKey: "feature53Brand8Name",
  },
] as const;

export function NumberedLogoMatrixFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature53Heading}
          </h2>
          <p className="text-muted">{f.feature53Intro}</p>
        </div>
        <div className="bg-surface border-border mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-lg border lg:grid-cols-4">
          {BRANDS.map((brand) => (
            <div
              key={brand.index}
              className="bg-bg relative flex min-h-40 items-center justify-center p-8 lg:min-h-48"
            >
              <span className="text-muted absolute top-4 left-5 font-mono text-xs">
                {brand.index}
              </span>
              <span className="text-fg text-xl font-semibold tracking-tight">
                {f[brand.nameKey]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
