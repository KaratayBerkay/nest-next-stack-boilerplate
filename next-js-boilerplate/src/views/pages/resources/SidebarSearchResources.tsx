"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Icon } from "@tabler/icons-react";
import {
  IconBook2,
  IconBriefcase,
  IconGitBranch,
  IconGridDots,
  IconPlugConnected,
  IconRocket,
  IconSearch,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Empty } from "@/components/ui/Empty";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithResourcesMessages } from "@/types/pages/resources/ResourcesMessages-types";

const LINK_URL = "#" as const;

type CategoryValue =
  | "getting-started"
  | "guides"
  | "integrations"
  | "case-studies"
  | "release-notes";
type FilterValue = "all" | CategoryValue;

interface CategoryDef {
  value: FilterValue;
  labelKey: string;
  icon: Icon;
}

const CATEGORIES: CategoryDef[] = [
  { value: "all", labelKey: "resources2CategoryAllLabel", icon: IconGridDots },
  {
    value: "getting-started",
    labelKey: "resources2Category1Label",
    icon: IconRocket,
  },
  { value: "guides", labelKey: "resources2Category2Label", icon: IconBook2 },
  {
    value: "integrations",
    labelKey: "resources2Category3Label",
    icon: IconPlugConnected,
  },
  {
    value: "case-studies",
    labelKey: "resources2Category4Label",
    icon: IconBriefcase,
  },
  {
    value: "release-notes",
    labelKey: "resources2Category5Label",
    icon: IconGitBranch,
  },
];

interface ResourceRow {
  id: string;
  category: CategoryValue;
  titleKey: string;
  descriptionKey: string;
  dateKey: string;
}

const RESOURCES: ResourceRow[] = [
  {
    id: "first-workspace",
    category: "getting-started",
    titleKey: "resources2Item1Title",
    descriptionKey: "resources2Item1Description",
    dateKey: "resources2Item1Date",
  },
  {
    id: "import-spreadsheet",
    category: "getting-started",
    titleKey: "resources2Item2Title",
    descriptionKey: "resources2Item2Description",
    dateKey: "resources2Item2Date",
  },
  {
    id: "automations-guide",
    category: "guides",
    titleKey: "resources2Item3Title",
    descriptionKey: "resources2Item3Description",
    dateKey: "resources2Item3Date",
  },
  {
    id: "permissions-guide",
    category: "guides",
    titleKey: "resources2Item4Title",
    descriptionKey: "resources2Item4Description",
    dateKey: "resources2Item4Date",
  },
  {
    id: "slack-integration",
    category: "integrations",
    titleKey: "resources2Item5Title",
    descriptionKey: "resources2Item5Description",
    dateKey: "resources2Item5Date",
  },
  {
    id: "calendar-integration",
    category: "integrations",
    titleKey: "resources2Item6Title",
    descriptionKey: "resources2Item6Description",
    dateKey: "resources2Item6Date",
  },
  {
    id: "northwind-case-study",
    category: "case-studies",
    titleKey: "resources2Item7Title",
    descriptionKey: "resources2Item7Description",
    dateKey: "resources2Item7Date",
  },
  {
    id: "brightloop-case-study",
    category: "case-studies",
    titleKey: "resources2Item8Title",
    descriptionKey: "resources2Item8Description",
    dateKey: "resources2Item8Date",
  },
  {
    id: "march-release",
    category: "release-notes",
    titleKey: "resources2Item9Title",
    descriptionKey: "resources2Item9Description",
    dateKey: "resources2Item9Date",
  },
  {
    id: "february-release",
    category: "release-notes",
    titleKey: "resources2Item10Title",
    descriptionKey: "resources2Item10Description",
    dateKey: "resources2Item10Date",
  },
];

function filterResources(
  items: readonly ResourceRow[],
  category: FilterValue,
  query: string,
  r: Record<string, string>,
): ResourceRow[] {
  const q = query.trim().toLowerCase();
  return items.filter((item) => {
    if (category !== "all" && item.category !== category) return false;
    if (!q) return true;
    const title = r[item.titleKey].toLowerCase();
    const description = r[item.descriptionKey].toLowerCase();
    return title.includes(q) || description.includes(q);
  });
}

function countByCategory(
  items: readonly ResourceRow[],
): Map<FilterValue, number> {
  const map = new Map<FilterValue, number>();
  map.set("all", items.length);
  for (const item of items) {
    map.set(item.category, (map.get(item.category) ?? 0) + 1);
  }
  return map;
}

export function SidebarSearchResources() {
  const t = useMessages("pages") as unknown as PagesWithResourcesMessages;
  const r = t.resources;
  const [category, setCategory] = useState<FilterValue>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => filterResources(RESOURCES, category, query, r),
    [category, query, r],
  );
  const counts = useMemo(() => countByCategory(RESOURCES), []);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <span className="text-muted text-xs font-semibold tracking-widest uppercase">
            {r.resources2Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {r.resources2Heading}
          </h2>
          <p className="text-muted leading-relaxed">
            {r.resources2Description}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="flex flex-col gap-4">
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={r.resources2SearchPlaceholder}
              aria-label={r.resources2SearchAria}
              leftIcon={<IconSearch size={16} />}
            />
            <nav
              aria-label={r.resources2Eyebrow}
              className="flex flex-col gap-1"
            >
              {CATEGORIES.map((cat) => {
                const isActive = category === cat.value;
                const count = counts.get(cat.value) ?? 0;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    aria-pressed={isActive}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      isActive
                        ? "bg-surface-hover text-fg font-medium"
                        : "text-muted hover:bg-surface-hover/60 hover:text-fg",
                    )}
                  >
                    <cat.icon
                      size={16}
                      className={isActive ? "text-brand" : "text-muted"}
                      aria-hidden="true"
                    />
                    <span className="flex-1">{r[cat.labelKey]}</span>
                    <span className="text-muted text-xs tabular-nums">
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="flex flex-col gap-4">
            <span className="text-muted text-xs">
              {r.resources2ResultsCount.replace(
                "{count}",
                String(filtered.length),
              )}
            </span>
            {filtered.length === 0 ? (
              <Empty
                icon={<IconSearch size={28} aria-hidden="true" />}
                title={r.resources2NoResultsTitle}
                description={r.resources2NoResultsDescription}
                action={
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuery("");
                      setCategory("all");
                    }}
                  >
                    {r.resources2ClearCta}
                  </Button>
                }
              />
            ) : (
              <ul className="border-border divide-border divide-y overflow-hidden rounded-2xl border">
                {filtered.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={LINK_URL}
                      className="hover:bg-surface-hover flex flex-col gap-1 p-4 transition-colors sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                    >
                      <span className="flex min-w-0 flex-col gap-1">
                        <span className="text-fg text-sm font-semibold">
                          {r[item.titleKey]}
                        </span>
                        <span className="text-muted text-sm leading-relaxed">
                          {r[item.descriptionKey]}
                        </span>
                      </span>
                      <span className="text-muted shrink-0 text-xs whitespace-nowrap">
                        {r[item.dateKey]}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
