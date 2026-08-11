"use client";

import Image from "next/image";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Badge } from "@/components/ui/Badge";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  Blog32Post,
  Blog32PostCardProps,
} from "@/types/pages/blog/WithTwoColumnGrid-types";

const POSTS: Blog32Post[] = [
  {
    seed: "blog32-1",
    ratio: 16 / 9,
    categoryKey: "blog32Post1Category",
    titleKey: "blog32Post1Title",
    summaryKey: "blog32Post1Summary",
    dateKey: "blog32Post1Date",
  },
  {
    seed: "blog32-2",
    ratio: 16 / 9,
    categoryKey: "blog32Post2Category",
    titleKey: "blog32Post2Title",
    summaryKey: "blog32Post2Summary",
    dateKey: "blog32Post2Date",
  },
  {
    seed: "blog32-3",
    ratio: 16 / 9,
    categoryKey: "blog32Post3Category",
    titleKey: "blog32Post3Title",
    summaryKey: "blog32Post3Summary",
    dateKey: "blog32Post3Date",
  },
  {
    seed: "blog32-4",
    ratio: 16 / 9,
    categoryKey: "blog32Post4Category",
    titleKey: "blog32Post4Title",
    summaryKey: "blog32Post4Summary",
    dateKey: "blog32Post4Date",
  },
];

const IMAGE_SIZES = "(max-width: 768px) 100vw, 50vw";
const ARTICLE_URL = "#";

function PostCard({ post, t }: Blog32PostCardProps) {
  return (
    <a
      href={ARTICLE_URL}
      className="group border-border flex flex-col gap-5 rounded-2xl border p-4"
    >
      <AspectRatio
        ratio={post.ratio}
        className="bg-surface relative overflow-hidden rounded-xl"
      >
        <Image
          src={`https://picsum.photos/seed/${post.seed}/1200/675`}
          alt={t[post.titleKey]}
          fill
          sizes={IMAGE_SIZES}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </AspectRatio>

      <div className="flex flex-col gap-3 px-1 pb-1">
        <div className="flex items-center justify-between gap-4">
          <Badge variant="outline">{t[post.categoryKey]}</Badge>
          <span className="text-muted text-sm">{t[post.dateKey]}</span>
        </div>

        <Typography
          variant="h3"
          className="group-hover:text-brand text-xl font-medium tracking-tight transition-colors"
        >
          {t[post.titleKey]}
        </Typography>

        <Typography variant="bodySmall" className="text-muted">
          {t[post.summaryKey]}
        </Typography>
      </div>
    </a>
  );
}

export function WithTwoColumnGrid() {
  const t = useMessages("pages").blog;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 lg:gap-16 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-4">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blog32Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {t.blog32Description}
          </Typography>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
          {POSTS.map((post) => (
            <PostCard key={post.seed} post={post} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
