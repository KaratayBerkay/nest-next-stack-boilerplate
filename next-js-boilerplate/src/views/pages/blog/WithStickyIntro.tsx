"use client";

import Image from "next/image";
import { IconArrowUpRight, IconArticle } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Separator } from "@/components/ui/Separator";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  Blog11CategoryKey,
  StickyIntroPost,
} from "@/types/pages/blog/WithStickyIntro-types";

const POST_URL = "https://example.com" as const;

const POSTS: StickyIntroPost[] = [
  {
    titleKey: "blog11Post1Title",
    dateKey: "blog11Post1Date",
    seed: "blog11-1",
  },
  {
    titleKey: "blog11Post2Title",
    dateKey: "blog11Post2Date",
    seed: "blog11-2",
  },
  {
    titleKey: "blog11Post3Title",
    dateKey: "blog11Post3Date",
    seed: "blog11-3",
  },
  {
    titleKey: "blog11Post4Title",
    dateKey: "blog11Post4Date",
    seed: "blog11-4",
  },
  {
    titleKey: "blog11Post5Title",
    dateKey: "blog11Post5Date",
    seed: "blog11-5",
  },
  {
    titleKey: "blog11Post6Title",
    dateKey: "blog11Post6Date",
    seed: "blog11-6",
  },
];

const CATEGORY_KEYS: Blog11CategoryKey[] = [
  "blog11Category1",
  "blog11Category2",
  "blog11Category3",
  "blog11Category4",
];

export function WithStickyIntro() {
  const t = useMessages("pages").blog;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-[340px_1fr] lg:gap-20 lg:px-8">
        <div className="flex flex-col gap-6 lg:sticky lg:top-8 lg:self-start">
          <div className="bg-muted flex size-12 items-center justify-center rounded-xl">
            <IconArticle size={24} className="text-brand" />
          </div>
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blog11Heading}
          </Typography>
          <Typography variant="body" className="text-muted">
            {t.blog11Intro}
          </Typography>
          <Separator />
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {CATEGORY_KEYS.map((key) => (
              <a
                key={key}
                href={POST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted group hover:text-fg flex items-center gap-1 text-sm transition-colors"
              >
                {t[key]}
                <IconArrowUpRight
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            ))}
          </div>
        </div>

        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
          {POSTS.map((post) => (
            <article key={post.titleKey} className="group flex flex-col gap-3">
              <AspectRatio
                ratio={4 / 3}
                className="bg-surface relative overflow-hidden rounded-2xl"
              >
                <Image
                  src={`https://picsum.photos/seed/${post.seed}/800/600`}
                  alt={t[post.titleKey]}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover brightness-95 transition duration-300 group-hover:scale-105 group-hover:brightness-100"
                />
              </AspectRatio>
              <Typography
                variant="h3"
                className="text-lg font-medium tracking-tight"
              >
                <a
                  href={POST_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group-hover:text-brand transition-colors"
                >
                  {t[post.titleKey]}
                </a>
              </Typography>
              <Typography variant="caption">{t[post.dateKey]}</Typography>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
