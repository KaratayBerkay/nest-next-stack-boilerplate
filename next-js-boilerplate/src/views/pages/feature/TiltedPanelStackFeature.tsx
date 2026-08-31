"use client";

import Image from "next/image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const PANELS = [
  {
    id: "capture",
    tilt: "-rotate-2",
    backSrc: "/img/placeholders/ph-3x4-0.webp",
    frontSrc: "/img/placeholders/ph-3x4-1.webp",
    titleKey: "feature270Panel1Title",
    bodyKey: "feature270Panel1Body",
    altKey: "feature270Panel1ImageAlt",
  },
  {
    id: "curate",
    tilt: "rotate-2",
    backSrc: "/img/placeholders/ph-3x4-2.webp",
    frontSrc: "/img/placeholders/ph-3x4-3.webp",
    titleKey: "feature270Panel2Title",
    bodyKey: "feature270Panel2Body",
    altKey: "feature270Panel2ImageAlt",
  },
  {
    id: "share",
    tilt: "-rotate-2",
    backSrc: "/img/placeholders/ph-3x4-5.webp",
    frontSrc: "/img/placeholders/ph-3x4-6.webp",
    titleKey: "feature270Panel3Title",
    bodyKey: "feature270Panel3Body",
    altKey: "feature270Panel3ImageAlt",
  },
] as const;

export function TiltedPanelStackFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature270Heading}
          </h2>
          <p className="text-muted mx-auto max-w-xl">{f.feature270Intro}</p>
        </div>
        <div className="mt-16 grid gap-x-8 gap-y-16 sm:grid-cols-3">
          {PANELS.map((panel) => (
            <div key={panel.id} className="flex flex-col items-center gap-5">
              <div className="relative aspect-[3/4] w-2/3">
                <Image
                  src={panel.backSrc}
                  alt=""
                  aria-hidden="true"
                  width={300}
                  height={400}
                  className={`border-border bg-surface absolute inset-0 rounded-lg border object-cover opacity-60 ${panel.tilt}`}
                />
                <Image
                  src={panel.frontSrc}
                  alt={f[panel.altKey]}
                  width={300}
                  height={400}
                  className="border-border bg-surface relative rounded-lg border object-cover shadow-md"
                />
              </div>
              <div className="flex flex-col items-center gap-1.5 text-center">
                <h3 className="text-fg text-base font-semibold">
                  {f[panel.titleKey]}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {f[panel.bodyKey]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
