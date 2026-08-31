"use client";

import { IconDownload } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithExperienceMessages } from "@/types/pages/experience/ExperienceMessages-types";

const RESUME_URL = "#" as const;

const POSITION_ROWS = [
  {
    titleKey: "experience3Role1Title",
    descriptionKey: "experience3Role1Description",
    periodKey: "experience3Role1Period",
  },
  {
    titleKey: "experience3Role2Title",
    descriptionKey: "experience3Role2Description",
    periodKey: "experience3Role2Period",
  },
  {
    titleKey: "experience3Role3Title",
    descriptionKey: "experience3Role3Description",
    periodKey: "experience3Role3Period",
  },
] as const;

export function NumberedResumeListExperience() {
  const t = useMessages("pages") as unknown as PagesWithExperienceMessages;
  const e = t.experience;
  const rowCount = POSITION_ROWS.length;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-2xl flex-col items-start gap-3">
            <span className="text-muted text-xs font-semibold tracking-widest uppercase">
              {e.experience3Eyebrow}
            </span>
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-5xl">
              {e.experience3Heading}
            </h2>
            <p className="text-muted leading-relaxed">{e.experience3Intro}</p>
          </div>
          <div className="flex flex-col items-start gap-2 lg:items-end">
            <a
              href={RESUME_URL}
              className="border-border bg-surface group hover:bg-surface-hover inline-flex items-center gap-3 rounded-full border py-1.5 pr-1.5 pl-6 text-sm font-medium transition-colors"
            >
              {e.experience3ResumeLabel}
              <span className="bg-brand text-brand-fg flex size-9 items-center justify-center rounded-full">
                <IconDownload size={16} aria-hidden="true" />
              </span>
            </a>
            <span className="text-muted text-xs">
              {e.experience3UpdatedLabel}
            </span>
          </div>
        </div>
        <div className="mt-14">
          <div className="text-muted hidden grid-cols-12 gap-6 border-b pb-3 text-xs font-semibold tracking-widest uppercase sm:grid">
            <span className="col-span-7">{e.experience3RoleLabel}</span>
            <span className="col-span-5 text-right">
              {e.experience3PeriodLabel}
            </span>
          </div>
          <ul className="border-border divide-border divide-y">
            {POSITION_ROWS.map((row, index) => (
              <li
                key={row.titleKey}
                className="grid gap-2 py-8 sm:grid-cols-12 sm:gap-6"
              >
                <div className="flex items-baseline gap-3 sm:col-span-7 sm:gap-6">
                  <span className="text-muted text-sm tabular-nums">
                    {String(rowCount - index).padStart(2, "0")}
                  </span>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-fg text-lg font-semibold tracking-tight">
                      {e[row.titleKey]}
                    </h3>
                    <p className="text-muted text-sm leading-relaxed">
                      {e[row.descriptionKey]}
                    </p>
                  </div>
                </div>
                <p className="text-muted text-xs tracking-widest uppercase sm:col-span-5 sm:py-1 sm:text-right sm:text-sm sm:tracking-wide">
                  {e[row.periodKey]}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
