"use client";

import { IconCalendar } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithAwardsMessages } from "@/types/pages/awards/AwardsMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

type AwardRank = "winner" | "finalist" | "honorable-mention";

interface AwardRow {
  id: string;
  seed: string;
  initials: string;
  orgNameKey: string;
  titleKey: string;
  dateKey: string;
  rankKey: string;
  rank: AwardRank;
}

const RANK_BADGE_VARIANT: Record<
  AwardRank,
  "default" | "secondary" | "outline"
> = {
  winner: "default",
  finalist: "secondary",
  "honorable-mention": "outline",
};

const ROWS: AwardRow[] = [
  {
    id: "row-1",
    seed: "awards4-cloudframe",
    initials: "CL",
    orgNameKey: "awards4Row1OrgName",
    titleKey: "awards4Row1Title",
    dateKey: "awards4Row1Date",
    rankKey: "awards4Row1Rank",
    rank: "winner",
  },
  {
    id: "row-2",
    seed: "awards4-pixelguild",
    initials: "PG",
    orgNameKey: "awards4Row2OrgName",
    titleKey: "awards4Row2Title",
    dateKey: "awards4Row2Date",
    rankKey: "awards4Row2Rank",
    rank: "winner",
  },
  {
    id: "row-3",
    seed: "awards4-northwind",
    initials: "NA",
    orgNameKey: "awards4Row3OrgName",
    titleKey: "awards4Row3Title",
    dateKey: "awards4Row3Date",
    rankKey: "awards4Row3Rank",
    rank: "finalist",
  },
  {
    id: "row-4",
    seed: "awards4-brightpath",
    initials: "BP",
    orgNameKey: "awards4Row4OrgName",
    titleKey: "awards4Row4Title",
    dateKey: "awards4Row4Date",
    rankKey: "awards4Row4Rank",
    rank: "honorable-mention",
  },
  {
    id: "row-5",
    seed: "awards4-vertex",
    initials: "VV",
    orgNameKey: "awards4Row5OrgName",
    titleKey: "awards4Row5Title",
    dateKey: "awards4Row5Date",
    rankKey: "awards4Row5Rank",
    rank: "winner",
  },
];

export function LogoDateAwards() {
  const t = useMessages("pages") as unknown as PagesWithAwardsMessages;
  const a = t.awards;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-4xl flex-col px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-3">
          <p className="text-brand text-xs font-semibold tracking-widest uppercase">
            {a.awards4Eyebrow}
          </p>
          <h2 className="text-fg text-3xl font-medium tracking-tighter md:text-4xl">
            {a.awards4Heading}
          </h2>
          <p className="text-muted max-w-xl">{a.awards4Description}</p>
        </div>

        <div className="border-border bg-surface divide-border divide-y overflow-hidden rounded-2xl border">
          {ROWS.map((row) => (
            <div key={row.id} className="flex items-center gap-4 p-5 sm:p-6">
              <Avatar
                src={placeholderImage(row.seed, "1x1")}
                alt={a[row.orgNameKey]}
                fallback={row.initials}
                size="lg"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-fg text-base font-semibold">
                  {a[row.titleKey]}
                </span>
                <span className="text-muted flex items-center gap-1.5 text-sm">
                  <IconCalendar
                    size={14}
                    className="shrink-0"
                    aria-hidden="true"
                  />
                  <span className="truncate">
                    {a[row.orgNameKey]} · {a[row.dateKey]}
                  </span>
                </span>
              </div>
              <Badge
                variant={RANK_BADGE_VARIANT[row.rank]}
                size="sm"
                className="shrink-0"
              >
                {a[row.rankKey]}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
