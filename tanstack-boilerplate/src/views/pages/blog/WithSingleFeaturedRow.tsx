"use client";

import Image from "next/image";
import { IconArrowRight } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { BlogFeaturedPost } from "@/types/pages/blog/BlogBlocks-types";
const LINK_URL = "https://example.com" as const;

const POST = {
  src: "/img/placeholders/ph-3x2-1.webp",
  categoryKey: "blog40Category",
  titleKey: "blog40Title",
  excerptKey: "blog40Excerpt",
  authorKey: "blog40Author",
  dateKey: "blog40Date",
} as const satisfies BlogFeaturedPost;

const IMAGE_SIZES = "(max-width: 768px) 100vw, 50vw";

export function WithSingleFeaturedRow() {
  const t = useMessages("pages").blog;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 lg:gap-16 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Typography variant="overline">{t.blog40Label}</Typography>
          <Typography
            variant="h2"
            className="max-w-2xl text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blog40Heading}
          </Typography>
        </div>

        <Card className="group overflow-hidden">
          <div className="grid gap-8 p-6 md:grid-cols-2 md:items-center md:gap-12 md:p-10">
            <div className="overflow-hidden rounded-xl">
              <AspectRatio ratio={16 / 10} className="bg-surface relative">
                <Image
                  src={POST.src}
                  alt={t[POST.titleKey]}
                  fill
                  sizes={IMAGE_SIZES}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </AspectRatio>
            </div>
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary" size="sm">
                  {t[POST.categoryKey]}
                </Badge>
                <Typography variant="caption">
                  {t[POST.authorKey]} · {t[POST.dateKey]}
                </Typography>
              </div>
              <Typography
                variant="h3"
                className="text-2xl font-semibold tracking-tight md:text-3xl"
              >
                {t[POST.titleKey]}
              </Typography>
              <Typography variant="body" className="text-muted">
                {t[POST.excerptKey]}
              </Typography>
              <a
                href={LINK_URL}
                className="group text-brand inline-flex w-fit items-center gap-1.5 text-sm font-semibold"
              >
                {t.blog40Read}
                <IconArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </a>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
