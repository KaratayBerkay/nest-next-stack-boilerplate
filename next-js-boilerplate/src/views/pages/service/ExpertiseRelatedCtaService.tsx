"use client";

import Link from "next/link";
import {
  IconArrowRight,
  IconChartBar,
  IconQuote,
  IconSpeakerphone,
  IconSparkles,
  IconTarget,
  IconUsers,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithServiceMessages } from "@/types/pages/service/ServiceMessages-types";

const EXPERTISE_AREAS: {
  id: string;
  icon: Icon;
  titleKey: string;
  bodyKey: string;
}[] = [
  {
    id: "paid",
    icon: IconTarget,
    titleKey: "service7Area1Title",
    bodyKey: "service7Area1Body",
  },
  {
    id: "lifecycle",
    icon: IconUsers,
    titleKey: "service7Area2Title",
    bodyKey: "service7Area2Body",
  },
  {
    id: "analytics",
    icon: IconChartBar,
    titleKey: "service7Area3Title",
    bodyKey: "service7Area3Body",
  },
  {
    id: "creative",
    icon: IconSpeakerphone,
    titleKey: "service7Area4Title",
    bodyKey: "service7Area4Body",
  },
];

const RELATED_SERVICES = [
  "service7Related1",
  "service7Related2",
  "service7Related3",
] as const;

export function ExpertiseRelatedCtaService() {
  const t = useMessages("pages") as unknown as PagesWithServiceMessages;
  const s = t.service;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Badge variant="soft" size="sm" className="w-fit">
            <IconSparkles size={14} className="mr-1.5" aria-hidden="true" />
            {s.service7Eyebrow}
          </Badge>
          <h2 className="text-fg max-w-2xl text-3xl font-semibold tracking-tight lg:text-4xl">
            {s.service7Heading}
          </h2>
        </div>

        <div className="mt-12">
          <h3 className="text-muted mb-5 text-center text-xs font-semibold tracking-wider uppercase">
            {s.service7ExpertiseHeading}
          </h3>
          <div className="border-border grid overflow-hidden rounded-xl border sm:grid-cols-2">
            {EXPERTISE_AREAS.map((area, index) => (
              <div
                key={area.id}
                className={cn(
                  "border-border flex flex-col gap-3 p-6 lg:p-8",
                  index % 2 === 0 && "sm:border-r",
                  index < 2 && "border-b",
                )}
              >
                <span className="bg-brand/10 text-brand flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <area.icon size={20} aria-hidden="true" />
                </span>
                <h4 className="text-fg text-base font-semibold">
                  {s[area.titleKey]}
                </h4>
                <p className="text-muted text-sm leading-relaxed">
                  {s[area.bodyKey]}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3">
          <span className="text-muted text-xs font-semibold tracking-wider uppercase">
            {s.service7RelatedHeading}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {RELATED_SERVICES.map((key) => (
              <Link
                key={key}
                href="#"
                className="border-border text-fg hover:bg-surface-hover rounded-full border px-4 py-1.5 text-sm transition-colors"
              >
                {s[key]}
              </Link>
            ))}
          </div>
        </div>

        <div className="border-border bg-surface mt-12 flex flex-col gap-4 rounded-xl border p-6 lg:p-8">
          <IconQuote size={28} className="text-brand" aria-hidden="true" />
          <p className="text-fg text-lg leading-relaxed font-medium">
            {s.service7QuoteText}
          </p>
          <footer className="text-sm">
            <span className="text-fg font-semibold">
              {s.service7QuoteAuthor}
            </span>
            <span className="text-muted"> — {s.service7QuoteRole}</span>
          </footer>
        </div>

        <div className="bg-brand text-brand-fg mt-8 flex flex-col items-center gap-4 rounded-xl p-8 text-center lg:p-10">
          <h3 className="text-2xl font-semibold tracking-tight">
            {s.service7CtaHeading}
          </h3>
          <p className="max-w-lg opacity-90">{s.service7CtaBody}</p>
          <Button variant="shadow" className="bg-bg text-fg hover:bg-bg/90">
            {s.service7CtaButton}
            <IconArrowRight size={16} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
}
