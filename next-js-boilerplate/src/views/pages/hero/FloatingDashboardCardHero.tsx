"use client";

import { IconBell, IconTrendingUp } from "@tabler/icons-react";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithHeroMessages } from "@/types/pages/hero/HeroMessages-types";

const BAR_HEIGHTS = [38, 62, 45, 80, 58, 92, 70] as const;

const TEAM_MEMBERS = ["Ava Chen", "Noah Reyes", "Lea Bauer"] as const;

export function FloatingDashboardCardHero() {
  const t = useMessages("pages") as unknown as PagesWithHeroMessages;
  const h = t.hero;

  return (
    <section className="w-full py-16 lg:py-28">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="flex flex-col gap-5">
          <span className="text-brand text-xs font-medium tracking-widest uppercase">
            {h.hero9Eyebrow}
          </span>
          <h1 className="text-fg text-4xl font-semibold tracking-tight lg:text-5xl">
            {h.hero9Heading}
          </h1>
          <p className="text-muted max-w-md text-lg">{h.hero9Subheading}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Button variant="primary" size="lg">
              {h.hero9PrimaryCta}
            </Button>
            <Button variant="outline" size="lg">
              {h.hero9SecondaryCta}
            </Button>
          </div>
        </div>

        <div className="relative pt-6 pl-6">
          <div className="border-border bg-bg -rotate-2 rounded-2xl border p-6 shadow-xl transition-transform duration-300 hover:rotate-0">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="text-muted text-sm font-medium">
                {h.hero9DashboardTitle}
              </span>
              <AvatarGroup size="xs" max={3}>
                {TEAM_MEMBERS.map((name) => (
                  <Avatar
                    key={name}
                    fallback={name}
                    alt={name}
                    variant="default"
                    size="xs"
                  />
                ))}
              </AvatarGroup>
            </div>

            <div
              className="flex items-end justify-between gap-1.5"
              aria-hidden="true"
            >
              {BAR_HEIGHTS.map((height, index) => (
                <span
                  key={index}
                  className="bg-brand/70 w-full rounded-t-sm"
                  style={{ height: `${height}px` }}
                />
              ))}
            </div>

            <div className="border-border mt-4 flex items-center justify-between gap-3 border-t pt-4">
              <span className="text-fg text-2xl font-semibold tracking-tight">
                {h.hero9MetricValue}
              </span>
              <span className="text-success inline-flex items-center gap-1 text-sm font-medium">
                <IconTrendingUp size={14} aria-hidden="true" />
                {h.hero9MetricTrend}
              </span>
            </div>
          </div>

          <div className="border-border bg-bg absolute -top-2 -right-4 flex max-w-52 items-start gap-2.5 rounded-xl border p-3 shadow-lg sm:-right-8">
            <span className="bg-brand/15 text-brand flex size-8 shrink-0 items-center justify-center rounded-full">
              <IconBell size={15} aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-fg text-xs font-semibold">
                {h.hero9NotificationTitle}
              </span>
              <span className="text-muted text-xs">
                {h.hero9NotificationBody}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
