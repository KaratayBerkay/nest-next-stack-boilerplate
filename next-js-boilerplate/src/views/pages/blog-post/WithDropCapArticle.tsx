"use client";

import Image from "next/image";
import { IconClock, IconCalendar } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { BlogPostMessages } from "@/types/pages/blog-post/BlogPostMessages-types";

export function WithDropCapArticle() {
  const t = (
    useMessages("pages") as unknown as {
      blogPost: BlogPostMessages;
    }
  ).blogPost;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-2xl flex-col px-4 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {t.blogPost12Category}
          </span>
          <Typography
            variant="h2"
            className="max-w-2xl text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blogPost12Title}
          </Typography>
          <div className="text-muted flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5">
              <IconClock size={14} aria-hidden="true" />
              {t.blogPost12ReadTime}
            </span>
            <span className="flex items-center gap-1.5">
              <IconCalendar size={14} aria-hidden="true" />
              {t.blogPost12Date}
            </span>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-8">
          <Typography
            variant="bodyLarge"
            className="leading-relaxed first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-6xl first-letter:leading-[0.8] first-letter:font-medium"
          >
            {t.blogPost12Paragraph1}
          </Typography>

          <AspectRatio
            ratio={16 / 9}
            className="bg-surface relative rounded-2xl"
          >
            <Image
              src="https://picsum.photos/seed/blogpost12-hero/1200/675"
              alt={t.blogPost12ImageAlt}
              fill
              sizes="(max-width: 672px) 100vw, 42rem"
              className="object-cover"
            />
          </AspectRatio>

          <div className="flex flex-col gap-4">
            <Typography
              variant="h3"
              className="text-xl font-medium tracking-tight"
            >
              {t.blogPost12Heading1}
            </Typography>
            <Typography variant="body" className="text-muted leading-relaxed">
              {t.blogPost12Paragraph2}
            </Typography>
          </div>

          <div className="flex flex-col gap-4">
            <Typography
              variant="h3"
              className="text-xl font-medium tracking-tight"
            >
              {t.blogPost12Heading2}
            </Typography>
            <Typography variant="body" className="text-muted leading-relaxed">
              {t.blogPost12Paragraph3}
            </Typography>
          </div>

          <Typography variant="body" className="leading-relaxed">
            {t.blogPost12Conclusion}
          </Typography>
        </div>
      </div>
    </section>
  );
}
