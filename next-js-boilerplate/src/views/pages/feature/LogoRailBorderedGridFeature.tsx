"use client";

import Image from "next/image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const CELLS = [
  {
    id: "cell1",
    titleKey: "feature161Cell1Title",
    bodyKey: "feature161Cell1Body",
  },
  {
    id: "cell2",
    titleKey: "feature161Cell2Title",
    bodyKey: "feature161Cell2Body",
  },
] as const;

export function LogoRailBorderedGridFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature161Heading}
          </h2>
          <p className="text-muted mx-auto max-w-xl">{f.feature161Intro}</p>
        </div>
        <div className="border-border mt-12 grid gap-px overflow-hidden rounded-xl border bg-transparent sm:grid-cols-2">
          {CELLS.map((cell) => (
            <div key={cell.id} className="bg-surface flex flex-col gap-4 p-6">
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((index) => (
                  <span
                    key={index}
                    className="bg-muted/15 flex size-8 items-center justify-center rounded-md"
                  >
                    <Image
                      src="/img/placeholders/ph-1x1-1.webp"
                      alt=""
                      aria-hidden="true"
                      width={18}
                      height={18}
                      className="size-[18px] rounded-sm object-cover"
                    />
                  </span>
                ))}
              </div>
              <h3 className="text-fg text-base font-semibold">
                {f[cell.titleKey]}
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {f[cell.bodyKey]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
