"use client";

import Image from "next/image";
import { IconCheck } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const CHECK_KEYS = [
  "feature268Check1",
  "feature268Check2",
  "feature268Check3",
] as const;

export function TiltedCardChecklistFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-5">
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature268Heading}
            </h2>
            <p className="text-muted leading-relaxed">{f.feature268Body}</p>
            <ul className="mt-2 flex flex-col gap-3">
              {CHECK_KEYS.map((key) => (
                <li key={key} className="flex items-start gap-2.5">
                  <span className="bg-brand/10 text-brand mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full">
                    <IconCheck size={14} aria-hidden="true" />
                  </span>
                  <span className="text-fg text-sm">{f[key]}</span>
                </li>
              ))}
            </ul>
          </div>
          <div
            className="flex justify-center py-6"
            style={{ perspective: "1200px" }}
          >
            <div
              className="border-border bg-surface w-full max-w-sm overflow-hidden rounded-2xl border shadow-2xl"
              style={{ transform: "rotateY(-14deg) rotateX(4deg)" }}
            >
              <Image
                src="/img/placeholders/ph-4x5-3.webp"
                alt={f.feature268ImageAlt}
                width={400}
                height={500}
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
