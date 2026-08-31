"use client";

import Image from "next/image";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { MiniPost } from "@/types/pages/blog/WithMiniPostStack-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const POST_URL = "https://example.com" as const;

const MINI_POSTS: MiniPost[] = [
  {
    titleKey: "blog39Mini1Title",
    dateKey: "blog39Mini1Date",
    seed: "blog39-1",
  },
  {
    titleKey: "blog39Mini2Title",
    dateKey: "blog39Mini2Date",
    seed: "blog39-2",
  },
  {
    titleKey: "blog39Mini3Title",
    dateKey: "blog39Mini3Date",
    seed: "blog39-3",
  },
  {
    titleKey: "blog39Mini4Title",
    dateKey: "blog39Mini4Date",
    seed: "blog39-4",
  },
];

export function WithMiniPostStack() {
  const t = useMessages("pages").blog;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col px-4 lg:px-8">
        <Typography variant="overline">{t.blog39Label}</Typography>

        <div className="mt-10 grid gap-14 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
          <div className="flex flex-col gap-6">
            <AspectRatio
              ratio={4 / 3}
              className="bg-surface relative overflow-hidden rounded-2xl"
            >
              <Image
                src="/img/placeholders/ph-4x3-6.webp"
                alt={t.blog39FeaturedTitle}
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />
            </AspectRatio>
            <Badge variant="soft" pill className="w-fit">
              {t.blog39FeaturedCategory}
            </Badge>
            <Typography
              variant="h2"
              className="text-3xl font-medium tracking-tighter md:text-4xl"
            >
              <a
                href={POST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand transition-colors"
              >
                {t.blog39FeaturedTitle}
              </a>
            </Typography>
            <Typography variant="body" className="text-muted">
              {t.blog39FeaturedExcerpt}
            </Typography>
            <div className="flex items-center gap-3">
              <Avatar
                src="/img/placeholders/ph-1x1-6.webp"
                alt={t.blog39FeaturedAuthor}
                fallback="SC"
                size="sm"
              />
              <span className="text-sm font-medium">
                {t.blog39FeaturedAuthor}
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            {MINI_POSTS.map((post) => (
              <article
                key={post.titleKey}
                className="border-border flex items-center gap-5 border-t py-5"
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
                  <a
                    href={POST_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium underline-offset-4 hover:underline"
                  >
                    {t[post.titleKey]}
                  </a>
                  <span className="text-muted text-xs">{t[post.dateKey]}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
