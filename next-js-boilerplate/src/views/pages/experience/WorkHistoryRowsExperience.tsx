"use client";

import {
  IconBrandDribbble,
  IconBrandFramer,
  IconBrandVercel,
  IconDownload,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithExperienceMessages } from "@/types/pages/experience/ExperienceMessages-types";

const CV_URL = "#" as const;

const WORK_ROLES = [
  {
    periodKey: "experience1Role1Period",
    titleKey: "experience1Role1Title",
    descriptionKey: "experience1Role1Description",
    companyKey: "experience1Role1Company",
    Icon: IconBrandFramer,
  },
  {
    periodKey: "experience1Role2Period",
    titleKey: "experience1Role2Title",
    descriptionKey: "experience1Role2Description",
    companyKey: "experience1Role2Company",
    Icon: IconBrandVercel,
  },
  {
    periodKey: "experience1Role3Period",
    titleKey: "experience1Role3Title",
    descriptionKey: "experience1Role3Description",
    companyKey: "experience1Role3Company",
    Icon: IconBrandDribbble,
  },
] as const;

export function WorkHistoryRowsExperience() {
  const t = useMessages("pages") as unknown as PagesWithExperienceMessages;
  const e = t.experience;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mb-12 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-4">
          <h2 className="text-fg text-4xl font-semibold tracking-tight lg:text-6xl">
            {e.experience1Heading}
          </h2>
          <a
            href={CV_URL}
            className="text-muted group hover:text-fg inline-flex items-center gap-2 text-sm font-medium underline-offset-4 transition-colors hover:underline"
          >
            {e.experience1CvLabel}
            <IconDownload
              size={16}
              className="transition-transform group-hover:translate-y-0.5"
              aria-hidden="true"
            />
          </a>
        </div>
        <ul className="border-border divide-border divide-y border-y">
          {WORK_ROLES.map((role) => (
            <li
              key={role.titleKey}
              className="grid gap-3 py-8 md:grid-cols-12 md:gap-6"
            >
              <p className="text-muted text-sm md:col-span-2">
                {e[role.periodKey]}
              </p>
              <div className="flex flex-col gap-2 md:col-span-8">
                <h3 className="text-fg text-lg font-semibold tracking-tight">
                  {e[role.titleKey]}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {e[role.descriptionKey]}
                </p>
              </div>
              <div className="flex items-center justify-between gap-3 md:col-span-2 md:flex-col md:items-end">
                <span className="text-muted text-sm font-medium">
                  {e[role.companyKey]}
                </span>
                <span className="border-border bg-surface flex size-10 shrink-0 items-center justify-center rounded-lg border">
                  <role.Icon size={18} className="text-fg" aria-hidden="true" />
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
