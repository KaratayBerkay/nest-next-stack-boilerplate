"use client";

import { IconArrowRight } from "@tabler/icons-react";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithProjectsMessages } from "@/types/pages/projects/ProjectsMessages-types";

const LINK_URL = "https://example.com" as const;

interface IndexItem {
  indexLabel: string;
  titleKey: string;
  blurbKey: string;
  categoryKey: string;
  yearKey: string;
}

const ITEMS: IndexItem[] = [
  {
    indexLabel: "01",
    titleKey: "projects6Item1Title",
    blurbKey: "projects6Item1Blurb",
    categoryKey: "projects6Item1Category",
    yearKey: "projects6Item1Year",
  },
  {
    indexLabel: "02",
    titleKey: "projects6Item2Title",
    blurbKey: "projects6Item2Blurb",
    categoryKey: "projects6Item2Category",
    yearKey: "projects6Item2Year",
  },
  {
    indexLabel: "03",
    titleKey: "projects6Item3Title",
    blurbKey: "projects6Item3Blurb",
    categoryKey: "projects6Item3Category",
    yearKey: "projects6Item3Year",
  },
  {
    indexLabel: "04",
    titleKey: "projects6Item4Title",
    blurbKey: "projects6Item4Blurb",
    categoryKey: "projects6Item4Category",
    yearKey: "projects6Item4Year",
  },
  {
    indexLabel: "05",
    titleKey: "projects6Item5Title",
    blurbKey: "projects6Item5Blurb",
    categoryKey: "projects6Item5Category",
    yearKey: "projects6Item5Year",
  },
  {
    indexLabel: "06",
    titleKey: "projects6Item6Title",
    blurbKey: "projects6Item6Blurb",
    categoryKey: "projects6Item6Category",
    yearKey: "projects6Item6Year",
  },
];

export function MinimalTextProjectIndexProjects() {
  const t = useMessages("pages") as unknown as PagesWithProjectsMessages;
  const pr = t.projects;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-4">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {pr.projects6Eyebrow}
          </span>
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {pr.projects6Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {pr.projects6Intro}
          </Typography>
        </div>

        <ol className="border-border divide-border divide-y border-t border-b">
          {ITEMS.map((item) => (
            <li key={item.titleKey}>
              <a
                href={LINK_URL}
                className="group hover:bg-surface-hover -mx-4 flex items-center gap-4 rounded-lg px-4 py-6 transition-colors sm:gap-8"
              >
                <span className="text-muted w-8 shrink-0 font-mono text-sm">
                  {item.indexLabel}
                </span>
                <div className="min-w-0 flex-1">
                  <Typography
                    variant="h3"
                    className="text-fg text-lg font-medium tracking-tight"
                  >
                    {pr[item.titleKey]}
                  </Typography>
                  <Typography
                    variant="bodySmall"
                    className="text-muted mt-1 line-clamp-1"
                  >
                    {pr[item.blurbKey]}
                  </Typography>
                </div>
                <span className="text-muted hidden shrink-0 text-sm sm:block">
                  {pr[item.categoryKey]}
                </span>
                <span className="text-muted hidden w-12 shrink-0 text-right text-sm md:block">
                  {pr[item.yearKey]}
                </span>
                <IconArrowRight
                  size={16}
                  aria-hidden="true"
                  className="text-muted shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                />
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
