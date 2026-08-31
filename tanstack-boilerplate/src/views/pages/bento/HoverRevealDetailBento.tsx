"use client";

import { useState } from "react";
import {
  IconChevronDown,
  IconDatabase,
  IconGauge,
  IconPuzzle,
  IconShieldCheck,
  IconWand,
  IconWebhook,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithBentoMessages } from "@/types/pages/bento/BentoMessages-types";

interface RevealTile {
  id: string;
  icon: Icon;
  spanClass: string;
  titleKey: string;
  summaryKey: string;
  detailKey: string;
}

const TILES: RevealTile[] = [
  {
    id: "reveal-1",
    icon: IconWand,
    spanClass: "sm:col-span-2 lg:col-span-2",
    titleKey: "bento4Tile1Title",
    summaryKey: "bento4Tile1Summary",
    detailKey: "bento4Tile1Detail",
  },
  {
    id: "reveal-2",
    icon: IconGauge,
    spanClass: "",
    titleKey: "bento4Tile2Title",
    summaryKey: "bento4Tile2Summary",
    detailKey: "bento4Tile2Detail",
  },
  {
    id: "reveal-3",
    icon: IconShieldCheck,
    spanClass: "",
    titleKey: "bento4Tile3Title",
    summaryKey: "bento4Tile3Summary",
    detailKey: "bento4Tile3Detail",
  },
  {
    id: "reveal-4",
    icon: IconWebhook,
    spanClass: "",
    titleKey: "bento4Tile4Title",
    summaryKey: "bento4Tile4Summary",
    detailKey: "bento4Tile4Detail",
  },
  {
    id: "reveal-5",
    icon: IconPuzzle,
    spanClass: "",
    titleKey: "bento4Tile5Title",
    summaryKey: "bento4Tile5Summary",
    detailKey: "bento4Tile5Detail",
  },
  {
    id: "reveal-6",
    icon: IconDatabase,
    spanClass: "",
    titleKey: "bento4Tile6Title",
    summaryKey: "bento4Tile6Summary",
    detailKey: "bento4Tile6Detail",
  },
];

export function HoverRevealDetailBento() {
  const t = useMessages("pages") as unknown as PagesWithBentoMessages;
  const b = t.bento;
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {b.bento4Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {b.bento4Heading}
          </h2>
          <p className="text-muted leading-relaxed">{b.bento4Intro}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TILES.map((tile) => {
            const isOpen = tile.id === openId;
            return (
              <div
                key={tile.id}
                className={cn(
                  "border-border bg-bg group rounded-xl border transition-shadow duration-200",
                  isOpen ? "shadow-md" : "hover:shadow-sm",
                  tile.spanClass,
                )}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenId(isOpen ? null : tile.id)}
                  className="flex w-full flex-col gap-3 p-5 text-left @sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="border-border bg-surface flex size-10 shrink-0 items-center justify-center rounded-lg border">
                      <tile.icon
                        size={18}
                        aria-hidden="true"
                        className="text-fg"
                      />
                    </span>
                    <IconChevronDown
                      size={16}
                      aria-hidden="true"
                      className={cn(
                        "text-muted mt-1.5 shrink-0 transition-transform duration-200",
                        isOpen ? "rotate-180" : "rotate-0",
                      )}
                    />
                  </div>
                  <h3 className="text-fg text-sm font-semibold">
                    {b[tile.titleKey]}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed">
                    {b[tile.summaryKey]}
                  </p>
                  <div
                    className={cn(
                      "grid transition-[grid-template-rows] duration-200 ease-out",
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0",
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="border-border text-muted mt-3 border-t pt-3 text-sm leading-relaxed">
                        {b[tile.detailKey]}
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
