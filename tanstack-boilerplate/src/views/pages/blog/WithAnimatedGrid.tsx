"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  BlogAnimatedCardProps,
  BlogMessages,
  BlogPost,
} from "@/types/pages/blog/BlogBlock-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
const LINK_URL = "https://example.com" as const;

const FEATURED_POST: BlogPost = {
  titleKey: "blog31FeaturedTitle",
  excerptKey: "blog31FeaturedExcerpt",
  categoryKey: "blog31FeaturedCategory",
  dateKey: "blog31FeaturedDate",
  seed: "blog31-featured",
};

const GRID_POSTS: BlogPost[] = [
  {
    titleKey: "blog31Post1Title",
    excerptKey: "blog31Post1Excerpt",
    categoryKey: "blog31Category1",
    dateKey: "blog31Post1Date",
    seed: "blog31-1",
  },
  {
    titleKey: "blog31Post2Title",
    excerptKey: "blog31Post2Excerpt",
    categoryKey: "blog31Category2",
    dateKey: "blog31Post2Date",
    seed: "blog31-2",
  },
  {
    titleKey: "blog31Post3Title",
    excerptKey: "blog31Post3Excerpt",
    categoryKey: "blog31Category3",
    dateKey: "blog31Post3Date",
    seed: "blog31-3",
  },
  {
    titleKey: "blog31Post4Title",
    excerptKey: "blog31Post4Excerpt",
    categoryKey: "blog31Category2",
    dateKey: "blog31Post4Date",
    seed: "blog31-4",
  },
  {
    titleKey: "blog31Post5Title",
    excerptKey: "blog31Post5Excerpt",
    categoryKey: "blog31Category1",
    dateKey: "blog31Post5Date",
    seed: "blog31-5",
  },
];

const GRID_SIZES = "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw";

function featuredDelay(index: number): CSSProperties {
  return {
    animationDelay: `${index * 90}ms`,
    animationFillMode: "backwards",
  };
}

function BlogCard({ post, t, index }: BlogAnimatedCardProps) {
  return (
    <article
      className="animate-fade-in-up group flex flex-col gap-4 motion-reduce:animate-none"
      style={featuredDelay(index)}
    >
      <a href={LINK_URL} className="block">
        <AspectRatio ratio={4 / 3} className="bg-surface relative rounded-2xl">
          <Image
            src={placeholderImage(post.seed, "4x3")}
            alt={t[post.titleKey]}
            fill
            sizes={GRID_SIZES}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </AspectRatio>
      </a>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {post.categoryKey && (
            <span className="text-brand text-xs font-semibold tracking-wider uppercase">
              {t[post.categoryKey]}
            </span>
          )}
          <span className="text-muted text-xs">{t[post.dateKey]}</span>
        </div>
        <a href={LINK_URL}>
          <Typography
            variant="h3"
            className="group-hover:text-brand text-xl font-medium tracking-tight transition-colors"
          >
            {t[post.titleKey]}
          </Typography>
        </a>
        {post.excerptKey && (
          <Typography variant="bodySmall" className="text-muted line-clamp-2">
            {t[post.excerptKey]}
          </Typography>
        )}
      </div>
    </article>
  );
}

export function WithAnimatedGrid() {
  const t = useMessages("pages").blog as unknown as BlogMessages;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 lg:px-8">
        <div className="animate-fade-in-up flex max-w-2xl flex-col gap-4 motion-reduce:animate-none">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blog31Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {t.blog31Description}
          </Typography>
        </div>

        <article className="animate-fade-in-up group flex flex-col gap-5 motion-reduce:animate-none">
          <a href={LINK_URL} className="block">
            <AspectRatio
              ratio={21 / 9}
              className="bg-surface relative rounded-2xl"
            >
              <Image
                src={placeholderImage(FEATURED_POST.seed, "2x1")}
                alt={t[FEATURED_POST.titleKey]}
                fill
                sizes="(max-width: 768px) 100vw, 80vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </AspectRatio>
          </a>
          <div className="flex max-w-2xl flex-col gap-2">
            <div className="flex items-center gap-2">
              {FEATURED_POST.categoryKey && (
                <span className="text-brand text-xs font-semibold tracking-wider uppercase">
                  {t[FEATURED_POST.categoryKey]}
                </span>
              )}
              <span className="text-muted text-xs">
                {t[FEATURED_POST.dateKey]}
              </span>
            </div>
            <a href={LINK_URL}>
              <Typography
                variant="h3"
                className="group-hover:text-brand text-2xl font-medium tracking-tighter transition-colors md:text-3xl"
              >
                {t[FEATURED_POST.titleKey]}
              </Typography>
            </a>
            {FEATURED_POST.excerptKey && (
              <Typography variant="body" className="text-muted">
                {t[FEATURED_POST.excerptKey]}
              </Typography>
            )}
          </div>
        </article>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {GRID_POSTS.map((post, index) => (
            <BlogCard key={post.titleKey} post={post} t={t} index={index + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
