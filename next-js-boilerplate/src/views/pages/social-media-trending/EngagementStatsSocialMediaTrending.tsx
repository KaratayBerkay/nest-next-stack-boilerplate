"use client";

import { useState } from "react";
import {
  IconHeart,
  IconMessageCircle,
  IconShare,
  IconTrendingDown,
  IconTrendingUp,
  IconUserPlus,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSocialMediaTrendingMessages } from "@/types/pages/social-media-trending/SocialMediaTrendingMessages-types";

type Range = "week" | "month";

interface EngagementStat {
  id: string;
  icon: Icon;
  labelKey: string;
  week: number;
  month: number;
  deltaWeek: number;
  deltaMonth: number;
}

const STATS: EngagementStat[] = [
  {
    id: "likes",
    icon: IconHeart,
    labelKey: "socialMediaTrending8StatLikesLabel",
    week: 12840,
    month: 58230,
    deltaWeek: 8.4,
    deltaMonth: 21.7,
  },
  {
    id: "comments",
    icon: IconMessageCircle,
    labelKey: "socialMediaTrending8StatCommentsLabel",
    week: 1965,
    month: 8710,
    deltaWeek: -3.1,
    deltaMonth: 12.2,
  },
  {
    id: "shares",
    icon: IconShare,
    labelKey: "socialMediaTrending8StatSharesLabel",
    week: 742,
    month: 3305,
    deltaWeek: 15.6,
    deltaMonth: 44.9,
  },
  {
    id: "followers",
    icon: IconUserPlus,
    labelKey: "socialMediaTrending8StatFollowersLabel",
    week: 318,
    month: 1490,
    deltaWeek: 4.9,
    deltaMonth: -2.4,
  },
];

const PLATFORM_BREAKDOWN: { id: string; labelKey: string; percent: number }[] =
  [
    { id: "x", labelKey: "socialMediaTrending8PlatformXLabel", percent: 38 },
    {
      id: "instagram",
      labelKey: "socialMediaTrending8PlatformInstagramLabel",
      percent: 41,
    },
    {
      id: "tiktok",
      labelKey: "socialMediaTrending8PlatformTiktokLabel",
      percent: 21,
    },
  ];

export function EngagementStatsSocialMediaTrending() {
  const m = useMessages(
    "pages",
  ) as unknown as PagesWithSocialMediaTrendingMessages;
  const smt = m.socialMediaTrending;
  const [range, setRange] = useState<Range>("week");

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Badge variant="soft" pill size="sm" className="w-fit">
              {smt.socialMediaTrending8Badge}
            </Badge>
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {smt.socialMediaTrending8Heading}
            </h2>
            <p className="text-muted max-w-xl text-sm">
              {smt.socialMediaTrending8Subheading}
            </p>
          </div>
          <div className="bg-surface inline-flex items-center gap-1 rounded-lg p-1 shadow-xs">
            <button
              type="button"
              onClick={() => setRange("week")}
              aria-pressed={range === "week"}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                range === "week"
                  ? "bg-surface-hover text-fg shadow-sm"
                  : "text-muted hover:text-fg",
              )}
            >
              {smt.socialMediaTrending8RangeWeekLabel}
            </button>
            <button
              type="button"
              onClick={() => setRange("month")}
              aria-pressed={range === "month"}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                range === "month"
                  ? "bg-surface-hover text-fg shadow-sm"
                  : "text-muted hover:text-fg",
              )}
            >
              {smt.socialMediaTrending8RangeMonthLabel}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => {
            const value = range === "week" ? stat.week : stat.month;
            const delta = range === "week" ? stat.deltaWeek : stat.deltaMonth;
            const isPositive = delta >= 0;
            return (
              <div
                key={stat.id}
                className="border-border bg-surface flex flex-col gap-3 rounded-2xl border p-5 shadow-xs"
              >
                <div className="text-brand bg-brand/10 flex size-9 items-center justify-center rounded-lg">
                  <stat.icon size={18} aria-hidden="true" />
                </div>
                <span className="text-muted text-sm">{smt[stat.labelKey]}</span>
                <span className="text-fg text-2xl font-semibold tracking-tight">
                  {value.toLocaleString()}
                </span>
                <span
                  className={cn(
                    "flex w-fit items-center gap-1 text-xs font-medium",
                    isPositive ? "text-success" : "text-error",
                  )}
                >
                  {isPositive ? (
                    <IconTrendingUp size={13} aria-hidden="true" />
                  ) : (
                    <IconTrendingDown size={13} aria-hidden="true" />
                  )}
                  {Math.abs(delta)}%
                </span>
              </div>
            );
          })}
        </div>

        <div className="border-border bg-surface flex flex-col gap-4 rounded-2xl border p-5 shadow-xs">
          <span className="text-fg text-sm font-medium">
            {smt.socialMediaTrending8BreakdownLabel}
          </span>
          <div className="flex flex-col gap-3">
            {PLATFORM_BREAKDOWN.map((platform) => (
              <div key={platform.id} className="flex items-center gap-3">
                <span className="text-muted w-20 shrink-0 text-xs">
                  {smt[platform.labelKey]}
                </span>
                <div className="bg-border relative h-2 flex-1 overflow-hidden rounded-full">
                  <div
                    className="bg-brand absolute inset-y-0 left-0 rounded-full"
                    style={{ width: `${platform.percent}%` }}
                  />
                </div>
                <span className="text-fg w-10 shrink-0 text-right text-xs font-medium">
                  {platform.percent}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
