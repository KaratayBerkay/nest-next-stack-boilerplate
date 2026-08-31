"use client";

import Image from "next/image";
import { IconArrowRight } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Badge } from "@/components/ui/Badge";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { Blog7Post } from "@/types/pages/blog/WithCenteredCards-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
const LINK_URL = "https://example.com" as const;

const POSTS: Blog7Post[] = [
  {
    titleKey: "blog7Post1Title",
    summaryKey: "blog7Post1Summary",
    dateKey: "blog7Post1Date",
    author: "Sarah Chen",
    imageSeed: "blog7-1",
  },
  {
    titleKey: "blog7Post2Title",
    summaryKey: "blog7Post2Summary",
    dateKey: "blog7Post2Date",
    author: "Marcus Rodriguez",
    imageSeed: "blog7-2",
  },
  {
    titleKey: "blog7Post3Title",
    summaryKey: "blog7Post3Summary",
    dateKey: "blog7Post3Date",
    author: "Emma Thompson",
    imageSeed: "blog7-3",
  },
  {
    titleKey: "blog7Post4Title",
    summaryKey: "blog7Post4Summary",
    dateKey: "blog7Post4Date",
    author: "Leo Kim",
    imageSeed: "blog7-4",
  },
];

export function WithCenteredCards() {
  const t = useMessages("pages").blog;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-4 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Badge variant="secondary">{t.blog7Tagline}</Badge>
          <Typography
            variant="h2"
            className="max-w-2xl text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blog7Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {t.blog7Description}
          </Typography>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {POSTS.map((post) => (
            <article
              key={post.titleKey}
              className="border-border bg-surface flex flex-col overflow-hidden rounded-2xl border"
            >
              <AspectRatio ratio={16 / 9}>
                <a
                  href={LINK_URL}
                  className="block transition-opacity duration-200 hover:opacity-70"
                >
                  <Image
                    src={placeholderImage(post.imageSeed, "16x9")}
                    alt={t[post.titleKey]}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </a>
              </AspectRatio>
              <div className="flex flex-col items-center gap-3 p-6 text-center">
                <h3 className="text-xl font-medium tracking-tight">
                  <a
                    href={LINK_URL}
                    className="transition-colors hover:underline"
                  >
                    {t[post.titleKey]}
                  </a>
                </h3>
                <Typography variant="bodySmall" className="font-medium">
                  {post.author} · {t[post.dateKey]}
                </Typography>
                <Typography variant="body" className="text-muted">
                  {t[post.summaryKey]}
                </Typography>
                <a
                  href={LINK_URL}
                  className="text-muted group hover:text-fg mt-2 flex items-center gap-1 text-sm font-medium transition-colors"
                >
                  {t.blog7ReadMore}
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
