"use client";

import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { Blog19Post } from "@/types/pages/blog/WithRelatedGrid-types";

const POSTS: Blog19Post[] = [
  {
    categoryKey: "blog19Post1Category",
    titleKey: "blog19Post1Title",
    descriptionKey: "blog19Post1Description",
    dateKey: "blog19Post1Date",
  },
  {
    categoryKey: "blog19Post2Category",
    titleKey: "blog19Post2Title",
    descriptionKey: "blog19Post2Description",
    dateKey: "blog19Post2Date",
  },
  {
    categoryKey: "blog19Post3Category",
    titleKey: "blog19Post3Title",
    descriptionKey: "blog19Post3Description",
    dateKey: "blog19Post3Date",
  },
  {
    categoryKey: "blog19Post4Category",
    titleKey: "blog19Post4Title",
    descriptionKey: "blog19Post4Description",
    dateKey: "blog19Post4Date",
  },
];

const ARTICLE_URL = "#";

export function WithRelatedGrid() {
  const t = useMessages("pages").blog;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 lg:gap-12 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {t.blog19Heading}
          </Typography>
          <Button variant="outline" size="sm" asChild>
            <a href={ARTICLE_URL}>{t.blog19ViewAll}</a>
          </Button>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {POSTS.map((post) => (
            <a
              key={post.titleKey}
              href={ARTICLE_URL}
              className="group flex flex-col gap-3"
            >
              <Typography variant="overline">{t[post.categoryKey]}</Typography>
              <Typography
                variant="h3"
                className="group-hover:text-brand text-lg font-medium tracking-tight transition-colors"
              >
                {t[post.titleKey]}
              </Typography>
              <Typography variant="bodySmall" className="text-muted">
                {t[post.descriptionKey]}
              </Typography>
              <Typography variant="caption">{t[post.dateKey]}</Typography>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
