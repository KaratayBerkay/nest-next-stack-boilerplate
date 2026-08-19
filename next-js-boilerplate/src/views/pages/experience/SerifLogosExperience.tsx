"use client";

import {
  IconBrandAsana,
  IconBrandNotion,
  IconBrandPaypal,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithExperienceMessages } from "@/types/pages/experience/ExperienceMessages-types";

const CAREER_ROWS = [
  {
    titleKey: "experience5Role1Title",
    metaKey: "experience5Role1Meta",
    descriptionKey: "experience5Role1Description",
    periodKey: "experience5Role1Period",
    companyKey: "experience5Role1Company",
    Icon: IconBrandNotion,
  },
  {
    titleKey: "experience5Role2Title",
    metaKey: "experience5Role2Meta",
    descriptionKey: "experience5Role2Description",
    periodKey: "experience5Role2Period",
    companyKey: "experience5Role2Company",
    Icon: IconBrandAsana,
  },
  {
    titleKey: "experience5Role3Title",
    metaKey: "experience5Role3Meta",
    descriptionKey: "experience5Role3Description",
    periodKey: "experience5Role3Period",
    companyKey: "experience5Role3Company",
    Icon: IconBrandPaypal,
  },
] as const;

export function SerifLogosExperience() {
  const t = useMessages("pages") as unknown as PagesWithExperienceMessages;
  const e = t.experience;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <h2 className="mb-16 font-serif text-4xl font-medium tracking-tight lg:text-5xl">
          {e.experience5Heading}
        </h2>
        <ul className="border-border divide-border divide-y">
          {CAREER_ROWS.map((row) => (
            <li
              key={row.companyKey}
              className="grid gap-4 py-10 lg:grid-cols-12 lg:gap-8"
            >
              <div className="flex flex-col gap-3 lg:col-span-8">
                <div className="flex items-center gap-4">
                  <span className="border-border bg-surface flex size-12 shrink-0 items-center justify-center rounded-xl border">
                    <row.Icon
                      size={22}
                      className="text-fg"
                      aria-hidden="true"
                    />
                  </span>
                  <div>
                    <h3 className="text-fg text-lg font-semibold tracking-tight">
                      {e[row.titleKey]}
                    </h3>
                    <p className="text-muted text-xs">{e[row.metaKey]}</p>
                  </div>
                </div>
                <p className="text-muted text-sm leading-relaxed lg:pl-16">
                  {e[row.descriptionKey]}
                </p>
              </div>
              <div className="flex flex-col items-start gap-1 lg:col-span-4 lg:items-end">
                <span className="text-fg text-sm font-medium">
                  {e[row.periodKey]}
                </span>
                <span className="text-muted text-sm">{e[row.companyKey]}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
