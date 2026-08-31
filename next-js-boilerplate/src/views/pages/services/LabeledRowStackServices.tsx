"use client";

import {
  IconBriefcase,
  IconChartBar,
  IconCode,
  IconHeadset,
  IconPalette,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { BadgeVariant } from "@/types/ui/Badge-types";
import type { PagesWithServicesMessages } from "@/types/pages/services/ServicesMessages-types";

interface ServiceRow {
  id: string;
  icon: Icon;
  nameKey: string;
  descriptionKey: string;
  badgeKey: string;
  badgeVariant: BadgeVariant;
  statLabelKey: string;
  statValueKey: string;
}

const SERVICES: ServiceRow[] = [
  {
    id: "consulting",
    icon: IconBriefcase,
    nameKey: "services9Service1Name",
    descriptionKey: "services9Service1Description",
    badgeKey: "services9Service1Badge",
    badgeVariant: "info",
    statLabelKey: "services9Service1StatLabel",
    statValueKey: "services9Service1StatValue",
  },
  {
    id: "design",
    icon: IconPalette,
    nameKey: "services9Service2Name",
    descriptionKey: "services9Service2Description",
    badgeKey: "services9Service2Badge",
    badgeVariant: "success",
    statLabelKey: "services9Service2StatLabel",
    statValueKey: "services9Service2StatValue",
  },
  {
    id: "engineering",
    icon: IconCode,
    nameKey: "services9Service3Name",
    descriptionKey: "services9Service3Description",
    badgeKey: "services9Service3Badge",
    badgeVariant: "warning",
    statLabelKey: "services9Service3StatLabel",
    statValueKey: "services9Service3StatValue",
  },
  {
    id: "analytics",
    icon: IconChartBar,
    nameKey: "services9Service4Name",
    descriptionKey: "services9Service4Description",
    badgeKey: "services9Service4Badge",
    badgeVariant: "secondary",
    statLabelKey: "services9Service4StatLabel",
    statValueKey: "services9Service4StatValue",
  },
  {
    id: "support",
    icon: IconHeadset,
    nameKey: "services9Service5Name",
    descriptionKey: "services9Service5Description",
    badgeKey: "services9Service5Badge",
    badgeVariant: "outline",
    statLabelKey: "services9Service5StatLabel",
    statValueKey: "services9Service5StatValue",
  },
];

export function LabeledRowStackServices() {
  const t = useMessages("pages") as unknown as PagesWithServicesMessages;
  const s = t.services;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {s.services9Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {s.services9Heading}
          </h2>
        </div>

        <div className="border-border mt-12 flex flex-col overflow-hidden rounded-xl border">
          {SERVICES.map((service, index) => (
            <div
              key={service.id}
              className={cn(
                "flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:gap-6 lg:p-8",
                index % 2 === 1 && "bg-surface/60",
                index > 0 && "border-border border-t",
              )}
            >
              <span className="border-border bg-bg flex size-12 shrink-0 items-center justify-center rounded-full border">
                <service.icon
                  size={22}
                  aria-hidden="true"
                  className="text-brand"
                />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-fg text-base font-semibold">
                    {s[service.nameKey]}
                  </h3>
                  <Badge variant={service.badgeVariant} size="sm">
                    {s[service.badgeKey]}
                  </Badge>
                </div>
                <p className="text-muted mt-1.5 text-sm leading-relaxed">
                  {s[service.descriptionKey]}
                </p>
              </div>
              <div className="shrink-0 text-left sm:text-right">
                <p className="text-fg text-lg font-semibold tabular-nums">
                  {s[service.statValueKey]}
                </p>
                <p className="text-muted text-xs">{s[service.statLabelKey]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
