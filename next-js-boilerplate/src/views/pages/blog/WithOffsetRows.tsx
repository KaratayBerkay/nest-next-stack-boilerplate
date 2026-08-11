"use client";

import Image from "next/image";
import { IconArrowRight } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { I18nMessages } from "@/generated/i18n-messages";
import type { BlogOffsetPost } from "@/types/pages/blog/BlogBlocks-types";
const LINK_URL = "https://example.com" as const;

const POSTS = [
  {
    src: "https://picsum.photos/seed/blog8-1/1600/1000",
    tagKey: "blog8Post1Tag",
    titleKey: "blog8Post1Title",
    summaryKey: "blog8Post1Summary",
    authorKey: "blog8Post1Author",
    dateKey: "blog8Post1Date",
  },
  {
    src: "https://picsum.photos/seed/blog8-2/1600/1000",
    tagKey: "blog8Post2Tag",
    titleKey: "blog8Post2Title",
    summaryKey: "blog8Post2Summary",
    authorKey: "blog8Post2Author",
    dateKey: "blog8Post2Date",
  },
  {
    src: "https://picsum.photos/seed/blog8-3/1600/1000",
    tagKey: "blog8Post3Tag",
    titleKey: "blog8Post3Title",
    summaryKey: "blog8Post3Summary",
    authorKey: "blog8Post3Author",
    dateKey: "blog8Post3Date",
  },
  {
    src: "https://picsum.photos/seed/blog8-4/1600/1000",
    tagKey: "blog8Post4Tag",
    titleKey: "blog8Post4Title",
    summaryKey: "blog8Post4Summary",
    authorKey: "blog8Post4Author",
    dateKey: "blog8Post4Date",
  },
  {
    src: "https://picsum.photos/seed/blog8-5/1600/1000",
    tagKey: "blog8Post5Tag",
    titleKey: "blog8Post5Title",
    summaryKey: "blog8Post5Summary",
    authorKey: "blog8Post5Author",
    dateKey: "blog8Post5Date",
  },
] as const satisfies readonly BlogOffsetPost[];

const IMAGE_SIZES = "(max-width: 768px) 100vw, 50vw";

type BlogMessages = I18nMessages["pages"]["blog"];

function renderPostRow(
  post: (typeof POSTS)[number],
  index: number,
  t: BlogMessages,
) {
  const textIsRight = index % 2 === 0;
  return (
    <article
      key={post.titleKey}
      className="grid items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-16"
    >
      <div
        className={
          "flex flex-col gap-4 " + (textIsRight ? "md:order-2" : "md:order-1")
        }
      >
        <Typography variant="overline">{t[post.tagKey]}</Typography>
        <a href={LINK_URL} className="group w-fit">
          <Typography
            variant="h3"
            className="group-hover:text-brand text-2xl font-semibold tracking-tight transition-colors md:text-3xl"
          >
            {t[post.titleKey]}
          </Typography>
        </a>
        <Typography variant="body" className="text-muted max-w-xl">
          {t[post.summaryKey]}
        </Typography>
        <Typography variant="caption">
          {t[post.authorKey]} · {t[post.dateKey]}
        </Typography>
        <a
          href={LINK_URL}
          className="group text-brand inline-flex w-fit items-center gap-1.5 text-sm font-semibold"
        >
          {t.blog8ReadMore}
          <IconArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        </a>
      </div>
      <AspectRatio
        ratio={16 / 10}
        className={
          "bg-surface border-border relative order-first rounded-2xl border " +
          (textIsRight ? "md:order-1" : "md:order-2")
        }
      >
        <Image
          src={post.src}
          alt={t[post.titleKey]}
          fill
          sizes={IMAGE_SIZES}
          className="object-cover"
        />
      </AspectRatio>
    </article>
  );
}

export function WithOffsetRows() {
  const t = useMessages("pages").blog;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 lg:gap-20 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Typography
            variant="h2"
            className="max-w-2xl text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blog8Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {t.blog8Intro}
          </Typography>
        </div>

        <div className="flex flex-col gap-16 lg:gap-20">
          {POSTS.map((post, index) => renderPostRow(post, index, t))}
        </div>
      </div>
    </section>
  );
}
