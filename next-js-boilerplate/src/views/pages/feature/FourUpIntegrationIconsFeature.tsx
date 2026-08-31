"use client";

import Image from "next/image";
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const ICONS = [
  { id: "i1", nameKey: "feature159Icon1" },
  { id: "i2", nameKey: "feature159Icon2" },
  { id: "i3", nameKey: "feature159Icon3" },
  { id: "i4", nameKey: "feature159Icon4" },
] as const;

export function FourUpIntegrationIconsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="border-border bg-surface flex flex-col gap-8 rounded-2xl border p-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-6">
            {ICONS.map((icon) => (
              <div key={icon.id} className="flex flex-col items-center gap-2">
                <span className="border-border bg-bg flex size-12 items-center justify-center rounded-xl border">
                  <Image
                    src="/img/placeholders/ph-1x1-4.webp"
                    alt=""
                    aria-hidden="true"
                    width={24}
                    height={24}
                    className="size-6 rounded-sm object-cover"
                  />
                </span>
                <span className="text-muted text-xs">{f[icon.nameKey]}</span>
              </div>
            ))}
          </div>
          <Link
            href="#"
            className="text-brand inline-flex shrink-0 items-center gap-1.5 text-sm font-medium hover:underline"
          >
            {f.feature159Link}
            <IconArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
