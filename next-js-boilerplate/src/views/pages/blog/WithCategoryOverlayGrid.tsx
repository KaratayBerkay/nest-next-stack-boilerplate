"use client";

import Image from "next/image";
import { IconArrowUpRight, IconCalendar } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Badge } from "@/components/ui/Badge";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  Blog13Post,
  Blog13PostCardProps,
} from "@/types/pages/blog/WithCategoryOverlayGrid-types";

const POSTS: Blog13Post[] = [
  {
    seed: "blog13-1",
    ratio: 4 / 3,
    categoryKey: "blog13Post1Category",
    titleKey: "blog13Post1Title",
    dateKey: "blog13Post1Date",
  },
  {
    seed: "blog13-2",
    ratio: 4 / 3,
    categoryKey: "blog13Post2Category",
    titleKey: "blog13Post2Title",
    dateKey: "blog13Post2Date",
  },
  {
    seed: "blog13-3",
    ratio: 4 / 3,
    categoryKey: "blog13Post3Category",
    titleKey: "blog13Post3Title",
    dateKey: "blog13Post3Date",
  },
  {
    seed: "blog13-4",
    ratio: 4 / 3,
    categoryKey: "blog13Post4Category",
    titleKey: "blog13Post4Title",
    dateKey: "blog13Post4Date",
  },
  {
    seed: "blog13-5",
    ratio: 4 / 3,
    categoryKey: "blog13Post5Category",
    titleKey: "blog13Post5Title",
    dateKey: "blog13Post5Date",
  },
  {
    seed: "blog13-6",
    ratio: 4 / 3,
    categoryKey: "blog13Post6Category",
    titleKey: "blog13Post6Title",
    dateKey: "blog13Post6Date",
  },
];

const IMAGE_SIZES = "(max-width: 768px) 100vw, 33vw";
const ARTICLE_URL = "#";

function PostCard({ post, t }: Blog13PostCardProps) {
  return (
    <article className="group flex flex-col gap-4">
      <AspectRatio
        ratio={post.ratio}
        className="bg-surface relative overflow-hidden rounded-2xl"
      >
        <Image
          src={`https://picsum.photos/seed/${post.seed}/800/600`}
          alt={t[post.titleKey]}
          fill
          sizes={IMAGE_SIZES}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <Badge variant="secondary" pill className="absolute top-4 left-4">
          {t[post.categoryKey]}
        </Badge>
      </AspectRatio>

      <Typography variant="h3" className="text-xl font-medium tracking-tight">
        {t[post.titleKey]}
      </Typography>

      <div className="flex items-center justify-between gap-4">
        <span className="text-muted inline-flex items-center gap-1.5 text-sm">
          <IconCalendar size={16} />
          {t[post.dateKey]}
        </span>
        <a
          href={ARTICLE_URL}
          className="text-brand group inline-flex items-center gap-1 text-sm font-medium"
        >
          {t.blog13ReadMore}
          <IconArrowUpRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </a>
      </div>
    </article>
  );
}

export function WithCategoryOverlayGrid() {
  const t = useMessages("pages").blog;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 lg:gap-16 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <Typography variant="overline">{t.blog13Label}</Typography>
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blog13Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {t.blog13Paragraph}
          </Typography>
          <a
            href={ARTICLE_URL}
            className="text-brand group inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4"
          >
            {t.blog13ViewAll}
            <IconArrowUpRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {POSTS.map((post) => (
            <PostCard key={post.seed} post={post} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
