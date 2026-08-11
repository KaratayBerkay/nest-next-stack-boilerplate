"use client";

import Image from "next/image";
import { IconArrowUpRight } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { Blog3Post } from "@/types/pages/blog/WithLabeledGrid-types";
const LINK_URL = "https://example.com" as const;

const POSTS: Blog3Post[] = [
  {
    titleKey: "blog3Post1Title",
    descriptionKey: "blog3Post1Description",
    categoryKey: "blog3Post1Category",
    imageSeed: "blog3-1",
  },
  {
    titleKey: "blog3Post2Title",
    descriptionKey: "blog3Post2Description",
    categoryKey: "blog3Post2Category",
    imageSeed: "blog3-2",
  },
  {
    titleKey: "blog3Post3Title",
    descriptionKey: "blog3Post3Description",
    categoryKey: "blog3Post3Category",
    imageSeed: "blog3-3",
  },
  {
    titleKey: "blog3Post4Title",
    descriptionKey: "blog3Post4Description",
    categoryKey: "blog3Post4Category",
    imageSeed: "blog3-4",
  },
  {
    titleKey: "blog3Post5Title",
    descriptionKey: "blog3Post5Description",
    categoryKey: "blog3Post5Category",
    imageSeed: "blog3-5",
  },
  {
    titleKey: "blog3Post6Title",
    descriptionKey: "blog3Post6Description",
    categoryKey: "blog3Post6Category",
    imageSeed: "blog3-6",
  },
];

export function WithLabeledGrid() {
  const t = useMessages("pages").blog;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <Typography
            variant="h2"
            className="max-w-xl text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blog3Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-md">
            {t.blog3Subtext}
          </Typography>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {POSTS.map((post) => (
            <article key={post.titleKey} className="group flex flex-col gap-4">
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
                <Typography variant="overline" className="text-brand">
                  {t[post.categoryKey]}
                </Typography>
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
                <Button
                  variant="link"
                  size="sm"
                  className="mt-1 w-fit px-0"
                  rightIcon={<IconArrowUpRight size={16} />}
                  asChild
                >
                  <a href={LINK_URL}>{t.blog3ReadMore}</a>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
