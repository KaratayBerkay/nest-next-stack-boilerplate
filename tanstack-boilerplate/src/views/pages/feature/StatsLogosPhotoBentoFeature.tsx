"use client";

import Image from "next/image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

export function StatsLogosPhotoBentoFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="border-border bg-surface flex flex-col justify-center gap-1 rounded-xl border p-6">
            <span className="text-fg text-4xl font-semibold tracking-tight">
              {f.feature34StatValue}
            </span>
            <span className="text-muted text-sm">{f.feature34StatLabel}</span>
          </div>
          <div className="border-border bg-surface overflow-hidden rounded-xl border md:row-span-2">
            <Image
              src="/img/placeholders/ph-3x4-1.webp"
              alt={f.feature34ImageAlt}
              width={400}
              height={533}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="border-border bg-surface flex flex-col gap-3 rounded-xl border p-6">
            <h3 className="text-fg text-sm font-semibold">
              {f.feature34LogosTitle}
            </h3>
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3].map((index) => (
                <span
                  key={index}
                  className="bg-muted/15 flex size-9 items-center justify-center rounded-md"
                >
                  <Image
                    src="/img/placeholders/ph-1x1-6.webp"
                    alt=""
                    aria-hidden="true"
                    width={20}
                    height={20}
                    className="size-5 rounded-sm object-cover"
                  />
                </span>
              ))}
            </div>
          </div>
          <div className="border-border bg-surface flex flex-col justify-center gap-2 rounded-xl border p-6 md:col-span-2">
            <h3 className="text-fg text-sm font-semibold">
              {f.feature34TextTitle}
            </h3>
            <p className="text-muted text-sm leading-relaxed">
              {f.feature34TextBody}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
