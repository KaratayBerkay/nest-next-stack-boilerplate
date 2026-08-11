"use client";

import Image from "next/image";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { Blog5Post } from "@/types/pages/blog/WithLargeGrid-types";
const LINK_URL = "https://example.com" as const;

const POSTS: Blog5Post[] = [
  {
    titleKey: "blog5Post1Title",
    dateKey: "blog5Post1Date",
    categoryKey: "blog5CategoryDesign",
    imageSeed: "blog5-1",
  },
  {
    titleKey: "blog5Post2Title",
    dateKey: "blog5Post2Date",
    categoryKey: "blog5CategoryEngineering",
    imageSeed: "blog5-2",
  },
  {
    titleKey: "blog5Post3Title",
    dateKey: "blog5Post3Date",
    categoryKey: "blog5CategoryProduct",
    imageSeed: "blog5-3",
  },
  {
    titleKey: "blog5Post4Title",
    dateKey: "blog5Post4Date",
    categoryKey: "blog5CategoryDesign",
    imageSeed: "blog5-4",
  },
  {
    titleKey: "blog5Post5Title",
    dateKey: "blog5Post5Date",
    categoryKey: "blog5CategoryEngineering",
    imageSeed: "blog5-5",
  },
  {
    titleKey: "blog5Post6Title",
    dateKey: "blog5Post6Date",
    categoryKey: "blog5CategoryProduct",
    imageSeed: "blog5-6",
  },
  {
    titleKey: "blog5Post7Title",
    dateKey: "blog5Post7Date",
    categoryKey: "blog5CategoryDesign",
    imageSeed: "blog5-7",
  },
  {
    titleKey: "blog5Post8Title",
    dateKey: "blog5Post8Date",
    categoryKey: "blog5CategoryEngineering",
    imageSeed: "blog5-8",
  },
  {
    titleKey: "blog5Post9Title",
    dateKey: "blog5Post9Date",
    categoryKey: "blog5CategoryProduct",
    imageSeed: "blog5-9",
  },
];

export function WithLargeGrid() {
  const t = useMessages("pages").blog;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 lg:px-8">
        <div className="flex flex-col gap-4">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blog5Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {t.blog5Subtext}
          </Typography>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {POSTS.map((post) => (
            <article key={post.titleKey} className="group flex flex-col gap-4">
              <AspectRatio
                ratio={16 / 10}
                className="bg-surface relative overflow-hidden rounded-2xl"
              >
                <Image
                  src={`https://picsum.photos/seed/${post.imageSeed}/800/500`}
                  alt={t[post.titleKey]}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </AspectRatio>
              <div className="flex flex-col gap-2">
                <Badge variant="secondary" size="sm" className="w-fit">
                  {t[post.categoryKey]}
                </Badge>
                <h3 className="text-lg font-medium tracking-tight">
                  <a
                    href={LINK_URL}
                    className="hover:text-brand transition-colors"
                  >
                    {t[post.titleKey]}
                  </a>
                </h3>
                <Typography variant="caption">{t[post.dateKey]}</Typography>
              </div>
            </article>
          ))}
        </div>

        <Button variant="secondary" className="w-full md:hidden">
          {t.blog5ViewAll}
        </Button>
      </div>
    </section>
  );
}
