"use client";

import Image from "next/image";
import { IconArrowRight } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  Blog23Post,
  Blog23PostCardProps,
} from "@/types/pages/blog/WithStackedCards-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const POSTS: Blog23Post[] = [
  {
    seed: "blog23-1",
    ratio: 16 / 9,
    categoryKey: "blog23Post1Category",
    titleKey: "blog23Post1Title",
    summaryKey: "blog23Post1Summary",
    authorKey: "blog23Post1Author",
    dateKey: "blog23Post1Date",
  },
  {
    seed: "blog23-2",
    ratio: 16 / 9,
    categoryKey: "blog23Post2Category",
    titleKey: "blog23Post2Title",
    summaryKey: "blog23Post2Summary",
    authorKey: "blog23Post2Author",
    dateKey: "blog23Post2Date",
  },
  {
    seed: "blog23-3",
    ratio: 16 / 9,
    categoryKey: "blog23Post3Category",
    titleKey: "blog23Post3Title",
    summaryKey: "blog23Post3Summary",
    authorKey: "blog23Post3Author",
    dateKey: "blog23Post3Date",
  },
];

const IMAGE_SIZES = "(max-width: 768px) 100vw, 50vw";
const ARTICLE_URL = "#";

function PostCard({ post, t }: Blog23PostCardProps) {
  return (
    <article className="flex flex-col gap-6">
      <a href={ARTICLE_URL} className="group block">
        <AspectRatio
          ratio={post.ratio}
          className="bg-surface relative overflow-hidden rounded-2xl"
        >
          <Image
            src={placeholderImage(post.seed, "16x9")}
            alt={t[post.titleKey]}
            fill
            sizes={IMAGE_SIZES}
            className="object-cover transition-opacity duration-300 group-hover:opacity-80"
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
          {t.blog23ReadMore}
          <IconArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </a>
      </div>
    </article>
  );
}

export function WithStackedCards() {
  const t = useMessages("pages").blog;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-3xl flex-col gap-12 px-4 lg:gap-16 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Badge variant="secondary" pill>
            {t.blog23Label}
          </Badge>
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blog23Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {t.blog23Intro}
          </Typography>
        </div>

        <div className="flex flex-col gap-14">
          {POSTS.map((post) => (
            <PostCard key={post.seed} post={post} t={t} />
          ))}
        </div>

        <div className="flex justify-center">
          <Button variant="outline" className="w-full md:w-auto" asChild>
            <a href={ARTICLE_URL}>{t.blog23ViewAll}</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
