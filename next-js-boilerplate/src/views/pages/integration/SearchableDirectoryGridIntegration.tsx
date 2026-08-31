"use client";

import { useMemo, useState } from "react";
import {
  IconCalendarEvent,
  IconChartBar,
  IconChartDots3,
  IconChecklist,
  IconCoin,
  IconGitBranch,
  IconMail,
  IconMessageCircle,
  IconReportMoney,
  IconSearch,
  IconTerminal2,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithIntegrationMessages } from "@/types/pages/integration/IntegrationMessages-types";

type CategoryId =
  "productivity" | "communication" | "finance" | "analytics" | "developer";
type CategoryFilter = "all" | CategoryId;

interface DirectoryEntry {
  id: string;
  icon: Icon;
  nameKey: string;
  blurbKey: string;
  category: CategoryId;
  categoryKey: string;
  popular?: boolean;
}

const ENTRIES: DirectoryEntry[] = [
  {
    id: "entry-1",
    icon: IconChecklist,
    nameKey: "integration2Tool1Name",
    blurbKey: "integration2Tool1Blurb",
    category: "productivity",
    categoryKey: "integration2CategoryProductivity",
    popular: true,
  },
  {
    id: "entry-2",
    icon: IconCalendarEvent,
    nameKey: "integration2Tool2Name",
    blurbKey: "integration2Tool2Blurb",
    category: "productivity",
    categoryKey: "integration2CategoryProductivity",
  },
  {
    id: "entry-3",
    icon: IconMessageCircle,
    nameKey: "integration2Tool3Name",
    blurbKey: "integration2Tool3Blurb",
    category: "communication",
    categoryKey: "integration2CategoryCommunication",
    popular: true,
  },
  {
    id: "entry-4",
    icon: IconMail,
    nameKey: "integration2Tool4Name",
    blurbKey: "integration2Tool4Blurb",
    category: "communication",
    categoryKey: "integration2CategoryCommunication",
  },
  {
    id: "entry-5",
    icon: IconCoin,
    nameKey: "integration2Tool5Name",
    blurbKey: "integration2Tool5Blurb",
    category: "finance",
    categoryKey: "integration2CategoryFinance",
    popular: true,
  },
  {
    id: "entry-6",
    icon: IconReportMoney,
    nameKey: "integration2Tool6Name",
    blurbKey: "integration2Tool6Blurb",
    category: "finance",
    categoryKey: "integration2CategoryFinance",
  },
  {
    id: "entry-7",
    icon: IconChartBar,
    nameKey: "integration2Tool7Name",
    blurbKey: "integration2Tool7Blurb",
    category: "analytics",
    categoryKey: "integration2CategoryAnalytics",
  },
  {
    id: "entry-8",
    icon: IconChartDots3,
    nameKey: "integration2Tool8Name",
    blurbKey: "integration2Tool8Blurb",
    category: "analytics",
    categoryKey: "integration2CategoryAnalytics",
  },
  {
    id: "entry-9",
    icon: IconTerminal2,
    nameKey: "integration2Tool9Name",
    blurbKey: "integration2Tool9Blurb",
    category: "developer",
    categoryKey: "integration2CategoryDeveloper",
    popular: true,
  },
  {
    id: "entry-10",
    icon: IconGitBranch,
    nameKey: "integration2Tool10Name",
    blurbKey: "integration2Tool10Blurb",
    category: "developer",
    categoryKey: "integration2CategoryDeveloper",
  },
];

export function SearchableDirectoryGridIntegration() {
  const t = useMessages("pages") as unknown as PagesWithIntegrationMessages;
  const ig = t.integration;
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");

  const filters: { id: CategoryFilter; labelKey: string }[] = [
    { id: "all", labelKey: "integration2CategoryAll" },
    { id: "productivity", labelKey: "integration2CategoryProductivity" },
    { id: "communication", labelKey: "integration2CategoryCommunication" },
    { id: "finance", labelKey: "integration2CategoryFinance" },
    { id: "analytics", labelKey: "integration2CategoryAnalytics" },
    { id: "developer", labelKey: "integration2CategoryDeveloper" },
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ENTRIES.filter((entry) => {
      const matchesCategory = category === "all" || entry.category === category;
      if (!matchesCategory) return false;
      if (!q) return true;
      return ig[entry.nameKey].toLowerCase().includes(q);
    });
  }, [query, category, ig]);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {ig.integration2Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {ig.integration2Heading}
          </h2>
          <p className="text-muted leading-relaxed">{ig.integration2Intro}</p>
        </div>

        <div className="mt-10 flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full max-w-xs">
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={ig.integration2SearchPlaceholder}
                leftIcon={<IconSearch size={16} />}
                aria-label={ig.integration2SearchAria}
              />
            </div>
            <span className="text-muted text-xs">
              {ig.integration2CountTemplate
                .replace("{count}", String(filtered.length))
                .replace("{total}", String(ENTRIES.length))}
            </span>
          </div>

          <ToggleGroup
            type="single"
            value={category}
            onValueChange={(value) => {
              if (value) setCategory(value as CategoryFilter);
            }}
            aria-label={ig.integration2FilterAria}
            className="flex-wrap"
          >
            {filters.map((f) => (
              <ToggleGroupItem key={f.id} value={f.id} size="sm">
                {ig[f.labelKey]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {filtered.length === 0 ? (
          <div className="border-border mt-10 flex flex-col items-start gap-3 rounded-lg border border-dashed p-8">
            <p className="text-fg text-sm font-semibold">
              {ig.integration2EmptyTitle}
            </p>
            <p className="text-muted text-sm">{ig.integration2EmptyBody}</p>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
            >
              {ig.integration2ClearSearch}
            </Button>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((entry) => (
              <Card key={entry.id} variant="default">
                <div className="flex flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="border-border bg-surface flex size-10 shrink-0 items-center justify-center rounded-lg border">
                      <entry.icon
                        size={20}
                        aria-hidden="true"
                        className="text-fg"
                      />
                    </span>
                    {entry.popular ? (
                      <Badge variant="soft" size="sm">
                        {ig.integration2PopularBadge}
                      </Badge>
                    ) : null}
                  </div>
                  <div>
                    <p className="text-fg text-sm font-semibold">
                      {ig[entry.nameKey]}
                    </p>
                    <p className="text-muted mt-1 text-xs leading-relaxed">
                      {ig[entry.blurbKey]}
                    </p>
                  </div>
                  <Badge variant="outline" size="sm" className="w-fit">
                    {ig[entry.categoryKey]}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
