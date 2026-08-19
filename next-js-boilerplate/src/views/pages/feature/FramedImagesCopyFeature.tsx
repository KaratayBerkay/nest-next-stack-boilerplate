"use client";

import Image from "next/image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const MAIN_IMAGE_SRC =
  "https://picsum.photos/seed/feature30-main/800/600" as const;
const NESTED_IMAGE_SRC =
  "https://picsum.photos/seed/feature30-nested/600/450" as const;
const MAIN_IMAGE_SIZES = "(max-width: 1024px) 100vw, 50vw";
const NESTED_IMAGE_SIZES = "(max-width: 1024px) 60vw, 30vw";

export function FramedImagesCopyFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-5">
            <span className="border-border bg-bg text-muted rounded-full border px-3 py-1 text-xs font-medium">
              {f.feature30Eyebrow}
            </span>
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature30Heading}
            </h2>
            <p className="text-muted leading-relaxed">{f.feature30Paragraph}</p>
          </div>
          <div className="relative pb-10 pl-10">
            <div className="border-border bg-surface rounded-xl border p-2 shadow-md">
              <Image
                src={MAIN_IMAGE_SRC}
                alt={f.feature30Image1Alt}
                width={800}
                height={600}
                sizes={MAIN_IMAGE_SIZES}
                className="h-auto w-full rounded-lg object-cover"
              />
            </div>
            <div className="border-border bg-surface absolute bottom-0 left-0 w-2/3 rounded-lg border p-2 shadow-sm">
              <Image
                src={NESTED_IMAGE_SRC}
                alt={f.feature30Image2Alt}
                width={600}
                height={450}
                sizes={NESTED_IMAGE_SIZES}
                className="h-auto w-full rounded-md object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
