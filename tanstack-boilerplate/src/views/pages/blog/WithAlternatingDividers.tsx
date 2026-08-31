"use client";

import Image from "next/image";
import { IconArrowRight } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Badge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/Separator";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { BlogAlternatingPost } from "@/types/pages/blog/BlogBlocks-types";
const LINK_URL = "https://example.com" as const;

const POSTS = [
  {
    src: "/img/placeholders/ph-3x2-5.webp",
    badgeKey: "blog35Post1Badge",
    authorKey: "blog35Post1Author",
    dateKey: "blog35Post1Date",
    titleKey: "blog35Post1Title",
    summaryKey: "blog35Post1Summary",
  },
  {
    src: "/img/placeholders/ph-3x2-3.webp",
    badgeKey: "blog35Post2Badge",
    authorKey: "blog35Post2Author",
    dateKey: "blog35Post2Date",
    titleKey: "blog35Post2Title",
    summaryKey: "blog35Post2Summary",
  },
  {
    src: "/img/placeholders/ph-3x2-6.webp",
    badgeKey: "blog35Post3Badge",
    authorKey: "blog35Post3Author",
    dateKey: "blog35Post3Date",
    titleKey: "blog35Post3Title",
    summaryKey: "blog35Post3Summary",
  },
  {
    src: "/img/placeholders/ph-3x2-3.webp",
    badgeKey: "blog35Post4Badge",
    authorKey: "blog35Post4Author",
    dateKey: "blog35Post4Date",
    titleKey: "blog35Post4Title",
    summaryKey: "blog35Post4Summary",
  },
  {
    src: "/img/placeholders/ph-3x2-0.webp",
    badgeKey: "blog35Post5Badge",
    authorKey: "blog35Post5Author",
    dateKey: "blog35Post5Date",
    titleKey: "blog35Post5Title",
    summaryKey: "blog35Post5Summary",
  },
] as const satisfies readonly BlogAlternatingPost[];

const IMAGE_SIZES = "(max-width: 1024px) 100vw, 50vw";

export function WithAlternatingDividers() {
  const t = useMessages("pages").blog;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 lg:gap-20 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Typography
            variant="h2"
            className="max-w-2xl text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blog35Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {t.blog35Intro}
          </Typography>
        </div>

        <div className="flex flex-col gap-12 lg:gap-16">
          {POSTS.map((post, index) => (
            <div key={post.titleKey}>
              {index > 0 && <Separator className="mb-12 lg:mb-16" />}
              <article
                className={
                  "group flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-14 " +
                  (index % 2 === 1 ? "lg:flex-row-reverse" : "")
                }
              >
                <div className="flex-1">
                  <AspectRatio
                    ratio={16 / 10}
                    className="bg-surface border-border relative overflow-hidden rounded-2xl border"
                  >
                    <Image
                      src={post.src}
                      alt={t[post.titleKey]}
                      fill
                      sizes={IMAGE_SIZES}
                      className="object-cover transition-opacity duration-300 group-hover:opacity-80"
                    />
                  </AspectRatio>
                </div>
                <div className="flex flex-1 flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" size="sm">
                      {t[post.badgeKey]}
                    </Badge>
                    <Typography variant="caption">
                      {t[post.authorKey]} · {t[post.dateKey]}
                    </Typography>
                  </div>
                  <a href={LINK_URL} className="w-fit">
                    <Typography
                      variant="h3"
                      className="group-hover:text-brand text-2xl font-semibold tracking-tight transition-colors md:text-3xl"
                    >
                      {t[post.titleKey]}
                    </Typography>
                  </a>
                  <Typography variant="body" className="text-muted max-w-xl">
                    {t[post.summaryKey]}
                  </Typography>
                  <a
                    href={LINK_URL}
                    className="group text-brand inline-flex w-fit items-center gap-1.5 text-sm font-semibold"
                  >
                    {t.blog35Read}
                    <IconArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </a>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
