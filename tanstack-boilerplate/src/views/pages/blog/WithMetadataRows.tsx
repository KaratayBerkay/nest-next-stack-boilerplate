"use client";

import Image from "next/image";
import { IconArrowRight } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Badge } from "@/components/ui/Badge";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { BlogMetadataPost } from "@/types/pages/blog/BlogBlocks-types";
const LINK_URL = "https://example.com" as const;

const POSTS = [
  {
    src: "/img/placeholders/ph-1x1-4.webp",
    categoryKey: "blog36Post1Category",
    authorKey: "blog36Post1Author",
    dateKey: "blog36Post1Date",
    titleKey: "blog36Post1Title",
    summaryKey: "blog36Post1Summary",
  },
  {
    src: "/img/placeholders/ph-1x1-1.webp",
    categoryKey: "blog36Post2Category",
    authorKey: "blog36Post2Author",
    dateKey: "blog36Post2Date",
    titleKey: "blog36Post2Title",
    summaryKey: "blog36Post2Summary",
  },
  {
    src: "/img/placeholders/ph-1x1-4.webp",
    categoryKey: "blog36Post3Category",
    authorKey: "blog36Post3Author",
    dateKey: "blog36Post3Date",
    titleKey: "blog36Post3Title",
    summaryKey: "blog36Post3Summary",
  },
  {
    src: "/img/placeholders/ph-1x1-3.webp",
    categoryKey: "blog36Post4Category",
    authorKey: "blog36Post4Author",
    dateKey: "blog36Post4Date",
    titleKey: "blog36Post4Title",
    summaryKey: "blog36Post4Summary",
  },
  {
    src: "/img/placeholders/ph-1x1-1.webp",
    categoryKey: "blog36Post5Category",
    authorKey: "blog36Post5Author",
    dateKey: "blog36Post5Date",
    titleKey: "blog36Post5Title",
    summaryKey: "blog36Post5Summary",
  },
  {
    src: "/img/placeholders/ph-1x1-3.webp",
    categoryKey: "blog36Post6Category",
    authorKey: "blog36Post6Author",
    dateKey: "blog36Post6Date",
    titleKey: "blog36Post6Title",
    summaryKey: "blog36Post6Summary",
  },
] as const satisfies readonly BlogMetadataPost[];

const IMAGE_SIZES = "(max-width: 640px) 100vw, 9rem";

export function WithMetadataRows() {
  const t = useMessages("pages").blog;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 lg:gap-20 lg:px-8">
        <div className="flex flex-col items-start gap-4">
          <Badge variant="secondary" size="sm">
            {t.blog36Label}
          </Badge>
          <Typography
            variant="h2"
            className="max-w-2xl text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blog36Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {t.blog36Intro}
          </Typography>
        </div>

        <div className="flex flex-col gap-12 lg:gap-16">
          {POSTS.map((post) => (
            <article
              key={post.titleKey}
              className="group flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8"
            >
              <div className="flex max-w-2xl flex-col gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline" size="sm">
                    {t[post.categoryKey]}
                  </Badge>
                  <Typography variant="caption">
                    {t[post.authorKey]} · {t[post.dateKey]}
                  </Typography>
                </div>
                <Typography
                  variant="h3"
                  className="group-hover:text-brand text-xl font-medium tracking-tight transition-colors md:text-2xl"
                >
                  {t[post.titleKey]}
                </Typography>
                <Typography variant="body" className="text-muted">
                  {t[post.summaryKey]}
                </Typography>
                <a
                  href={LINK_URL}
                  className="group text-brand inline-flex w-fit items-center gap-1.5 text-sm font-semibold"
                >
                  {t.blog36ReadMore}
                  <IconArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </a>
              </div>
              <AspectRatio
                ratio={1 / 1}
                className="bg-surface border-border relative w-full shrink-0 overflow-hidden rounded-xl border sm:w-28 lg:w-36"
              >
                <Image
                  src={post.src}
                  alt={t[post.titleKey]}
                  fill
                  sizes={IMAGE_SIZES}
                  className="object-cover transition-opacity duration-300 group-hover:opacity-80"
                />
              </AspectRatio>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
