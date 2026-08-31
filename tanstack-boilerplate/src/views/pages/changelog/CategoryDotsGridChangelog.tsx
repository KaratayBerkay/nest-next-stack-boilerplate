"use client";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithChangelogMessages } from "@/types/pages/changelog/ChangelogMessages-types";

type Category = "feature" | "improvement" | "fix" | "security";

interface ChangelogEntry {
  id: string;
  category: Category;
  categoryLabelKey: string;
  versionKey: string;
  dateKey: string;
  titleKey: string;
  descriptionKey: string;
}

const CATEGORY_DOT_CLASS: Record<Category, string> = {
  feature: "bg-brand",
  improvement: "bg-info",
  fix: "bg-warning",
  security: "bg-error",
};

const ENTRIES: ChangelogEntry[] = [
  {
    id: "changelog3-1",
    category: "feature",
    categoryLabelKey: "changelog3CategoryFeature",
    versionKey: "changelog3Entry1Version",
    dateKey: "changelog3Entry1Date",
    titleKey: "changelog3Entry1Title",
    descriptionKey: "changelog3Entry1Description",
  },
  {
    id: "changelog3-2",
    category: "fix",
    categoryLabelKey: "changelog3CategoryFix",
    versionKey: "changelog3Entry2Version",
    dateKey: "changelog3Entry2Date",
    titleKey: "changelog3Entry2Title",
    descriptionKey: "changelog3Entry2Description",
  },
  {
    id: "changelog3-3",
    category: "security",
    categoryLabelKey: "changelog3CategorySecurity",
    versionKey: "changelog3Entry3Version",
    dateKey: "changelog3Entry3Date",
    titleKey: "changelog3Entry3Title",
    descriptionKey: "changelog3Entry3Description",
  },
  {
    id: "changelog3-4",
    category: "feature",
    categoryLabelKey: "changelog3CategoryFeature",
    versionKey: "changelog3Entry4Version",
    dateKey: "changelog3Entry4Date",
    titleKey: "changelog3Entry4Title",
    descriptionKey: "changelog3Entry4Description",
  },
  {
    id: "changelog3-5",
    category: "improvement",
    categoryLabelKey: "changelog3CategoryImprovement",
    versionKey: "changelog3Entry5Version",
    dateKey: "changelog3Entry5Date",
    titleKey: "changelog3Entry5Title",
    descriptionKey: "changelog3Entry5Description",
  },
  {
    id: "changelog3-6",
    category: "fix",
    categoryLabelKey: "changelog3CategoryFix",
    versionKey: "changelog3Entry6Version",
    dateKey: "changelog3Entry6Date",
    titleKey: "changelog3Entry6Title",
    descriptionKey: "changelog3Entry6Description",
  },
];

export function CategoryDotsGridChangelog() {
  const t = useMessages("pages") as unknown as PagesWithChangelogMessages;
  const c = t.changelog;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-fg text-3xl font-medium tracking-tight lg:text-4xl">
            {c.changelog3Heading}
          </h2>
          <p className="text-muted">{c.changelog3Intro}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {ENTRIES.map((entry) => (
            <Card key={entry.id} className="flex flex-col gap-3 p-5">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "size-2 rounded-full",
                    CATEGORY_DOT_CLASS[entry.category],
                  )}
                  aria-hidden="true"
                />
                <span className="text-muted text-xs font-medium tracking-wide uppercase">
                  {c[entry.categoryLabelKey]}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-fg font-medium">
                  {c[entry.versionKey]}
                </span>
                <span className="text-muted" aria-hidden="true">
                  ·
                </span>
                <span className="text-muted">{c[entry.dateKey]}</span>
              </div>
              <h3 className="text-fg text-lg font-semibold tracking-tight">
                {c[entry.titleKey]}
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {c[entry.descriptionKey]}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
