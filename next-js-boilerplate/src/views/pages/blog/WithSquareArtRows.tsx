"use client";

import Image from "next/image";
import { IconArrowUpRight } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { BlogSquareArtPost } from "@/types/pages/blog/BlogBlocks-types";
const LINK_URL = "https://example.com" as const;

const POSTS = [
  {
    src: "https://picsum.photos/seed/blog30-1/800/800",
    categoryKey: "blog30Post1Category",
    titleKey: "blog30Post1Title",
    dateKey: "blog30Post1Date",
    summaryKey: "blog30Post1Summary",
  },
  {
    src: "https://picsum.photos/seed/blog30-2/800/800",
    categoryKey: "blog30Post2Category",
    titleKey: "blog30Post2Title",
    dateKey: "blog30Post2Date",
    summaryKey: "blog30Post2Summary",
  },
  {
    src: "https://picsum.photos/seed/blog30-3/800/800",
    categoryKey: "blog30Post3Category",
    titleKey: "blog30Post3Title",
    dateKey: "blog30Post3Date",
    summaryKey: "blog30Post3Summary",
  },
  {
    src: "https://picsum.photos/seed/blog30-4/800/800",
    categoryKey: "blog30Post4Category",
    titleKey: "blog30Post4Title",
    dateKey: "blog30Post4Date",
    summaryKey: "blog30Post4Summary",
  },
  {
    src: "https://picsum.photos/seed/blog30-5/800/800",
    categoryKey: "blog30Post5Category",
    titleKey: "blog30Post5Title",
    dateKey: "blog30Post5Date",
    summaryKey: "blog30Post5Summary",
  },
] as const satisfies readonly BlogSquareArtPost[];

const IMAGE_SIZES = "(max-width: 768px) 100vw, 20rem";

export function WithSquareArtRows() {
  const t = useMessages("pages").blog;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 lg:gap-20 lg:px-8">
        <Typography
          variant="h2"
          className="max-w-3xl text-4xl font-semibold tracking-tighter md:text-6xl"
        >
          {t.blog30Heading}
        </Typography>

        <div className="flex flex-col gap-14 lg:gap-20">
          {POSTS.map((post, index) => (
            <article
              key={post.titleKey}
              className="flex flex-col gap-8 md:flex-row md:items-center md:gap-12 lg:gap-16"
            >
              <AspectRatio
                ratio={1 / 1}
                className={
                  "bg-surface relative w-full shrink-0 rounded-2xl md:w-60 lg:w-72 " +
                  (index % 2 === 0 ? "md:order-last" : "")
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
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Typography variant="overline">
                    {t[post.categoryKey]}
                  </Typography>
                  <span className="bg-border size-1 rounded-full" />
                  <Typography
                    variant="caption"
                    className="tracking-widest uppercase"
                  >
                    {t[post.dateKey]}
                  </Typography>
                </div>
                <Typography
                  variant="h3"
                  className="text-2xl font-semibold tracking-tight md:text-3xl"
                >
                  {t[post.titleKey]}
                </Typography>
                <Typography variant="body" className="text-muted max-w-xl">
                  {t[post.summaryKey]}
                </Typography>
                <a
                  href={LINK_URL}
                  className="group mt-1 inline-flex w-fit items-center gap-1.5 text-sm font-semibold transition-all hover:gap-3"
                >
                  {t.blog30Read}
                  <IconArrowUpRight size={16} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
