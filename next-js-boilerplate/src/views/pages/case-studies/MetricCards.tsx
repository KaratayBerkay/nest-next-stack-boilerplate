"use client";

import {
  IconArrowUpRight,
  IconClock,
  IconShieldCheck,
  IconTrendingUp,
  IconTrophy,
  IconUsers,
} from "@tabler/icons-react";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  CaseStudy13Card,
  PagesWithCaseStudiesMessages,
} from "@/types/pages/case-studies/CaseStudiesMessages-types";

const CARDS: CaseStudy13Card[] = [
  {
    valueKey: "caseStudy13Card1Value",
    labelKey: "caseStudy13Card1Label",
    descriptionKey: "caseStudy13Card1Description",
    icon: IconArrowUpRight,
  },
  {
    valueKey: "caseStudy13Card2Value",
    labelKey: "caseStudy13Card2Label",
    descriptionKey: "caseStudy13Card2Description",
    icon: IconClock,
  },
  {
    valueKey: "caseStudy13Card3Value",
    labelKey: "caseStudy13Card3Label",
    descriptionKey: "caseStudy13Card3Description",
    icon: IconUsers,
  },
  {
    valueKey: "caseStudy13Card4Value",
    labelKey: "caseStudy13Card4Label",
    descriptionKey: "caseStudy13Card4Description",
    icon: IconShieldCheck,
  },
  {
    valueKey: "caseStudy13Card5Value",
    labelKey: "caseStudy13Card5Label",
    descriptionKey: "caseStudy13Card5Description",
    icon: IconTrendingUp,
  },
  {
    valueKey: "caseStudy13Card6Value",
    labelKey: "caseStudy13Card6Label",
    descriptionKey: "caseStudy13Card6Description",
    icon: IconTrophy,
  },
];

export function MetricCards() {
  const t = useMessages("pages") as unknown as PagesWithCaseStudiesMessages;
  const cs = t.caseStudies;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {cs.caseStudy13Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {cs.caseStudy13Description}
          </Typography>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {CARDS.map((card) => (
            <article
              key={card.valueKey}
              className="border-border bg-surface flex flex-col gap-4 rounded-2xl border p-6"
            >
              <div className="bg-brand/10 flex size-10 items-center justify-center rounded-lg">
                <card.icon
                  size={20}
                  className="text-brand"
                  aria-hidden="true"
                />
              </div>
              <Typography
                variant="h3"
                className="text-3xl font-semibold tracking-tighter"
              >
                {cs[card.valueKey]}
              </Typography>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold">
                  {cs[card.labelKey]}
                </span>
                <Typography variant="caption" className="text-muted">
                  {cs[card.descriptionKey]}
                </Typography>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
