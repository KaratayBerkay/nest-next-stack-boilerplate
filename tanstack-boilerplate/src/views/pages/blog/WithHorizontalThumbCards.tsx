"use client";

import Image from "next/image";
import { IconArrowRight } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  Blog24Post,
  Blog24PostCardProps,
} from "@/types/pages/blog/WithHorizontalThumbCards-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const POSTS: Blog24Post[] = [
  {
    seed: "blog24-1",
    ratio: 4 / 3,
    categoryKey: "blog24Post1Category",
    titleKey: "blog24Post1Title",
    summaryKey: "blog24Post1Summary",
    authorKey: "blog24Post1Author",
    dateKey: "blog24Post1Date",
  },
  {
    seed: "blog24-2",
    ratio: 4 / 3,
    categoryKey: "blog24Post2Category",
    titleKey: "blog24Post2Title",
    summaryKey: "blog24Post2Summary",
    authorKey: "blog24Post2Author",
    dateKey: "blog24Post2Date",
  },
  {
    seed: "blog24-3",
    ratio: 4 / 3,
    categoryKey: "blog24Post3Category",
    titleKey: "blog24Post3Title",
    summaryKey: "blog24Post3Summary",
    authorKey: "blog24Post3Author",
    dateKey: "blog24Post3Date",
  },
  {
    seed: "blog24-4",
    ratio: 4 / 3,
    categoryKey: "blog24Post4Category",
    titleKey: "blog24Post4Title",
    summaryKey: "blog24Post4Summary",
    authorKey: "blog24Post4Author",
    dateKey: "blog24Post4Date",
  },
];

const IMAGE_SIZES = "(max-width: 768px) 100vw, 40vw";
const ARTICLE_URL = "#";

function PostCard({ post, t }: Blog24PostCardProps) {
  return (
    <article className="grid gap-6 md:grid-cols-[5fr_7fr] md:items-center lg:gap-10">
      <a href={ARTICLE_URL} className="group block">
        <AspectRatio
          ratio={post.ratio}
          className="bg-surface relative overflow-hidden rounded-2xl"
        >
          <Image
            src={placeholderImage(post.seed, "4x3")}
            alt={t[post.titleKey]}
            fill
            sizes={IMAGE_SIZES}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </AspectRatio>
      </a>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Badge variant="secondary" pill>
            {t[post.categoryKey]}
          </Badge>
          <span className="text-muted text-sm">{t[post.authorKey]}</span>
          <span className="text-muted text-sm">·</span>
          <span className="text-muted text-sm">{t[post.dateKey]}</span>
        </div>

        <a href={ARTICLE_URL} className="group block">
          <Typography
            variant="h3"
            className="group-hover:text-brand text-2xl font-medium tracking-tight transition-colors"
          >
            {t[post.titleKey]}
          </Typography>
        </a>

        <Typography variant="body" className="text-muted">
          {t[post.summaryKey]}
        </Typography>

        <a
          href={ARTICLE_URL}
          className="text-brand group inline-flex w-fit items-center gap-1 text-sm font-medium"
        >
          {t.blog24ReadMore}
          <IconArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </a>
      </div>
    </article>
  );
}

export function WithHorizontalThumbCards() {
  const t = useMessages("pages").blog;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-4xl flex-col gap-12 px-4 lg:gap-16 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <Badge variant="secondary" pill>
            {t.blog24Label}
          </Badge>
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blog24Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {t.blog24Description}
          </Typography>
        </div>

        <div className="flex flex-col gap-10">
          {POSTS.map((post) => (
            <PostCard key={post.seed} post={post} t={t} />
          ))}
        </div>

        <div className="flex justify-center">
          <Button variant="outline" className="w-full md:w-auto" asChild>
            <a href={ARTICLE_URL}>{t.blog24ViewAll}</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
