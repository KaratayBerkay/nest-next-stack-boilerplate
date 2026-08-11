"use client";

import Image from "next/image";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  BlogLeadTileProps,
  BlogMessages,
  BlogPost,
} from "@/types/pages/blog/BlogBlock-types";
const LINK_URL = "https://example.com" as const;

const POSTS: BlogPost[] = [
  {
    titleKey: "blog28Post1Title",
    excerptKey: "blog28Post1Excerpt",
    categoryKey: "blog28Category1",
    dateKey: "blog28Post1Date",
    seed: "blog28-1",
  },
  {
    titleKey: "blog28Post2Title",
    categoryKey: "blog28Category2",
    dateKey: "blog28Post2Date",
    seed: "blog28-2",
  },
  {
    titleKey: "blog28Post3Title",
    categoryKey: "blog28Category3",
    dateKey: "blog28Post3Date",
    seed: "blog28-3",
  },
  {
    titleKey: "blog28Post4Title",
    categoryKey: "blog28Category2",
    dateKey: "blog28Post4Date",
    seed: "blog28-4",
  },
  {
    titleKey: "blog28Post5Title",
    categoryKey: "blog28Category3",
    dateKey: "blog28Post5Date",
    seed: "blog28-5",
  },
  {
    titleKey: "blog28Post6Title",
    categoryKey: "blog28Category1",
    dateKey: "blog28Post6Date",
    seed: "blog28-6",
  },
  {
    titleKey: "blog28Post7Title",
    categoryKey: "blog28Category3",
    dateKey: "blog28Post7Date",
    seed: "blog28-7",
  },
];

const CARD_SIZES = "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw";

function LeadTile({ post, lead, t }: BlogLeadTileProps) {
  return (
    <a
      href={LINK_URL}
      className={cn("group flex flex-col gap-4", lead && "md:col-span-2")}
    >
      <AspectRatio
        ratio={lead ? 16 / 10 : 4 / 3}
        className="bg-surface relative rounded-2xl"
      >
        <Image
          src={`https://picsum.photos/seed/${post.seed}/${lead ? 1600 : 800}/${lead ? 1000 : 600}`}
          alt={t[post.titleKey]}
          fill
          sizes={CARD_SIZES}
          className="object-cover transition-opacity duration-300 group-hover:opacity-80"
        />
      </AspectRatio>
      <div className="flex flex-col gap-2">
        <p className="text-muted flex items-center gap-2 text-xs">
          {post.categoryKey && (
            <>
              <span className="text-brand font-semibold">
                {t[post.categoryKey]}
              </span>
              <span aria-hidden="true">·</span>
            </>
          )}
          <time>{t[post.dateKey]}</time>
        </p>
        <Typography
          variant={lead ? "h3" : "h4"}
          className={cn(
            lead
              ? "text-2xl font-medium tracking-tight md:text-3xl"
              : "text-lg font-medium tracking-tight",
          )}
        >
          {t[post.titleKey]}
        </Typography>
        {post.excerptKey && (
          <Typography variant="bodySmall" className="text-muted max-w-xl">
            {t[post.excerptKey]}
          </Typography>
        )}
      </div>
    </a>
  );
}

export function WithLeadTileGrid() {
  const t = useMessages("pages").blog as unknown as BlogMessages;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blog28Heading}
          </Typography>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {POSTS.map((post, index) => (
            <LeadTile
              key={post.titleKey}
              post={post}
              lead={index === 0}
              t={t}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
