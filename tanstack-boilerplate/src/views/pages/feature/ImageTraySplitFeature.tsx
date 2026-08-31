"use client";

import Image from "next/image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const TRAY_IMAGES = [
  { id: "t1", src: "/img/placeholders/ph-1x1-0.webp", altKey: "feature86Tray1Alt", rotate: "-rotate-6", z: "z-10" },
  { id: "t2", src: "/img/placeholders/ph-1x1-2.webp", altKey: "feature86Tray2Alt", rotate: "rotate-3", z: "z-20" },
  { id: "t3", src: "/img/placeholders/ph-1x1-4.webp", altKey: "feature86Tray3Alt", rotate: "-rotate-2", z: "z-30" },
] as const;

export function ImageTraySplitFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-5">
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature86Heading}
            </h2>
            <p className="text-muted leading-relaxed">{f.feature86Body}</p>
          </div>
          <div className="flex items-center justify-center -space-x-8 py-6">
            {TRAY_IMAGES.map((img) => (
              <Image
                key={img.id}
                src={img.src}
                alt={f[img.altKey]}
                width={160}
                height={160}
                className={`border-bg bg-surface size-28 shrink-0 rounded-2xl border-4 object-cover shadow-lg sm:size-36 ${img.rotate} ${img.z}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
