"use client";

import Image from "next/image";
import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { IconArrowRight, IconArrowUpRight } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  BlogCategory,
  BlogMessages,
  BlogPost,
  BlogSpotlightCardProps,
  BlogCardProps,
} from "@/types/pages/blog/BlogBlock-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
const LINK_URL = "https://example.com" as const;

const ALL_FILTER = "all";

const CATEGORIES: BlogCategory[] = [
  { id: "blog27Category1", labelKey: "blog27Category1" },
  { id: "blog27Category2", labelKey: "blog27Category2" },
  { id: "blog27Category3", labelKey: "blog27Category3" },
];

const FEATURED_POST: BlogPost = {
  titleKey: "blog27FeaturedTitle",
  excerptKey: "blog27FeaturedExcerpt",
  categoryKey: "blog27Category1",
  dateKey: "blog27FeaturedDate",
  seed: "blog27-featured",
};

const GRID_POSTS: BlogPost[] = [
  {
    titleKey: "blog27Post1Title",
    excerptKey: "blog27Post1Excerpt",
    categoryKey: "blog27Category2",
    dateKey: "blog27Post1Date",
    seed: "blog27-1",
  },
  {
    titleKey: "blog27Post2Title",
    excerptKey: "blog27Post2Excerpt",
    categoryKey: "blog27Category1",
    dateKey: "blog27Post2Date",
    seed: "blog27-2",
  },
  {
    titleKey: "blog27Post3Title",
    excerptKey: "blog27Post3Excerpt",
    categoryKey: "blog27Category2",
    dateKey: "blog27Post3Date",
    seed: "blog27-3",
  },
  {
    titleKey: "blog27Post4Title",
    excerptKey: "blog27Post4Excerpt",
    categoryKey: "blog27Category3",
    dateKey: "blog27Post4Date",
    seed: "blog27-4",
  },
  {
    titleKey: "blog27Post5Title",
    excerptKey: "blog27Post5Excerpt",
    categoryKey: "blog27Category2",
    dateKey: "blog27Post5Date",
    seed: "blog27-5",
  },
  {
    titleKey: "blog27Post6Title",
    excerptKey: "blog27Post6Excerpt",
    categoryKey: "blog27Category3",
    dateKey: "blog27Post6Date",
    seed: "blog27-6",
  },
];

const DOT_PATTERN = {
  backgroundImage:
    "radial-gradient(color-mix(in srgb, var(--fg) 8%, transparent) 1px, transparent 1px)",
  backgroundSize: "24px 24px",
} as const;

const CARD_SIZES = "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw";

function handleFilterSelect(
  filter: string,
  setActive: Dispatch<SetStateAction<string>>,
) {
  setActive(filter);
}

function SpotlightCard({ post, t }: BlogSpotlightCardProps) {
  return (
    <a
      href={LINK_URL}
      className="border-border bg-surface group grid overflow-hidden rounded-2xl border md:grid-cols-2"
    >
      <AspectRatio ratio={16 / 10} className="bg-surface relative">
        <Image
          src={placeholderImage(post.seed, "3x2")}
          alt={t[post.titleKey]}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </AspectRatio>
      <div className="flex flex-col justify-center gap-3 p-6 lg:p-10">
        <div className="flex items-center gap-2">
          {post.categoryKey && (
            <span className="text-brand text-xs font-semibold tracking-wider uppercase">
              {t[post.categoryKey]}
            </span>
          )}
          <span className="text-muted text-xs">{t[post.dateKey]}</span>
        </div>
        <Typography
          variant="h3"
          className="text-2xl font-medium tracking-tighter md:text-3xl"
        >
          {t[post.titleKey]}
        </Typography>
        {post.excerptKey && (
          <Typography variant="body" className="text-muted max-w-md">
            {t[post.excerptKey]}
          </Typography>
        )}
        <span className="text-brand mt-2 flex items-center gap-1 text-sm font-medium">
          {t.blog27ReadMore}
          <IconArrowUpRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </div>
    </a>
  );
}

function BlogCard({ post, t }: BlogCardProps) {
  return (
    <a href={LINK_URL} className="group flex flex-col gap-4">
      <AspectRatio ratio={4 / 3} className="bg-surface relative rounded-2xl">
        <Image
          src={placeholderImage(post.seed, "4x3")}
          alt={t[post.titleKey]}
          fill
          sizes={CARD_SIZES}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </AspectRatio>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {post.categoryKey && (
            <span className="text-brand text-xs font-semibold tracking-wider uppercase">
              {t[post.categoryKey]}
            </span>
          )}
          <span className="text-muted text-xs">{t[post.dateKey]}</span>
        </div>
        <Typography variant="h3" className="text-xl font-medium tracking-tight">
          {t[post.titleKey]}
        </Typography>
        {post.excerptKey && (
          <Typography variant="bodySmall" className="text-muted">
            {t[post.excerptKey]}
          </Typography>
        )}
        <span className="text-brand mt-1 flex items-center gap-1 text-sm font-medium">
          {t.blog27ReadMore}
          <IconArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </a>
  );
}

export function WithSpotlightBandGrid() {
  const t = useMessages("pages").blog as unknown as BlogMessages;
  const [activeFilter, setActiveFilter] = useState(ALL_FILTER);

  const visiblePosts = GRID_POSTS.filter(
    (post) => activeFilter === ALL_FILTER || post.categoryKey === activeFilter,
  );

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 lg:px-8">
        <div className="border-border bg-surface relative overflow-hidden rounded-3xl border">
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={DOT_PATTERN}
          />
          <div className="relative flex flex-col gap-10 px-6 py-12 lg:px-12 lg:py-16">
            <div className="flex max-w-2xl flex-col gap-4">
              <Typography
                variant="h2"
                className="text-4xl font-medium tracking-tighter md:text-5xl"
              >
                {t.blog27Heading}
              </Typography>
              <Typography variant="bodyLarge" className="text-muted">
                {t.blog27Description}
              </Typography>
            </div>
            <SpotlightCard post={FEATURED_POST} t={t} />
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <Typography
              variant="h3"
              className="text-2xl font-medium tracking-tighter md:text-3xl"
            >
              {t.blog27GridHeading}
            </Typography>
            <div
              role="group"
              aria-label={t.blog27FilterLabel}
              className="flex flex-wrap gap-2"
            >
              <button
                type="button"
                aria-pressed={activeFilter === ALL_FILTER}
                onClick={() => handleFilterSelect(ALL_FILTER, setActiveFilter)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  activeFilter === ALL_FILTER
                    ? "bg-brand text-brand-fg"
                    : "border-border bg-surface text-muted hover:text-fg border",
                )}
              >
                {t.blog27AllLabel}
              </button>
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={activeFilter === category.id}
                  onClick={() =>
                    handleFilterSelect(category.id, setActiveFilter)
                  }
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    activeFilter === category.id
                      ? "bg-brand text-brand-fg"
                      : "border-border bg-surface text-muted hover:text-fg border",
                  )}
                >
                  {t[category.labelKey]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visiblePosts.map((post) => (
              <BlogCard key={post.titleKey} post={post} t={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
