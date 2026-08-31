"use client";

import Image from "next/image";
import { IconArrowRight } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { Blog12Post } from "@/types/pages/blog/WithReadTimeCards-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
const LINK_URL = "https://example.com" as const;

const POSTS: Blog12Post[] = [
  {
    titleKey: "blog12Post1Title",
    summaryKey: "blog12Post1Summary",
    dateKey: "blog12Post1Date",
    readMinutes: 5,
    author: "Sarah Chen",
    avatarSeed: "blog12-avatar-1",
    imageSeed: "blog12-1",
  },
  {
    titleKey: "blog12Post2Title",
    summaryKey: "blog12Post2Summary",
    dateKey: "blog12Post2Date",
    readMinutes: 7,
    author: "Marcus Rodriguez",
    avatarSeed: "blog12-avatar-2",
    imageSeed: "blog12-2",
  },
  {
    titleKey: "blog12Post3Title",
    summaryKey: "blog12Post3Summary",
    dateKey: "blog12Post3Date",
    readMinutes: 4,
    author: "Emma Thompson",
    avatarSeed: "blog12-avatar-3",
    imageSeed: "blog12-3",
  },
  {
    titleKey: "blog12Post4Title",
    summaryKey: "blog12Post4Summary",
    dateKey: "blog12Post4Date",
    readMinutes: 8,
    author: "Jonas Weber",
    avatarSeed: "blog12-avatar-4",
    imageSeed: "blog12-4",
  },
  {
    titleKey: "blog12Post5Title",
    summaryKey: "blog12Post5Summary",
    dateKey: "blog12Post5Date",
    readMinutes: 6,
    author: "Aisha Patel",
    avatarSeed: "blog12-avatar-5",
    imageSeed: "blog12-5",
  },
  {
    titleKey: "blog12Post6Title",
    summaryKey: "blog12Post6Summary",
    dateKey: "blog12Post6Date",
    readMinutes: 9,
    author: "Leo Kim",
    avatarSeed: "blog12-avatar-6",
    imageSeed: "blog12-6",
  },
];

export function WithReadTimeCards() {
  const t = useMessages("pages").blog;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Badge variant="outline">{t.blog12Tagline}</Badge>
          <Typography
            variant="h2"
            className="max-w-2xl text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blog12Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {t.blog12Subtext}
          </Typography>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {POSTS.map((post) => (
            <article
              key={post.titleKey}
              className="border-border bg-surface group flex flex-col overflow-hidden rounded-2xl border transition hover:shadow-md"
            >
              <AspectRatio ratio={16 / 10}>
                <Image
                  src={placeholderImage(post.imageSeed, "3x2")}
                  alt={t[post.titleKey]}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-opacity duration-300 group-hover:opacity-80"
                />
              </AspectRatio>
              <div className="flex flex-col gap-3 p-6">
                <div className="flex items-center justify-between gap-4">
                  <Typography variant="caption">{t[post.dateKey]}</Typography>
                  <Badge variant="secondary" size="sm">
                    {post.readMinutes} {t.blog12ReadSuffix}
                  </Badge>
                </div>
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
                <div className="border-border mt-2 flex items-center gap-3 border-t pt-4">
                  <Avatar
                    src={placeholderImage(post.avatarSeed, "1x1")}
                    alt={post.author}
                    fallback={post.author.slice(0, 2)}
                    size="sm"
                  />
                  <span className="text-sm font-medium">{post.author}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="flex justify-center">
          <Button variant="outline" rightIcon={<IconArrowRight size={16} />}>
            {t.blog12ViewAll}
          </Button>
        </div>
      </div>
    </section>
  );
}
