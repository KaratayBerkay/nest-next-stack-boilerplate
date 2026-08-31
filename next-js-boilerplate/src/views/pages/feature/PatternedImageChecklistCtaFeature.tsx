"use client";

import Image from "next/image";
import Link from "next/link";
import { IconCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const CHECK_KEYS = [
  "feature124Check1",
  "feature124Check2",
  "feature124Check3",
] as const;
const DOT_PATTERN_STYLE = {
  backgroundImage:
    "radial-gradient(color-mix(in srgb, var(--bg) 70%, transparent) 1.5px, transparent 1.5px)",
  backgroundSize: "10px 10px",
} as const;

export function PatternedImageChecklistCtaFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-5">
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature124Heading}
            </h2>
            <ul className="flex flex-col gap-3">
              {CHECK_KEYS.map((key) => (
                <li key={key} className="flex items-start gap-2.5">
                  <span className="bg-brand/10 text-brand mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full">
                    <IconCheck size={14} aria-hidden="true" />
                  </span>
                  <span className="text-fg text-sm">{f[key]}</span>
                </li>
              ))}
            </ul>
            <Button asChild variant="primary" className="mt-2">
              <Link href="#">{f.feature124Button}</Link>
            </Button>
          </div>
          <div className="relative overflow-hidden rounded-xl">
            <Image
              src="/img/placeholders/ph-3x4-2.webp"
              alt={f.feature124ImageAlt}
              width={480}
              height={640}
              className="aspect-[3/4] w-full object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={DOT_PATTERN_STYLE}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
