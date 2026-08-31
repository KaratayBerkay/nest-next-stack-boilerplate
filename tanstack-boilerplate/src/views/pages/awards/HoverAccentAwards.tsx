"use client";

import {
  IconAward,
  IconCrown,
  IconMedal,
  IconStar,
  IconTrophy,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithAwardsMessages } from "@/types/pages/awards/AwardsMessages-types";

interface AwardRow {
  id: string;
  icon: typeof IconTrophy;
  titleKey: string;
  issuerKey: string;
  yearKey: string;
}

const ROWS: AwardRow[] = [
  {
    id: "row-1",
    icon: IconTrophy,
    titleKey: "awards3Row1Title",
    issuerKey: "awards3Row1Issuer",
    yearKey: "awards3Row1Year",
  },
  {
    id: "row-2",
    icon: IconMedal,
    titleKey: "awards3Row2Title",
    issuerKey: "awards3Row2Issuer",
    yearKey: "awards3Row2Year",
  },
  {
    id: "row-3",
    icon: IconAward,
    titleKey: "awards3Row3Title",
    issuerKey: "awards3Row3Issuer",
    yearKey: "awards3Row3Year",
  },
  {
    id: "row-4",
    icon: IconStar,
    titleKey: "awards3Row4Title",
    issuerKey: "awards3Row4Issuer",
    yearKey: "awards3Row4Year",
  },
  {
    id: "row-5",
    icon: IconCrown,
    titleKey: "awards3Row5Title",
    issuerKey: "awards3Row5Issuer",
    yearKey: "awards3Row5Year",
  },
];

export function HoverAccentAwards() {
  const t = useMessages("pages") as unknown as PagesWithAwardsMessages;
  const a = t.awards;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-3xl flex-col px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-start gap-3">
          <span className="border-border text-fg inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-widest uppercase">
            {a.awards3Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-medium tracking-tighter md:text-4xl">
            {a.awards3Heading}
          </h2>
          <p className="text-muted">{a.awards3Description}</p>
        </div>

        <div className="flex flex-col gap-1">
          {ROWS.map((row) => (
            <div
              key={row.id}
              className="group relative flex items-center gap-4 rounded-xl border border-transparent px-4 py-4 transition-colors hover:bg-surface"
            >
              <span
                className="bg-brand absolute inset-y-2 left-0 w-1 scale-y-0 rounded-full transition-transform duration-200 group-hover:scale-y-100"
                aria-hidden="true"
              />
              <span className="bg-brand/10 text-brand flex size-11 shrink-0 items-center justify-center rounded-full">
                <row.icon size={20} aria-hidden="true" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-fg text-base font-semibold">
                  {a[row.titleKey]}
                </span>
                <span className="text-muted text-sm">{a[row.issuerKey]}</span>
              </div>
              <span className="text-muted shrink-0 text-sm tabular-nums">
                {a[row.yearKey]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
