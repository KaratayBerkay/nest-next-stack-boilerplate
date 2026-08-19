"use client";

import Image from "next/image";
import { IconCheck } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const CHECK_KEYS = [
  "feature28Check1",
  "feature28Check2",
  "feature28Check3",
] as const;

const IMAGES = [
  {
    src: "https://picsum.photos/seed/feature28-a/640/480",
    altKey: "feature28Image1Alt",
    width: 640,
    height: 480,
  },
  {
    src: "https://picsum.photos/seed/feature28-b/480/360",
    altKey: "feature28Image2Alt",
    width: 480,
    height: 360,
  },
] as const;

export function ImagePairColumnsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-5">
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature28Heading}
            </h2>
            <p className="text-muted leading-relaxed">{f.feature28Intro}</p>
            <ul className="flex flex-col gap-3">
              {CHECK_KEYS.map((checkKey) => (
                <li key={checkKey} className="flex items-start gap-2.5">
                  <span className="bg-success/10 text-success mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
                    <IconCheck size={12} aria-hidden="true" />
                  </span>
                  <span className="text-muted text-sm">{f[checkKey]}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative pr-10 pb-10">
            <div className="border-border bg-surface overflow-hidden rounded-lg border shadow-md">
              <Image
                src={IMAGES[0].src}
                alt={f[IMAGES[0].altKey]}
                width={IMAGES[0].width}
                height={IMAGES[0].height}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="border-border bg-surface absolute right-0 bottom-0 w-2/5 overflow-hidden rounded-lg border shadow-md">
              <Image
                src={IMAGES[1].src}
                alt={f[IMAGES[1].altKey]}
                width={IMAGES[1].width}
                height={IMAGES[1].height}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
