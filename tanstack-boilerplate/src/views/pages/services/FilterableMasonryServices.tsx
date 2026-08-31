"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { BadgeVariant } from "@/types/ui/Badge-types";
import type { PagesWithServicesMessages } from "@/types/pages/services/ServicesMessages-types";

type Category = "design" | "development" | "growth";
type CategoryFilter = "all" | Category;

interface ServiceCard {
  id: string;
  category: Category;
  categoryLabelKey: string;
  categoryVariant: BadgeVariant;
  nameKey: string;
  descriptionKey: string;
}

const SERVICES: ServiceCard[] = [
  {
    id: "brand-systems",
    category: "design",
    categoryLabelKey: "services6FilterDesign",
    categoryVariant: "info",
    nameKey: "services6Service1Name",
    descriptionKey: "services6Service1Description",
  },
  {
    id: "design-systems",
    category: "design",
    categoryLabelKey: "services6FilterDesign",
    categoryVariant: "info",
    nameKey: "services6Service2Name",
    descriptionKey: "services6Service2Description",
  },
  {
    id: "frontend-builds",
    category: "development",
    categoryLabelKey: "services6FilterDevelopment",
    categoryVariant: "success",
    nameKey: "services6Service3Name",
    descriptionKey: "services6Service3Description",
  },
  {
    id: "platform-engineering",
    category: "development",
    categoryLabelKey: "services6FilterDevelopment",
    categoryVariant: "success",
    nameKey: "services6Service4Name",
    descriptionKey: "services6Service4Description",
  },
  {
    id: "integrations",
    category: "development",
    categoryLabelKey: "services6FilterDevelopment",
    categoryVariant: "success",
    nameKey: "services6Service5Name",
    descriptionKey: "services6Service5Description",
  },
  {
    id: "lifecycle-marketing",
    category: "growth",
    categoryLabelKey: "services6FilterGrowth",
    categoryVariant: "warning",
    nameKey: "services6Service6Name",
    descriptionKey: "services6Service6Description",
  },
  {
    id: "seo-content",
    category: "growth",
    categoryLabelKey: "services6FilterGrowth",
    categoryVariant: "warning",
    nameKey: "services6Service7Name",
    descriptionKey: "services6Service7Description",
  },
];

const FILTERS: { id: CategoryFilter; labelKey: string }[] = [
  { id: "all", labelKey: "services6FilterAll" },
  { id: "design", labelKey: "services6FilterDesign" },
  { id: "development", labelKey: "services6FilterDevelopment" },
  { id: "growth", labelKey: "services6FilterGrowth" },
];

export function FilterableMasonryServices() {
  const t = useMessages("pages") as unknown as PagesWithServicesMessages;
  const s = t.services;
  const [filter, setFilter] = useState<CategoryFilter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return SERVICES;
    return SERVICES.filter((service) => service.category === filter);
  }, [filter]);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {s.services6Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {s.services6Heading}
          </h2>
        </div>

        <div className="mt-8 flex justify-center">
          <ToggleGroup
            type="single"
            value={filter}
            onValueChange={(value) => {
              if (value) setFilter(value as CategoryFilter);
            }}
            aria-label={s.services6FilterGroupAria}
          >
            {FILTERS.map((f) => (
              <ToggleGroupItem key={f.id} value={f.id} size="sm">
                {s[f.labelKey]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="mt-10 columns-1 gap-6 sm:columns-2 lg:columns-3">
          {filtered.map((service) => (
            <div
              key={service.id}
              className="border-border bg-bg mb-6 flex break-inside-avoid flex-col gap-3 rounded-xl border p-6"
            >
              <Badge variant={service.categoryVariant} size="sm" className="w-fit">
                {s[service.categoryLabelKey]}
              </Badge>
              <h3 className="text-fg text-base font-semibold">{s[service.nameKey]}</h3>
              <p className="text-muted text-sm leading-relaxed">
                {s[service.descriptionKey]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
