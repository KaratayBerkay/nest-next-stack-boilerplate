"use client";

import { useState } from "react";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithProjectsMessages } from "@/types/pages/projects/ProjectsMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

interface PreviewItem {
  id: string;
  nameKey: string;
  categoryKey: string;
  yearKey: string;
  altKey: string;
  imageSeed: string;
}

const ITEMS: PreviewItem[] = [
  {
    id: "preview-1",
    nameKey: "projects4Item1Name",
    categoryKey: "projects4Item1Category",
    yearKey: "projects4Item1Year",
    altKey: "projects4Item1Alt",
    imageSeed: "projects-preview-1",
  },
  {
    id: "preview-2",
    nameKey: "projects4Item2Name",
    categoryKey: "projects4Item2Category",
    yearKey: "projects4Item2Year",
    altKey: "projects4Item2Alt",
    imageSeed: "projects-preview-2",
  },
  {
    id: "preview-3",
    nameKey: "projects4Item3Name",
    categoryKey: "projects4Item3Category",
    yearKey: "projects4Item3Year",
    altKey: "projects4Item3Alt",
    imageSeed: "projects-preview-3",
  },
  {
    id: "preview-4",
    nameKey: "projects4Item4Name",
    categoryKey: "projects4Item4Category",
    yearKey: "projects4Item4Year",
    altKey: "projects4Item4Alt",
    imageSeed: "projects-preview-4",
  },
  {
    id: "preview-5",
    nameKey: "projects4Item5Name",
    categoryKey: "projects4Item5Category",
    yearKey: "projects4Item5Year",
    altKey: "projects4Item5Alt",
    imageSeed: "projects-preview-5",
  },
];

export function HoverPreviewProjectListProjects() {
  const t = useMessages("pages") as unknown as PagesWithProjectsMessages;
  const pr = t.projects;
  const [activeId, setActiveId] = useState<string>(ITEMS[0].id);

  const active = ITEMS.find((item) => item.id === activeId) ?? ITEMS[0];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {pr.projects4Eyebrow}
          </span>
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {pr.projects4Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {pr.projects4Intro}
          </Typography>
        </div>

        <div className="grid gap-10 lg:grid-cols-5 lg:gap-12">
          <ul
            className="border-border divide-border divide-y border-t lg:col-span-2"
            aria-label={pr.projects4ListAria}
          >
            {ITEMS.map((item) => {
              const isActive = item.id === activeId;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-pressed={isActive}
                    onMouseEnter={() => setActiveId(item.id)}
                    onFocus={() => setActiveId(item.id)}
                    onClick={() => setActiveId(item.id)}
                    className={cn(
                      "flex w-full items-baseline justify-between gap-4 py-5 text-left transition-colors",
                      isActive ? "text-fg" : "text-muted hover:text-fg",
                    )}
                  >
                    <span className="flex flex-col gap-1">
                      <span className="text-lg font-medium tracking-tight">
                        {pr[item.nameKey]}
                      </span>
                      <span className="text-muted text-sm">
                        {pr[item.categoryKey]}
                      </span>
                    </span>
                    <span className="text-muted shrink-0 text-sm">
                      {pr[item.yearKey]}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="lg:col-span-3">
            <AspectRatio
              ratio={4 / 3}
              className="bg-surface relative overflow-hidden rounded-2xl"
            >
              <Image
                key={active.id}
                src={placeholderImage(active.imageSeed, "4x3")}
                alt={pr[active.altKey]}
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />
            </AspectRatio>
          </div>
        </div>
      </div>
    </section>
  );
}
