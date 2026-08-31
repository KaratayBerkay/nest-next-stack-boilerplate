"use client";

import {
  IconChartLine,
  IconFileCheck,
  IconFileReport,
  IconShieldCheck,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithComplianceMessages } from "@/types/pages/compliance/ComplianceMessages-types";

interface Story {
  icon: Icon;
  titleKey: string;
  descriptionKey: string;
}

const CERTIFICATIONS = ["SOC 2", "ISO 27001"] as const;

const STORIES: Story[] = [
  {
    icon: IconFileCheck,
    titleKey: "compliance1Card1Title",
    descriptionKey: "compliance1Card1Description",
  },
  {
    icon: IconChartLine,
    titleKey: "compliance1Card2Title",
    descriptionKey: "compliance1Card2Description",
  },
  {
    icon: IconFileReport,
    titleKey: "compliance1Card3Title",
    descriptionKey: "compliance1Card3Description",
  },
];

export function NarrativeDetailCards() {
  const m = useMessages("pages") as unknown as PagesWithComplianceMessages;
  const co = m.compliance;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-6">
            <span className="border-border text-muted inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm">
              <span
                className="bg-brand size-2 rounded-full"
                aria-hidden="true"
              />
              {co.compliance1Badge}
            </span>
            <Typography
              variant="h2"
              className="text-4xl font-medium tracking-tighter lg:text-5xl"
            >
              {co.compliance1Title}
            </Typography>
            <Typography
              variant="bodyLarge"
              className="text-muted max-w-xl leading-relaxed"
            >
              {co.compliance1Description}
            </Typography>
            <div className="flex flex-wrap gap-3">
              {CERTIFICATIONS.map((name) => (
                <span
                  key={name}
                  className="border-border text-muted inline-flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-xs"
                >
                  <IconShieldCheck size={14} aria-hidden="true" />
                  {name}
                </span>
              ))}
            </div>
          </div>
          <div className="border-border bg-surface rounded-3xl border p-6 lg:p-8">
            <div className="divide-border divide-y">
              {STORIES.map((story) => (
                <article
                  key={story.titleKey}
                  className="relative overflow-hidden py-6 first:pt-0 last:pb-0"
                >
                  <div className="relative z-10 flex max-w-md flex-col gap-2">
                    <Typography
                      variant="h4"
                      className="text-lg font-medium tracking-tight"
                    >
                      {co[story.titleKey]}
                    </Typography>
                    <Typography
                      variant="bodySmall"
                      className="text-muted leading-relaxed"
                    >
                      {co[story.descriptionKey]}
                    </Typography>
                  </div>
                  <story.icon
                    size={88}
                    stroke={1}
                    aria-hidden="true"
                    className="text-muted/10 absolute top-1/2 -right-4 -translate-y-1/2"
                  />
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
