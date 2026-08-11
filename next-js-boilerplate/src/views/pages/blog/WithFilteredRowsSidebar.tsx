"use client";

import Image from "next/image";
import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { IconArrowRight } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Badge } from "@/components/ui/Badge";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  BlogCategory,
  BlogMessages,
  BlogPost,
} from "@/types/pages/blog/BlogBlock-types";
const LINK_URL = "https://example.com" as const;

const ALL_TOPICS = "all";

const CATEGORIES: BlogCategory[] = [
  { id: ALL_TOPICS, labelKey: "blog37AllTopics" },
  { id: "blog37Category1", labelKey: "blog37Category1" },
  { id: "blog37Category2", labelKey: "blog37Category2" },
  { id: "blog37Category3", labelKey: "blog37Category3" },
  { id: "blog37Category4", labelKey: "blog37Category4" },
];

const POSTS: BlogPost[] = [
  {
    titleKey: "blog37Post1Title",
    excerptKey: "blog37Post1Excerpt",
    categoryKey: "blog37Category1",
    dateKey: "blog37Post1Date",
    seed: "blog37-1",
  },
  {
    titleKey: "blog37Post2Title",
    excerptKey: "blog37Post2Excerpt",
    categoryKey: "blog37Category2",
    dateKey: "blog37Post2Date",
    seed: "blog37-2",
  },
  {
    titleKey: "blog37Post3Title",
    excerptKey: "blog37Post3Excerpt",
    categoryKey: "blog37Category3",
    dateKey: "blog37Post3Date",
    seed: "blog37-3",
  },
  {
    titleKey: "blog37Post4Title",
    excerptKey: "blog37Post4Excerpt",
    categoryKey: "blog37Category4",
    dateKey: "blog37Post4Date",
    seed: "blog37-4",
  },
  {
    titleKey: "blog37Post5Title",
    excerptKey: "blog37Post5Excerpt",
    categoryKey: "blog37Category1",
    dateKey: "blog37Post5Date",
    seed: "blog37-5",
  },
  {
    titleKey: "blog37Post6Title",
    excerptKey: "blog37Post6Excerpt",
    categoryKey: "blog37Category2",
    dateKey: "blog37Post6Date",
    seed: "blog37-6",
  },
  {
    titleKey: "blog37Post7Title",
    excerptKey: "blog37Post7Excerpt",
    categoryKey: "blog37Category3",
    dateKey: "blog37Post7Date",
    seed: "blog37-7",
  },
];

const THUMB_SIZES = "(max-width: 768px) 100vw, (max-width: 1024px) 40vw, 260px";

function handleFilterSelect(
  categoryId: string,
  setActive: Dispatch<SetStateAction<string>>,
) {
  setActive(categoryId);
}

export function WithFilteredRowsSidebar() {
  const t = useMessages("pages").blog as unknown as BlogMessages;
  const [activeCategory, setActiveCategory] = useState(ALL_TOPICS);

  const visiblePosts = POSTS.filter(
    (post) =>
      activeCategory === ALL_TOPICS || post.categoryKey === activeCategory,
  );

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[280px_1fr] lg:gap-16 lg:px-8">
        <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:h-fit">
          <div className="flex flex-col gap-3">
            <Typography
              variant="h2"
              className="text-3xl font-medium tracking-tighter md:text-4xl"
            >
              {t.blog37Heading}
            </Typography>
            <Typography variant="body" className="text-muted">
              {t.blog37Description}
            </Typography>
          </div>
          <div
            role="group"
            aria-label={t.blog37CategoryLabel}
            className="flex flex-wrap gap-2 lg:flex-col lg:gap-1"
          >
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                aria-pressed={activeCategory === category.id}
                onClick={() =>
                  handleFilterSelect(category.id, setActiveCategory)
                }
                className={cn(
                  "rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                  activeCategory === category.id
                    ? "bg-muted text-fg"
                    : "text-muted hover:bg-surface-hover hover:text-fg",
                )}
              >
                {t[category.labelKey]}
              </button>
            ))}
          </div>
        </aside>

        <div className="divide-border flex flex-col divide-y">
          {visiblePosts.map((post) => (
            <article
              key={post.titleKey}
              className="grid gap-4 py-6 sm:grid-cols-[220px_1fr] sm:gap-6"
            >
              <a href={LINK_URL} className="group block">
                <AspectRatio
                  ratio={4 / 3}
                  className="bg-surface border-border relative rounded-xl border"
                >
                  <Image
                    src={`https://picsum.photos/seed/${post.seed}/640/480`}
                    alt={t[post.titleKey]}
                    fill
                    sizes={THUMB_SIZES}
                    className="object-cover transition-opacity duration-300 group-hover:opacity-80"
                  />
                </AspectRatio>
              </a>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  {post.categoryKey && (
                    <Badge variant="secondary" size="sm" pill>
                      {t[post.categoryKey]}
                    </Badge>
                  )}
                  <span className="text-muted text-xs">{t[post.dateKey]}</span>
                </div>
                <a href={LINK_URL} className="group/title">
                  <Typography
                    variant="h3"
                    className="group-hover/title:text-brand text-xl font-medium tracking-tight transition-colors"
                  >
                    {t[post.titleKey]}
                  </Typography>
                </a>
                {post.excerptKey && (
                  <Typography variant="bodySmall" className="text-muted">
                    {t[post.excerptKey]}
                  </Typography>
                )}
                <a
                  href={LINK_URL}
                  className="text-brand mt-auto flex items-center gap-1 text-sm font-medium"
                >
                  {t.blog37ReadMore}
                  <IconArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
