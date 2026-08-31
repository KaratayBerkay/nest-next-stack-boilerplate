"use client";

import Image from "next/image";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Badge } from "@/components/ui/Badge";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { Blog33Post } from "@/types/pages/blog/WithCompactFourColumn-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const POSTS: Blog33Post[] = [
  {
    seed: "blog33-1",
    ratio: 16 / 10,
    categoryKey: "blog33Post1Category",
    titleKey: "blog33Post1Title",
    dateKey: "blog33Post1Date",
  },
  {
    seed: "blog33-2",
    ratio: 16 / 10,
    categoryKey: "blog33Post2Category",
    titleKey: "blog33Post2Title",
    dateKey: "blog33Post2Date",
  },
  {
    seed: "blog33-3",
    ratio: 16 / 10,
    categoryKey: "blog33Post3Category",
    titleKey: "blog33Post3Title",
    dateKey: "blog33Post3Date",
  },
  {
    seed: "blog33-4",
    ratio: 16 / 10,
    categoryKey: "blog33Post4Category",
    titleKey: "blog33Post4Title",
    dateKey: "blog33Post4Date",
  },
  {
    seed: "blog33-5",
    ratio: 16 / 10,
    categoryKey: "blog33Post5Category",
    titleKey: "blog33Post5Title",
    dateKey: "blog33Post5Date",
  },
  {
    seed: "blog33-6",
    ratio: 16 / 10,
    categoryKey: "blog33Post6Category",
    titleKey: "blog33Post6Title",
    dateKey: "blog33Post6Date",
  },
  {
    seed: "blog33-7",
    ratio: 16 / 10,
    categoryKey: "blog33Post7Category",
    titleKey: "blog33Post7Title",
    dateKey: "blog33Post7Date",
  },
  {
    seed: "blog33-8",
    ratio: 16 / 10,
    categoryKey: "blog33Post8Category",
    titleKey: "blog33Post8Title",
    dateKey: "blog33Post8Date",
  },
];

const IMAGE_SIZES = "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw";
const ARTICLE_URL = "#";

export function WithCompactFourColumn() {
  const t = useMessages("pages").blog;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 lg:gap-16 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blog33Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {t.blog33Description}
          </Typography>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {POSTS.map((post) => (
            <a
              key={post.seed}
              href={ARTICLE_URL}
              className="group flex flex-col gap-4"
            >
              <AspectRatio
                ratio={post.ratio}
                className="bg-surface relative overflow-hidden rounded-xl"
              >
                <Image
                  src={placeholderImage(post.seed, "3x2")}
                  alt={t[post.titleKey]}
                  fill
                  sizes={IMAGE_SIZES}
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </AspectRatio>

              <div className="flex flex-col gap-2">
                <Badge
                  variant="secondary"
                  pill
                  size="sm"
                  fontSize="text-xs"
                  className="w-fit px-2.5 py-1"
                >
                  {t[post.categoryKey]}
                </Badge>
                <Typography
                  variant="h3"
                  className="group-hover:text-brand text-base font-medium tracking-tight transition-colors"
                >
                  {t[post.titleKey]}
                </Typography>
                <Typography variant="caption">{t[post.dateKey]}</Typography>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
