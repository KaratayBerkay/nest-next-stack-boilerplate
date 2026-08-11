"use client";

import Image from "next/image";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { Blog6Post } from "@/types/pages/blog/WithBylineFirstGrid-types";
const LINK_URL = "https://example.com" as const;

const POSTS: Blog6Post[] = [
  {
    titleKey: "blog6Post1Title",
    summaryKey: "blog6Post1Summary",
    dateKey: "blog6Post1Date",
    author: "Sarah Chen",
    avatarSeed: "blog6-avatar-1",
    imageSeed: "blog6-1",
  },
  {
    titleKey: "blog6Post2Title",
    summaryKey: "blog6Post2Summary",
    dateKey: "blog6Post2Date",
    author: "Marcus Rodriguez",
    avatarSeed: "blog6-avatar-2",
    imageSeed: "blog6-2",
  },
  {
    titleKey: "blog6Post3Title",
    summaryKey: "blog6Post3Summary",
    dateKey: "blog6Post3Date",
    author: "Emma Thompson",
    avatarSeed: "blog6-avatar-3",
    imageSeed: "blog6-3",
  },
  {
    titleKey: "blog6Post4Title",
    summaryKey: "blog6Post4Summary",
    dateKey: "blog6Post4Date",
    author: "Jonas Weber",
    avatarSeed: "blog6-avatar-4",
    imageSeed: "blog6-4",
  },
  {
    titleKey: "blog6Post5Title",
    summaryKey: "blog6Post5Summary",
    dateKey: "blog6Post5Date",
    author: "Aisha Patel",
    avatarSeed: "blog6-avatar-5",
    imageSeed: "blog6-5",
  },
  {
    titleKey: "blog6Post6Title",
    summaryKey: "blog6Post6Summary",
    dateKey: "blog6Post6Date",
    author: "Leo Kim",
    avatarSeed: "blog6-avatar-6",
    imageSeed: "blog6-6",
  },
];

export function WithBylineFirstGrid() {
  const t = useMessages("pages").blog;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 lg:px-8">
        <div className="flex flex-col gap-4">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blog6Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {t.blog6Subtext}
          </Typography>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {POSTS.map((post) => (
            <article key={post.titleKey} className="group flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Avatar
                  src={`https://picsum.photos/seed/${post.avatarSeed}/128/128`}
                  alt={post.author}
                  fallback={post.author.slice(0, 2)}
                  size="sm"
                />
                <span className="text-sm font-medium">{post.author}</span>
                <span className="text-muted">·</span>
                <Typography variant="caption">{t[post.dateKey]}</Typography>
              </div>
              <AspectRatio
                ratio={16 / 10}
                className="bg-surface relative rounded-2xl"
              >
                <Image
                  src={`https://picsum.photos/seed/${post.imageSeed}/800/500`}
                  alt={t[post.titleKey]}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-opacity duration-300 group-hover:opacity-80"
                />
              </AspectRatio>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-medium tracking-tight">
                  <a
                    href={LINK_URL}
                    className="hover:text-brand transition-colors"
                  >
                    {t[post.titleKey]}
                  </a>
                </h3>
                <Typography variant="body" className="text-muted">
                  {t[post.summaryKey]}
                </Typography>
              </div>
            </article>
          ))}
        </div>

        <Button variant="secondary" className="w-full md:hidden">
          {t.blog6ViewAll}
        </Button>
      </div>
    </section>
  );
}
