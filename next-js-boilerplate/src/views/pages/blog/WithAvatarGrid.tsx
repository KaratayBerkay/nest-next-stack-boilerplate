"use client";

import Image from "next/image";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { Blog4Post } from "@/types/pages/blog/WithAvatarGrid-types";
const LINK_URL = "https://example.com" as const;

const POSTS: Blog4Post[] = [
  {
    titleKey: "blog4Post1Title",
    descriptionKey: "blog4Post1Description",
    dateKey: "blog4Post1Date",
    categoryKey: "blog4CategoryDesign",
    author: "Sarah Chen",
    avatarSeed: "blog4-avatar-1",
    imageSeed: "blog4-1",
  },
  {
    titleKey: "blog4Post2Title",
    descriptionKey: "blog4Post2Description",
    dateKey: "blog4Post2Date",
    categoryKey: "blog4CategoryEngineering",
    author: "Marcus Rodriguez",
    avatarSeed: "blog4-avatar-2",
    imageSeed: "blog4-2",
  },
  {
    titleKey: "blog4Post3Title",
    descriptionKey: "blog4Post3Description",
    dateKey: "blog4Post3Date",
    categoryKey: "blog4CategoryDesign",
    author: "Aisha Patel",
    avatarSeed: "blog4-avatar-3",
    imageSeed: "blog4-3",
  },
  {
    titleKey: "blog4Post4Title",
    descriptionKey: "blog4Post4Description",
    dateKey: "blog4Post4Date",
    categoryKey: "blog4CategoryEngineering",
    author: "Jonas Weber",
    avatarSeed: "blog4-avatar-4",
    imageSeed: "blog4-4",
  },
  {
    titleKey: "blog4Post5Title",
    descriptionKey: "blog4Post5Description",
    dateKey: "blog4Post5Date",
    categoryKey: "blog4CategoryDesign",
    author: "Emma Thompson",
    avatarSeed: "blog4-avatar-5",
    imageSeed: "blog4-5",
  },
  {
    titleKey: "blog4Post6Title",
    descriptionKey: "blog4Post6Description",
    dateKey: "blog4Post6Date",
    categoryKey: "blog4CategoryProduct",
    author: "Leo Kim",
    avatarSeed: "blog4-avatar-6",
    imageSeed: "blog4-6",
  },
];

export function WithAvatarGrid() {
  const t = useMessages("pages").blog;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 lg:px-8">
        <div className="flex flex-col gap-4">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blog4Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {t.blog4Subtext}
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
                  src={`https://picsum.photos/seed/${post.imageSeed}/800/500`}
                  alt={t[post.titleKey]}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-opacity duration-300 group-hover:opacity-80"
                />
              </AspectRatio>
              <div className="flex flex-col gap-3 p-6">
                <Badge variant="secondary" size="sm" className="w-fit">
                  {t[post.categoryKey]}
                </Badge>
                <h3 className="text-xl font-medium tracking-tight">
                  <a
                    href={LINK_URL}
                    className="hover:text-brand transition-colors"
                  >
                    {t[post.titleKey]}
                  </a>
                </h3>
                <Typography variant="body" className="text-muted">
                  {t[post.descriptionKey]}
                </Typography>
                <div className="mt-auto flex items-center gap-3 pt-3">
                  <Avatar
                    src={`https://picsum.photos/seed/${post.avatarSeed}/128/128`}
                    alt={post.author}
                    fallback={post.author.slice(0, 2)}
                    size="sm"
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{post.author}</span>
                    <Typography variant="caption">{t[post.dateKey]}</Typography>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <Button variant="secondary" className="w-full md:hidden">
          {t.blog4ViewAll}
        </Button>
      </div>
    </section>
  );
}
