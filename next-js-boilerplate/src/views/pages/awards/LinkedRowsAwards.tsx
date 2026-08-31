"use client";

import Link from "next/link";
import { IconArrowUpRight } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithAwardsMessages } from "@/types/pages/awards/AwardsMessages-types";

interface AwardRow {
  id: string;
  titleKey: string;
  issuerKey: string;
  yearKey: string;
  categoryKey: string;
}

const LINK_URL = "#" as const;

const ROWS: AwardRow[] = [
  {
    id: "row-1",
    titleKey: "awards1Row1Title",
    issuerKey: "awards1Row1Issuer",
    yearKey: "awards1Row1Year",
    categoryKey: "awards1Row1Category",
  },
  {
    id: "row-2",
    titleKey: "awards1Row2Title",
    issuerKey: "awards1Row2Issuer",
    yearKey: "awards1Row2Year",
    categoryKey: "awards1Row2Category",
  },
  {
    id: "row-3",
    titleKey: "awards1Row3Title",
    issuerKey: "awards1Row3Issuer",
    yearKey: "awards1Row3Year",
    categoryKey: "awards1Row3Category",
  },
  {
    id: "row-4",
    titleKey: "awards1Row4Title",
    issuerKey: "awards1Row4Issuer",
    yearKey: "awards1Row4Year",
    categoryKey: "awards1Row4Category",
  },
  {
    id: "row-5",
    titleKey: "awards1Row5Title",
    issuerKey: "awards1Row5Issuer",
    yearKey: "awards1Row5Year",
    categoryKey: "awards1Row5Category",
  },
];

export function LinkedRowsAwards() {
  const t = useMessages("pages") as unknown as PagesWithAwardsMessages;
  const a = t.awards;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-4xl flex-col px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-3">
          <p className="text-brand text-xs font-semibold tracking-widest uppercase">
            {a.awards1Eyebrow}
          </p>
          <h2 className="text-fg text-3xl font-medium tracking-tighter md:text-4xl">
            {a.awards1Heading}
          </h2>
          <p className="text-muted max-w-xl">{a.awards1Description}</p>
        </div>

        <div className="border-border divide-border divide-y border-t">
          {ROWS.map((row) => (
            <Link
              key={row.id}
              href={LINK_URL}
              className="group hover:bg-surface-hover flex items-center justify-between gap-6 py-5 transition-colors sm:py-6"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-fg truncate text-base font-semibold sm:text-lg">
                  {a[row.titleKey]}
                </span>
                <span className="text-muted text-sm">{a[row.issuerKey]}</span>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <Badge
                  variant="outline"
                  size="sm"
                  className="hidden sm:inline-flex"
                >
                  {a[row.categoryKey]}
                </Badge>
                <span className="text-muted text-sm tabular-nums">
                  {a[row.yearKey]}
                </span>
                <IconArrowUpRight
                  size={18}
                  className="text-muted group-hover:text-fg shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
