"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { IconClock } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Avatar } from "@/components/ui/Avatar";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithBlogPostMessages } from "@/types/pages/blog-post/BlogPostMessages-types";

const AUTHOR_AVATAR_URL = "/img/placeholders/ph-1x1-7.webp" as const;

function staggerDelay(index: number): CSSProperties {
  return {
    animationDelay: `${index * 120}ms`,
    animationFillMode: "backwards",
  };
}

export function WithAnimatedHeaderArticle() {
  const t = (useMessages("pages") as unknown as PagesWithBlogPostMessages)
    .blogPost;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-6">
            <span
              className="animate-fade-in-up text-brand text-xs font-semibold tracking-wider uppercase motion-reduce:animate-none"
              style={staggerDelay(0)}
            >
              {t.blogPost7Eyebrow}
            </span>
            <Typography
              variant="h2"
              className="animate-fade-in-up text-4xl font-medium tracking-tighter motion-reduce:animate-none md:text-5xl"
              style={staggerDelay(1)}
            >
              {t.blogPost7Heading}
            </Typography>
            <Typography
              variant="bodyLarge"
              className="animate-fade-in-up text-muted motion-reduce:animate-none"
              style={staggerDelay(2)}
            >
              {t.blogPost7Description1}
            </Typography>
            <Typography
              variant="body"
              className="animate-fade-in-up text-muted motion-reduce:animate-none"
              style={staggerDelay(3)}
            >
              {t.blogPost7Description2}
            </Typography>
            <div
              className="animate-fade-in-up flex items-center gap-3 motion-reduce:animate-none"
              style={staggerDelay(4)}
            >
              <Avatar
                src={AUTHOR_AVATAR_URL}
                alt={t.blogPost7AuthorAvatarAlt}
                fallback={t.blogPost7AuthorName.slice(0, 2)}
                size="lg"
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">
                  {t.blogPost7AuthorName}
                </span>
                <span className="text-muted text-xs">
                  {t.blogPost7AuthorRole} / {t.blogPost7Date}
                </span>
              </div>
            </div>
            <span
              className="animate-fade-in-up text-muted flex items-center gap-1.5 text-sm motion-reduce:animate-none"
              style={staggerDelay(5)}
            >
              <IconClock size={16} />
              {t.blogPost7ReadTime}
            </span>
          </div>

          <div className="animate-fade-in-up" style={staggerDelay(6)}>
            <AspectRatio
              ratio={4 / 3}
              className="bg-surface relative overflow-hidden rounded-2xl"
            >
              <Image
                src="/img/placeholders/ph-4x3-6.webp"
                alt={t.blogPost7ImageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </AspectRatio>
          </div>
        </div>
      </div>
    </section>
  );
}
