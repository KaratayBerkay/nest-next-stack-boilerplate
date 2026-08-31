"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Badge } from "@/components/ui/Badge";
import { Typography } from "@/components/ui/Typography";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithProjectsMessages } from "@/types/pages/projects/ProjectsMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const LINK_URL = "https://example.com" as const;

type Discipline = "product" | "brand" | "motion" | "web";
type DisciplineFilter = "all" | Discipline;

interface ShowcaseItem {
  id: string;
  discipline: Discipline;
  titleKey: string;
  altKey: string;
  imageSeed: string;
  stackKeys: string[];
}

const ITEMS: ShowcaseItem[] = [
  {
    id: "showcase-1",
    discipline: "product",
    titleKey: "projects2Item1Title",
    altKey: "projects2Item1Alt",
    imageSeed: "projects-filter-1",
    stackKeys: ["projects2StackReact", "projects2StackTailwind"],
  },
  {
    id: "showcase-2",
    discipline: "brand",
    titleKey: "projects2Item2Title",
    altKey: "projects2Item2Alt",
    imageSeed: "projects-filter-2",
    stackKeys: ["projects2StackFigma", "projects2StackIllustrator"],
  },
  {
    id: "showcase-3",
    discipline: "motion",
    titleKey: "projects2Item3Title",
    altKey: "projects2Item3Alt",
    imageSeed: "projects-filter-3",
    stackKeys: ["projects2StackAfterEffects", "projects2StackBlender"],
  },
  {
    id: "showcase-4",
    discipline: "web",
    titleKey: "projects2Item4Title",
    altKey: "projects2Item4Alt",
    imageSeed: "projects-filter-4",
    stackKeys: ["projects2StackNextjs", "projects2StackTypescript"],
  },
  {
    id: "showcase-5",
    discipline: "product",
    titleKey: "projects2Item5Title",
    altKey: "projects2Item5Alt",
    imageSeed: "projects-filter-5",
    stackKeys: ["projects2StackFigma", "projects2StackReact"],
  },
  {
    id: "showcase-6",
    discipline: "web",
    titleKey: "projects2Item6Title",
    altKey: "projects2Item6Alt",
    imageSeed: "projects-filter-6",
    stackKeys: ["projects2StackNextjs", "projects2StackTailwind"],
  },
  {
    id: "showcase-7",
    discipline: "brand",
    titleKey: "projects2Item7Title",
    altKey: "projects2Item7Alt",
    imageSeed: "projects-filter-7",
    stackKeys: ["projects2StackIllustrator", "projects2StackFigma"],
  },
  {
    id: "showcase-8",
    discipline: "motion",
    titleKey: "projects2Item8Title",
    altKey: "projects2Item8Alt",
    imageSeed: "projects-filter-8",
    stackKeys: ["projects2StackBlender", "projects2StackAfterEffects"],
  },
];

const FILTERS: { id: DisciplineFilter; labelKey: string }[] = [
  { id: "all", labelKey: "projects2FilterAll" },
  { id: "product", labelKey: "projects2FilterProduct" },
  { id: "brand", labelKey: "projects2FilterBrand" },
  { id: "motion", labelKey: "projects2FilterMotion" },
  { id: "web", labelKey: "projects2FilterWeb" },
];

export function FilterableTagShowcaseProjects() {
  const t = useMessages("pages") as unknown as PagesWithProjectsMessages;
  const pr = t.projects;
  const [filter, setFilter] = useState<DisciplineFilter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return ITEMS;
    return ITEMS.filter((item) => item.discipline === filter);
  }, [filter]);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {pr.projects2Eyebrow}
          </span>
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {pr.projects2Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {pr.projects2Intro}
          </Typography>
        </div>

        <div className="flex justify-center">
          <ToggleGroup
            type="single"
            value={filter}
            onValueChange={(value) => {
              if (value) setFilter(value as DisciplineFilter);
            }}
            aria-label={pr.projects2FilterGroupAria}
          >
            {FILTERS.map((f) => (
              <ToggleGroupItem key={f.id} value={f.id} size="sm">
                {pr[f.labelKey]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <a
              key={item.id}
              href={LINK_URL}
              className="group flex flex-col gap-3"
            >
              <AspectRatio
                ratio={4 / 3}
                className="bg-surface relative overflow-hidden rounded-xl"
              >
                <Image
                  src={placeholderImage(item.imageSeed, "4x3")}
                  alt={pr[item.altKey]}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="bg-fg/0 group-hover:bg-fg/20 absolute inset-0 transition-colors duration-300" />
              </AspectRatio>
              <div className="flex flex-wrap items-center gap-2">
                <Typography
                  variant="h3"
                  className="text-fg text-base font-medium tracking-tight"
                >
                  {pr[item.titleKey]}
                </Typography>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {item.stackKeys.map((stackKey) => (
                  <Badge key={stackKey} variant="outline" size="sm">
                    {pr[stackKey]}
                  </Badge>
                ))}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
