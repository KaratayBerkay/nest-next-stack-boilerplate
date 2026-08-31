"use client";

import { useState } from "react";
import Image from "next/image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithAwardsMessages } from "@/types/pages/awards/AwardsMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

interface AwardItem {
  id: string;
  seed: string;
  titleKey: string;
  issuerKey: string;
  yearKey: string;
}

const ITEMS: AwardItem[] = [
  {
    id: "item-1",
    seed: "awards5-1",
    titleKey: "awards5Item1Title",
    issuerKey: "awards5Item1Issuer",
    yearKey: "awards5Item1Year",
  },
  {
    id: "item-2",
    seed: "awards5-2",
    titleKey: "awards5Item2Title",
    issuerKey: "awards5Item2Issuer",
    yearKey: "awards5Item2Year",
  },
  {
    id: "item-3",
    seed: "awards5-3",
    titleKey: "awards5Item3Title",
    issuerKey: "awards5Item3Issuer",
    yearKey: "awards5Item3Year",
  },
  {
    id: "item-4",
    seed: "awards5-4",
    titleKey: "awards5Item4Title",
    issuerKey: "awards5Item4Issuer",
    yearKey: "awards5Item4Year",
  },
  {
    id: "item-5",
    seed: "awards5-5",
    titleKey: "awards5Item5Title",
    issuerKey: "awards5Item5Issuer",
    yearKey: "awards5Item5Year",
  },
];

export function PointerPreviewAwards() {
  const t = useMessages("pages") as unknown as PagesWithAwardsMessages;
  const a = t.awards;

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const hovered = ITEMS.find((item) => item.id === hoveredId) ?? null;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="relative mx-auto flex max-w-3xl flex-col px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-3">
          <p className="text-brand text-xs font-semibold tracking-widest uppercase">
            {a.awards5Eyebrow}
          </p>
          <h2 className="text-fg text-3xl font-medium tracking-tighter md:text-4xl">
            {a.awards5Heading}
          </h2>
          <p className="text-muted">{a.awards5Description}</p>
        </div>

        <div
          className="border-border divide-border divide-y border-t"
          onMouseLeave={() => setHoveredId(null)}
        >
          {ITEMS.map((item) => (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
              className="flex cursor-default items-baseline justify-between gap-6 py-6 transition-colors"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <span
                  className={`text-fg text-xl font-semibold transition-opacity sm:text-2xl ${
                    hoveredId && hoveredId !== item.id
                      ? "opacity-40"
                      : "opacity-100"
                  }`}
                >
                  {a[item.titleKey]}
                </span>
                <span className="text-muted text-sm">{a[item.issuerKey]}</span>
              </div>
              <span className="text-muted shrink-0 text-sm tabular-nums">
                {a[item.yearKey]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {hovered && (
        <div
          className="border-border bg-bg pointer-events-none fixed z-50 hidden overflow-hidden rounded-2xl border shadow-lg sm:block"
          style={{
            left: pos.x + 28,
            top: pos.y - 76,
            width: 176,
            height: 128,
          }}
          aria-hidden="true"
        >
          <Image
            src={placeholderImage(hovered.seed, "3x2")}
            alt={a.awards5PreviewAlt}
            fill
            sizes="176px"
            className="object-cover"
          />
        </div>
      )}
    </section>
  );
}
