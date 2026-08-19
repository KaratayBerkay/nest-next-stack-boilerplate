"use client";

import { IconArrowUpRight } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithExperienceMessages } from "@/types/pages/experience/ExperienceMessages-types";

const CONTACT_URL = "#" as const;

const STINT_ROWS = [
  {
    companyKey: "experience2Role1Company",
    titleKey: "experience2Role1Title",
    descriptionKey: "experience2Role1Description",
    periodKey: "experience2Role1Period",
  },
  {
    companyKey: "experience2Role2Company",
    titleKey: "experience2Role2Title",
    descriptionKey: "experience2Role2Description",
    periodKey: "experience2Role2Period",
  },
  {
    companyKey: "experience2Role3Company",
    titleKey: "experience2Role3Title",
    descriptionKey: "experience2Role3Description",
    periodKey: "experience2Role3Period",
  },
] as const;

export function StickyTimelineExperience() {
  const t = useMessages("pages") as unknown as PagesWithExperienceMessages;
  const e = t.experience;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-6 lg:gap-16">
          <div className="flex flex-col items-start gap-6 lg:sticky lg:top-24 lg:col-span-2 lg:self-start">
            <h2 className="text-fg text-4xl font-semibold tracking-tight lg:text-5xl">
              {e.experience2Heading}
              <sup className="text-muted ml-2 align-super text-sm font-normal">
                {e.experience2Tenure}
              </sup>
            </h2>
            <p className="text-muted leading-relaxed">{e.experience2Intro}</p>
            <a
              href={CONTACT_URL}
              className="border-border bg-surface group hover:bg-surface-hover inline-flex items-center gap-3 rounded-full border py-1.5 pr-1.5 pl-6 text-sm font-medium transition-colors"
            >
              {e.experience2ContactLabel}
              <span className="bg-brand text-brand-fg flex size-9 items-center justify-center rounded-full transition-transform duration-300 group-hover:rotate-45">
                <IconArrowUpRight size={16} aria-hidden="true" />
              </span>
            </a>
          </div>
          <ul className="border-border divide-border divide-y lg:col-span-4">
            {STINT_ROWS.map((row) => (
              <li
                key={row.companyKey}
                className="flex flex-col gap-2 py-8 sm:flex-row sm:items-start sm:justify-between sm:gap-8"
              >
                <div className="flex flex-col gap-2">
                  <span className="text-fg text-sm font-medium">
                    {e[row.companyKey]}
                  </span>
                  <h3 className="text-fg text-xl font-semibold tracking-tight">
                    {e[row.titleKey]}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed">
                    {e[row.descriptionKey]}
                  </p>
                </div>
                <span className="text-muted border-border w-fit shrink-0 rounded-full border px-3 py-1 text-xs">
                  {e[row.periodKey]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
