"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  SidebarCategory,
  SidebarCategoryId,
  SidebarCategoryLabelKey,
  SidebarPost,
  SidebarPostCategoryId,
} from "@/types/pages/blog/WithSidebarFilters-types";

const POST_URL = "https://example.com" as const;

const CATEGORIES: SidebarCategory[] = [
  { id: "all", labelKey: "blog17AllCategory" },
  { id: "design", labelKey: "blog17CategoryDesign" },
  { id: "engineering", labelKey: "blog17CategoryEngineering" },
  { id: "product", labelKey: "blog17CategoryProduct" },
  { id: "company", labelKey: "blog17CategoryCompany" },
];

const POSTS: SidebarPost[] = [
  {
    categoryId: "design",
    titleKey: "blog17Post1Title",
    excerptKey: "blog17Post1Excerpt",
    authorKey: "blog17Author1",
    dateKey: "blog17Post1Date",
  },
  {
    categoryId: "engineering",
    titleKey: "blog17Post2Title",
    excerptKey: "blog17Post2Excerpt",
    authorKey: "blog17Author2",
    dateKey: "blog17Post2Date",
  },
  {
    categoryId: "product",
    titleKey: "blog17Post3Title",
    excerptKey: "blog17Post3Excerpt",
    authorKey: "blog17Author3",
    dateKey: "blog17Post3Date",
  },
  {
    categoryId: "company",
    titleKey: "blog17Post4Title",
    excerptKey: "blog17Post4Excerpt",
    authorKey: "blog17Author4",
    dateKey: "blog17Post4Date",
  },
  {
    categoryId: "design",
    titleKey: "blog17Post5Title",
    excerptKey: "blog17Post5Excerpt",
    authorKey: "blog17Author1",
    dateKey: "blog17Post5Date",
  },
  {
    categoryId: "engineering",
    titleKey: "blog17Post6Title",
    excerptKey: "blog17Post6Excerpt",
    authorKey: "blog17Author2",
    dateKey: "blog17Post6Date",
  },
  {
    categoryId: "product",
    titleKey: "blog17Post7Title",
    excerptKey: "blog17Post7Excerpt",
    authorKey: "blog17Author3",
    dateKey: "blog17Post7Date",
  },
];

function handleCategorySelect(
  id: SidebarCategoryId,
  setActive: Dispatch<SetStateAction<SidebarCategoryId>>,
) {
  setActive(id);
}

function categoryLabelKey(
  categoryId: SidebarPostCategoryId,
): SidebarCategoryLabelKey {
  const category = CATEGORIES.find((c) => c.id === categoryId);
  return category ? category.labelKey : "blog17CategoryDesign";
}

export function WithSidebarFilters() {
  const t = useMessages("pages").blog;
  const [active, setActive] = useState<SidebarCategoryId>("all");

  const visiblePosts = POSTS.filter(
    (post) => active === "all" || post.categoryId === active,
  );

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col px-4 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Badge variant="soft" pill className="w-fit">
            {t.blog17Badge}
          </Badge>
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blog17Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {t.blog17Intro}
          </Typography>
        </div>

        <div className="mt-10 flex flex-wrap gap-2 lg:hidden">
          {CATEGORIES.map((category) => {
            const isActive = category.id === active;
            return (
              <Button
                key={category.id}
                type="button"
                size="sm"
                variant={isActive ? "secondary" : "ghost"}
                aria-pressed={isActive}
                onClick={() => handleCategorySelect(category.id, setActive)}
              >
                {t[category.labelKey]}
              </Button>
            );
          })}
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-16">
          <aside className="hidden flex-col gap-1 lg:sticky lg:top-8 lg:flex lg:self-start">
            {CATEGORIES.map((category) => {
              const isActive = category.id === active;
              return (
                <Button
                  key={category.id}
                  type="button"
                  variant={isActive ? "secondary" : "ghost"}
                  className="justify-start"
                  aria-pressed={isActive}
                  onClick={() => handleCategorySelect(category.id, setActive)}
                >
                  {t[category.labelKey]}
                </Button>
              );
            })}
          </aside>

          <div className="divide-border flex flex-col divide-y">
            {visiblePosts.map((post) => (
              <article
                key={post.titleKey}
                className="flex flex-col gap-2 py-6 first:pt-0"
              >
                <span className="text-brand text-xs font-semibold tracking-wider uppercase">
                  {t[categoryLabelKey(post.categoryId)]}
                </span>
                <a
                  href={POST_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand text-xl font-semibold tracking-tight transition-colors"
                >
                  {t[post.titleKey]}
                </a>
                <Typography variant="body" className="text-muted">
                  {t[post.excerptKey]}
                </Typography>
                <div className="flex items-center gap-2">
                  <span className="text-muted text-sm">
                    {t[post.authorKey]}
                  </span>
                  <span className="text-muted">·</span>
                  <span className="text-muted text-sm">{t[post.dateKey]}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
