"use client";

import Image from "next/image";
import { IconArrowUpRight } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithBentoMessages } from "@/types/pages/bento/BentoMessages-types";

const LINK_URL = "https://example.com" as const;

type CellKind = "text" | "image";

interface Cell {
  id: string;
  kind: CellKind;
  spanClass: string;
  seed?: string;
  altKey?: string;
  categoryKey: string;
  titleKey: string;
  bodyKey?: string;
}

const CELLS: Cell[] = [
  {
    id: "cell-1",
    kind: "text",
    spanClass: "sm:col-span-2 lg:col-span-2",
    categoryKey: "bento6Cell1Category",
    titleKey: "bento6Cell1Title",
    bodyKey: "bento6Cell1Body",
  },
  {
    id: "cell-2",
    kind: "image",
    spanClass: "sm:col-span-2 lg:col-span-1 lg:row-span-2",
    seed: "bento-editorial-craft",
    altKey: "bento6Cell2Alt",
    categoryKey: "bento6Cell2Category",
    titleKey: "bento6Cell2Title",
  },
  {
    id: "cell-3",
    kind: "text",
    spanClass: "",
    categoryKey: "bento6Cell3Category",
    titleKey: "bento6Cell3Title",
    bodyKey: "bento6Cell3Body",
  },
  {
    id: "cell-4",
    kind: "image",
    spanClass: "",
    seed: "bento-editorial-team",
    altKey: "bento6Cell4Alt",
    categoryKey: "bento6Cell4Category",
    titleKey: "bento6Cell4Title",
  },
];

export function EditorialTextImageBento() {
  const t = useMessages("pages") as unknown as PagesWithBentoMessages;
  const b = t.bento;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {b.bento6Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {b.bento6Heading}
          </h2>
          <p className="text-muted leading-relaxed">{b.bento6Intro}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CELLS.map((cell) => {
            if (cell.kind === "text") {
              return (
                <div
                  key={cell.id}
                  className={cn(
                    "border-border bg-surface flex h-full flex-col justify-between gap-6 rounded-xl border p-6 @sm:p-8",
                    cell.spanClass,
                  )}
                >
                  <Badge variant="outline" size="sm" className="w-fit">
                    {b[cell.categoryKey]}
                  </Badge>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-fg text-xl font-semibold tracking-tight">
                      {b[cell.titleKey]}
                    </h3>
                    {cell.bodyKey ? (
                      <p className="text-muted text-sm leading-relaxed">
                        {b[cell.bodyKey]}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            }

            return (
              <a
                key={cell.id}
                href={LINK_URL}
                className={cn(
                  "group relative flex min-h-64 flex-col justify-end overflow-hidden rounded-xl",
                  cell.spanClass,
                )}
              >
                <Image
                  src={placeholderImage(cell.seed ?? cell.id, "3x4")}
                  alt={cell.altKey ? b[cell.altKey] : ""}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div
                  aria-hidden="true"
                  className="from-fg/90 absolute inset-0 bg-gradient-to-t via-transparent to-transparent"
                />
                <div className="relative flex flex-col gap-1.5 p-5 @sm:p-6">
                  <span className="text-bg/70 text-xs font-medium tracking-wide uppercase">
                    {b[cell.categoryKey]}
                  </span>
                  <span className="text-bg inline-flex items-center gap-1.5 text-base font-semibold">
                    {b[cell.titleKey]}
                    <IconArrowUpRight
                      size={16}
                      aria-hidden="true"
                      className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
