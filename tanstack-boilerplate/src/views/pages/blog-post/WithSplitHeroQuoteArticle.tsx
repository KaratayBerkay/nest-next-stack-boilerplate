"use client";

import Image from "next/image";
import { Avatar } from "@/components/ui/Avatar";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { BlogPostMessages } from "@/types/pages/blog-post/BlogPostMessages-types";
const AUTHOR_AVATAR_SRC = "/img/placeholders/ph-1x1-2.webp" as const;

export function WithSplitHeroQuoteArticle() {
  const t = (
    useMessages("pages") as unknown as {
      blogPost: BlogPostMessages;
    }
  ).blogPost;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {t.blogPost11Category}
          </span>
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blogPost11Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {t.blogPost11Lead}
          </Typography>
          <div className="border-border mt-2 flex flex-col gap-6 border-t pt-6">
            <div className="flex items-center gap-3">
              <Avatar
                src={AUTHOR_AVATAR_SRC}
                alt={t.blogPost11AuthorAvatarAlt}
                fallback={t.blogPost11AuthorInitials}
                size="md"
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {t.blogPost11AuthorName}
                </span>
                <span className="text-muted text-xs">
                  {t.blogPost11AuthorRole}
                </span>
              </div>
            </div>
            <time className="text-muted text-sm">{t.blogPost11Date}</time>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <AspectRatio
            ratio={4 / 3}
            className="bg-surface relative rounded-2xl"
          >
            <Image
              src="/img/placeholders/ph-4x3-2.webp"
              alt={t.blogPost11ImageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </AspectRatio>
          <div className="flex flex-col gap-6">
            <Typography variant="bodyLarge" className="leading-relaxed">
              {t.blogPost11Body1}
            </Typography>
            <figure className="border-brand my-2 border-l-4 pl-6">
              <blockquote className="text-2xl font-medium tracking-tight md:text-3xl">
                &ldquo;{t.blogPost11Quote}&rdquo;
              </blockquote>
              <figcaption className="text-muted mt-4 flex items-center gap-2 text-sm">
                <span aria-hidden="true">&mdash;</span>
                {t.blogPost11QuoteAuthor}
              </figcaption>
            </figure>
            <Typography variant="bodyLarge" className="leading-relaxed">
              {t.blogPost11Body2}
            </Typography>
          </div>
        </div>
      </div>
    </section>
  );
}
