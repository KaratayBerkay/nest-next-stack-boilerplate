"use client";

import Image from "next/image";
import { useState, type Dispatch, type SetStateAction } from "react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Badge } from "@/components/ui/Badge";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  Blog1Filter,
  Blog1Post,
} from "@/types/pages/blog/WithFilteredGrid-types";
const LINK_URL = "https://example.com" as const;

const FILTERS: Blog1Filter[] = [
  { value: "all", labelKey: "blog1FilterAll" },
  { value: "design", labelKey: "blog1CategoryDesign" },
  { value: "engineering", labelKey: "blog1CategoryEngineering" },
  { value: "product", labelKey: "blog1CategoryProduct" },
];

const POSTS: Blog1Post[] = [
  {
    titleKey: "blog1Post1Title",
    dateKey: "blog1Post1Date",
    categoryKey: "blog1CategoryDesign",
    categoryValue: "design",
    imageSeed: "blog1-1",
  },
  {
    titleKey: "blog1Post2Title",
    dateKey: "blog1Post2Date",
    categoryKey: "blog1CategoryEngineering",
    categoryValue: "engineering",
    imageSeed: "blog1-2",
  },
  {
    titleKey: "blog1Post3Title",
    dateKey: "blog1Post3Date",
    categoryKey: "blog1CategoryProduct",
    categoryValue: "product",
    imageSeed: "blog1-3",
  },
  {
    titleKey: "blog1Post4Title",
    dateKey: "blog1Post4Date",
    categoryKey: "blog1CategoryDesign",
    categoryValue: "design",
    imageSeed: "blog1-4",
  },
  {
    titleKey: "blog1Post5Title",
    dateKey: "blog1Post5Date",
    categoryKey: "blog1CategoryEngineering",
    categoryValue: "engineering",
    imageSeed: "blog1-5",
  },
  {
    titleKey: "blog1Post6Title",
    dateKey: "blog1Post6Date",
    categoryKey: "blog1CategoryProduct",
    categoryValue: "product",
    imageSeed: "blog1-6",
  },
];

function filterPosts(posts: Blog1Post[], filter: string): Blog1Post[] {
  if (filter === "all") return posts;
  return posts.filter((post) => post.categoryValue === filter);
}

function handleFilterChange(
  setFilter: Dispatch<SetStateAction<string>>,
  filter: string,
) {
  setFilter(filter);
}

export function WithFilteredGrid() {
  const t = useMessages("pages").blog;
  const [activeFilter, setActiveFilter] = useState("all");
  const visiblePosts = filterPosts(POSTS, activeFilter);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 lg:px-8">
        <div className="flex flex-col gap-6">
          <Typography
            variant="h2"
            className="max-w-2xl text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blog1Heading}
          </Typography>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                aria-pressed={activeFilter === filter.value}
                onClick={() =>
                  handleFilterChange(setActiveFilter, filter.value)
                }
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  activeFilter === filter.value
                    ? "bg-brand text-brand-fg"
                    : "text-muted hover:bg-surface hover:text-fg",
                )}
              >
                {t[filter.labelKey]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visiblePosts.map((post) => (
            <article
              key={post.titleKey}
              className="border-border bg-surface group flex flex-col overflow-hidden rounded-2xl border transition hover:shadow-md"
            >
              <AspectRatio ratio={3 / 2}>
                <Image
                  src={`https://picsum.photos/seed/${post.imageSeed}/800/500`}
                  alt={t[post.titleKey]}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </AspectRatio>
              <div className="flex flex-col gap-3 p-6">
                <Badge variant="outline" size="sm" className="w-fit">
                  {t[post.categoryKey]}
                </Badge>
                <h3 className="text-lg font-medium tracking-tight">
                  <a
                    href={LINK_URL}
                    className="group-hover:text-brand transition-colors"
                  >
                    {t[post.titleKey]}
                  </a>
                </h3>
                <Typography variant="caption">{t[post.dateKey]}</Typography>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
