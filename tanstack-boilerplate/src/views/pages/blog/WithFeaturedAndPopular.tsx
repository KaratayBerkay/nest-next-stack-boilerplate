"use client";

import Image from "next/image";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PopularPost } from "@/types/pages/blog/WithFeaturedAndPopular-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const POST_URL = "https://example.com" as const;

const POPULAR_POSTS: PopularPost[] = [
  {
    titleKey: "blog14Popular1Title",
    dateKey: "blog14Popular1Date",
    seed: "blog14-1",
  },
  {
    titleKey: "blog14Popular2Title",
    dateKey: "blog14Popular2Date",
    seed: "blog14-2",
  },
  {
    titleKey: "blog14Popular3Title",
    dateKey: "blog14Popular3Date",
    seed: "blog14-3",
  },
  {
    titleKey: "blog14Popular4Title",
    dateKey: "blog14Popular4Date",
    seed: "blog14-4",
  },
];

export function WithFeaturedAndPopular() {
  const t = useMessages("pages").blog;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blog14Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {t.blog14Intro}
          </Typography>
        </div>

        <div className="grid gap-12 md:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-5">
            <AspectRatio
              ratio={16 / 9}
              className="bg-surface relative overflow-hidden rounded-2xl"
            >
              <Image
                src="/img/placeholders/ph-16x9-7.webp"
                alt={t.blog14FeaturedTitle}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </AspectRatio>
            <Badge variant="secondary" pill className="w-fit">
              {t.blog14FeaturedCategory}
            </Badge>
            <Typography
              variant="h3"
              className="text-2xl font-medium tracking-tight"
            >
              <a
                href={POST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand transition-colors"
              >
                {t.blog14FeaturedTitle}
              </a>
            </Typography>
            <Typography variant="body" className="text-muted">
              {t.blog14FeaturedExcerpt}
            </Typography>
            <div className="flex items-center gap-3">
              <Avatar
                src="/img/placeholders/ph-1x1-0.webp"
                alt={t.blog14FeaturedAuthor}
                fallback="SC"
                size="sm"
              />
              <span className="text-sm font-medium">
                {t.blog14FeaturedAuthor}
              </span>
              <span className="text-muted text-sm">{t.blog14FeaturedDate}</span>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <Typography
              variant="h3"
              className="text-xl font-medium tracking-tight"
            >
              {t.blog14PopularHeading}
            </Typography>
            <div className="divide-border flex flex-col divide-y">
              {POPULAR_POSTS.map((post) => (
                <a
                  key={post.titleKey}
                  href={POST_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-5 py-5 first:pt-0 last:pb-0"
                >
                  <AspectRatio
                    ratio={1 / 1}
                    className="bg-surface relative w-16 shrink-0 overflow-hidden rounded-lg"
                  >
                    <Image
                      src={placeholderImage(post.seed, "1x1")}
                      alt={t[post.titleKey]}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </AspectRatio>
                  <div className="flex flex-col gap-1">
                    <span className="group-hover:text-brand text-sm font-medium transition-colors">
                      {t[post.titleKey]}
                    </span>
                    <span className="text-muted text-xs">
                      {t[post.dateKey]}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
