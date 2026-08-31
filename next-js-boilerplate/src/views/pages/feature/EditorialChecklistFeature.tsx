"use client";

import Image from "next/image";
import { IconCheck } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const CHECK_KEYS = [
  "feature58Check1",
  "feature58Check2",
  "feature58Check3",
] as const;

export function EditorialChecklistFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="border-border bg-surface rounded-2xl border p-3">
            <Image
              src="/img/placeholders/ph-4x5-1.webp"
              alt={f.feature58ImageAlt}
              width={600}
              height={750}
              className="aspect-[4/5] w-full rounded-xl object-cover"
            />
          </div>
          <div className="flex flex-col items-start gap-5">
            <span className="text-brand text-xs font-semibold tracking-wide uppercase">
              {f.feature58Eyebrow}
            </span>
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature58Heading}
            </h2>
            <p className="text-muted leading-relaxed">{f.feature58Body}</p>
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
        </div>
      </div>
    </section>
  );
}
