"use client";

import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const DOT_GRID_STYLE = {
  backgroundImage:
    "radial-gradient(color-mix(in srgb, var(--fg) 8%, transparent) 1px, transparent 1px)",
  backgroundSize: "20px 20px",
} as const;

const LINKS = [
  { id: "product", labelKey: "feature35Link1" },
  { id: "solutions", labelKey: "feature35Link2" },
  { id: "resources", labelKey: "feature35Link3" },
] as const;

export function LargeGridArrowLinksFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="bg-surface relative w-full overflow-hidden py-16 lg:py-24">
      <div aria-hidden="true" className="absolute inset-0" style={DOT_GRID_STYLE} />
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-end gap-8 lg:grid-cols-2">
          <h2 className="text-fg text-4xl font-semibold tracking-tight lg:text-5xl">
            {f.feature35Heading}
          </h2>
          <div className="flex flex-col gap-3">
            {LINKS.map((link) => (
              <Link
                key={link.id}
                href="#"
                className="border-border bg-bg group flex items-center justify-between rounded-lg border px-5 py-4"
              >
                <span className="text-fg text-sm font-medium">
                  {f[link.labelKey]}
                </span>
                <IconArrowRight
                  size={16}
                  className="text-brand shrink-0 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
