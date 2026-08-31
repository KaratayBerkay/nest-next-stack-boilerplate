"use client";

import Image from "next/image";
import { IconArrowUpRight } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  Blog34Post,
  Blog34PostCardProps,
} from "@/types/pages/blog/WithBorderedFourColumn-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const POSTS: Blog34Post[] = [
  {
    seed: "blog34-1",
    ratio: 4 / 3,
    categoryKey: "blog34Post1Category",
    titleKey: "blog34Post1Title",
    summaryKey: "blog34Post1Summary",
    authorKey: "blog34Post1Author",
    dateKey: "blog34Post1Date",
  },
  {
    seed: "blog34-2",
    ratio: 4 / 3,
    categoryKey: "blog34Post2Category",
    titleKey: "blog34Post2Title",
    summaryKey: "blog34Post2Summary",
    authorKey: "blog34Post2Author",
    dateKey: "blog34Post2Date",
  },
  {
    seed: "blog34-3",
    ratio: 4 / 3,
    categoryKey: "blog34Post3Category",
    titleKey: "blog34Post3Title",
    summaryKey: "blog34Post3Summary",
    authorKey: "blog34Post3Author",
    dateKey: "blog34Post3Date",
  },
  {
    seed: "blog34-4",
    ratio: 4 / 3,
    categoryKey: "blog34Post4Category",
    titleKey: "blog34Post4Title",
    summaryKey: "blog34Post4Summary",
    authorKey: "blog34Post4Author",
    dateKey: "blog34Post4Date",
  },
  {
    seed: "blog34-5",
    ratio: 4 / 3,
    categoryKey: "blog34Post5Category",
    titleKey: "blog34Post5Title",
    summaryKey: "blog34Post5Summary",
    authorKey: "blog34Post5Author",
    dateKey: "blog34Post5Date",
  },
  {
    seed: "blog34-6",
    ratio: 4 / 3,
    categoryKey: "blog34Post6Category",
    titleKey: "blog34Post6Title",
    summaryKey: "blog34Post6Summary",
    authorKey: "blog34Post6Author",
    dateKey: "blog34Post6Date",
  },
  {
    seed: "blog34-7",
    ratio: 4 / 3,
    categoryKey: "blog34Post7Category",
    titleKey: "blog34Post7Title",
    summaryKey: "blog34Post7Summary",
    authorKey: "blog34Post7Author",
    dateKey: "blog34Post7Date",
  },
  {
    seed: "blog34-8",
    ratio: 4 / 3,
    categoryKey: "blog34Post8Category",
    titleKey: "blog34Post8Title",
    summaryKey: "blog34Post8Summary",
    authorKey: "blog34Post8Author",
    dateKey: "blog34Post8Date",
  },
];

const IMAGE_SIZES = "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw";
const ARTICLE_URL = "#";

function PostCard({ post, t }: Blog34PostCardProps) {
  return (
    <Card className="group hover:bg-surface/60 flex h-full flex-col gap-5 p-5 transition-colors">
      <a href={ARTICLE_URL} className="block">
        <AspectRatio
          ratio={post.ratio}
          className="bg-surface relative overflow-hidden rounded-xl"
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

      <div className="flex flex-1 flex-col gap-3">
        <Badge
          variant="secondary"
          pill
          size="sm"
          fontSize="text-xs"
          className="w-fit px-2.5 py-1"
        >
          {t[post.categoryKey]}
        </Badge>

        <a href={ARTICLE_URL} className="block">
          <Typography
            variant="h3"
            className="group-hover:text-brand text-lg font-medium tracking-tight transition-colors"
          >
            {t[post.titleKey]}
          </Typography>
        </a>

        <Typography variant="bodySmall" className="text-muted line-clamp-3">
          {t[post.summaryKey]}
        </Typography>

        <div className="border-border mt-auto flex items-center justify-between gap-4 border-t pt-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">{t[post.authorKey]}</span>
            <Typography variant="caption">{t[post.dateKey]}</Typography>
          </div>
          <a
            href={ARTICLE_URL}
            className="text-brand inline-flex items-center gap-1 text-sm font-medium"
          >
            {t.blog34ReadMore}
            <IconArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </Card>
  );
}

export function WithBorderedFourColumn() {
  const t = useMessages("pages").blog;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 lg:gap-16 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blog34Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {t.blog34Description}
          </Typography>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {POSTS.map((post) => (
            <PostCard key={post.seed} post={post} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
