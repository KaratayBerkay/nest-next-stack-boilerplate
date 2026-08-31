"use client";

import {
  IconArrowRight,
  IconClipboardCheck,
  IconLock,
  IconReportAnalytics,
  IconShieldLock,
  IconSitemap,
  IconUserShield,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithComplianceMessages } from "@/types/pages/compliance/ComplianceMessages-types";

const LINK_URL = "#" as const;

interface Feature {
  icon: Icon;
  titleKey: string;
  descriptionKey: string;
}

const FEATURES: Feature[] = [
  {
    icon: IconShieldLock,
    titleKey: "compliance2Card1Title",
    descriptionKey: "compliance2Card1Description",
  },
  {
    icon: IconReportAnalytics,
    titleKey: "compliance2Card2Title",
    descriptionKey: "compliance2Card2Description",
  },
  {
    icon: IconLock,
    titleKey: "compliance2Card3Title",
    descriptionKey: "compliance2Card3Description",
  },
  {
    icon: IconClipboardCheck,
    titleKey: "compliance2Card4Title",
    descriptionKey: "compliance2Card4Description",
  },
  {
    icon: IconSitemap,
    titleKey: "compliance2Card5Title",
    descriptionKey: "compliance2Card5Description",
  },
  {
    icon: IconUserShield,
    titleKey: "compliance2Card6Title",
    descriptionKey: "compliance2Card6Description",
  },
];

export function FeatureGridExpertLink() {
  const m = useMessages("pages") as unknown as PagesWithComplianceMessages;
  const co = m.compliance;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {co.compliance2Title}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {co.compliance2Description}
          </Typography>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.titleKey}
              className="border-border bg-surface flex flex-col gap-4 rounded-2xl border p-6"
            >
              <span className="border-border bg-bg flex size-12 items-center justify-center rounded-xl border shadow-xs">
                <feature.icon
                  size={22}
                  aria-hidden="true"
                  className="text-brand"
                />
              </span>
              <div className="flex flex-col gap-1.5">
                <Typography variant="h5" className="font-medium tracking-tight">
                  {co[feature.titleKey]}
                </Typography>
                <Typography
                  variant="bodySmall"
                  className="text-muted leading-relaxed"
                >
                  {co[feature.descriptionKey]}
                </Typography>
              </div>
            </div>
          ))}
        </div>
        <div className="border-border bg-surface mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border p-6 lg:flex-row lg:items-center lg:p-8">
          <div className="flex max-w-2xl flex-col gap-1.5">
            <Typography variant="h5" className="font-medium tracking-tight">
              {co.compliance2ExpertTitle}
            </Typography>
            <Typography
              variant="bodySmall"
              className="text-muted leading-relaxed"
            >
              {co.compliance2ExpertDescription}
            </Typography>
          </div>
          <a
            href={LINK_URL}
            className="group/link text-brand inline-flex shrink-0 items-center gap-1.5 text-sm font-medium underline underline-offset-4"
          >
            {co.compliance2ExpertLink}
            <IconArrowRight
              size={16}
              aria-hidden="true"
              className="transition-transform group-hover/link:translate-x-0.5"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
