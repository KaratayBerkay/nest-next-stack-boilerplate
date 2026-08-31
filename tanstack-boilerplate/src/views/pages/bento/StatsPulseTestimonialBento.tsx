"use client";

import { IconQuote, IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithBentoMessages } from "@/types/pages/bento/BentoMessages-types";

interface StatTile {
  id: string;
  labelKey: string;
  valueKey: string;
  deltaKey: string;
  trend: "up" | "down";
}

const STAT_TILES: StatTile[] = [
  {
    id: "stat-1",
    labelKey: "bento2Stat1Label",
    valueKey: "bento2Stat1Value",
    deltaKey: "bento2Stat1Delta",
    trend: "up",
  },
  {
    id: "stat-2",
    labelKey: "bento2Stat2Label",
    valueKey: "bento2Stat2Value",
    deltaKey: "bento2Stat2Delta",
    trend: "up",
  },
  {
    id: "stat-3",
    labelKey: "bento2Stat3Label",
    valueKey: "bento2Stat3Value",
    deltaKey: "bento2Stat3Delta",
    trend: "down",
  },
  {
    id: "stat-4",
    labelKey: "bento2Stat4Label",
    valueKey: "bento2Stat4Value",
    deltaKey: "bento2Stat4Delta",
    trend: "up",
  },
];

export function StatsPulseTestimonialBento() {
  const t = useMessages("pages") as unknown as PagesWithBentoMessages;
  const b = t.bento;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {b.bento2Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {b.bento2Heading}
          </h2>
          <p className="text-muted leading-relaxed">{b.bento2Intro}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAT_TILES.slice(0, 2).map((stat) => (
            <Card key={stat.id} variant="default">
              <div className="flex h-full flex-col gap-3 p-5 @sm:p-6">
                <p className="text-muted text-xs font-medium tracking-wide uppercase">
                  {b[stat.labelKey]}
                </p>
                <p className="text-fg text-3xl font-semibold tracking-tight">
                  {b[stat.valueKey]}
                </p>
                <span
                  className={
                    stat.trend === "up"
                      ? "text-success inline-flex w-fit items-center gap-1 text-xs font-medium"
                      : "text-error inline-flex w-fit items-center gap-1 text-xs font-medium"
                  }
                >
                  {stat.trend === "up" ? (
                    <IconTrendingUp size={14} aria-hidden="true" />
                  ) : (
                    <IconTrendingDown size={14} aria-hidden="true" />
                  )}
                  {b[stat.deltaKey]}
                </span>
              </div>
            </Card>
          ))}

          <Card
            variant="default"
            className="sm:col-span-2 lg:col-span-2 lg:row-span-2"
          >
            <div className="flex h-full flex-col justify-between gap-6 p-6 @sm:p-8">
              <IconQuote size={28} aria-hidden="true" className="text-brand" />
              <p className="text-fg text-lg leading-relaxed font-medium lg:text-xl">
                {b.bento2QuoteBody}
              </p>
              <div className="flex items-center gap-3">
                <Avatar fallback={b.bento2QuoteInitials} size="md" variant="brand" />
                <div className="min-w-0">
                  <p className="text-fg truncate text-sm font-semibold">
                    {b.bento2QuoteName}
                  </p>
                  <p className="text-muted truncate text-xs">{b.bento2QuoteRole}</p>
                </div>
                <Badge variant="soft" size="sm" className="ml-auto shrink-0">
                  {b.bento2QuoteBadge}
                </Badge>
              </div>
            </div>
          </Card>

          {STAT_TILES.slice(2, 4).map((stat) => (
            <Card key={stat.id} variant="default">
              <div className="flex h-full flex-col gap-3 p-5 @sm:p-6">
                <p className="text-muted text-xs font-medium tracking-wide uppercase">
                  {b[stat.labelKey]}
                </p>
                <p className="text-fg text-3xl font-semibold tracking-tight">
                  {b[stat.valueKey]}
                </p>
                <span
                  className={
                    stat.trend === "up"
                      ? "text-success inline-flex w-fit items-center gap-1 text-xs font-medium"
                      : "text-error inline-flex w-fit items-center gap-1 text-xs font-medium"
                  }
                >
                  {stat.trend === "up" ? (
                    <IconTrendingUp size={14} aria-hidden="true" />
                  ) : (
                    <IconTrendingDown size={14} aria-hidden="true" />
                  )}
                  {b[stat.deltaKey]}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
