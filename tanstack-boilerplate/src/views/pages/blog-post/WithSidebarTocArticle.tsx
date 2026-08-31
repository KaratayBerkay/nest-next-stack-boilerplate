"use client";

import Image from "next/image";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Avatar } from "@/components/ui/Avatar";
import { Quote, Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  BlogPostTocItem,
  PagesWithBlogPostMessages,
} from "@/types/pages/blog-post/BlogPostMessages-types";

const TOC_ITEMS: BlogPostTocItem[] = [
  {
    number: 1,
    labelKey: "blogPost8Section1Heading",
    paragraph1Key: "blogPost8Section1Paragraph1",
    paragraph2Key: "blogPost8Section1Paragraph2",
  },
  {
    number: 2,
    labelKey: "blogPost8Section2Heading",
    paragraph1Key: "blogPost8Section2Paragraph1",
    paragraph2Key: "blogPost8Section2Paragraph2",
    quoteKey: "blogPost8Quote",
  },
  {
    number: 3,
    labelKey: "blogPost8Section3Heading",
    paragraph1Key: "blogPost8Section3Paragraph",
  },
  {
    number: 4,
    labelKey: "blogPost8Section4Heading",
    paragraph1Key: "blogPost8Section4Paragraph",
  },
];

const AUTHOR_AVATAR_URL = "/img/placeholders/ph-1x1-3.webp" as const;

export function WithSidebarTocArticle() {
  const t = (useMessages("pages") as unknown as PagesWithBlogPostMessages)
    .blogPost;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 lg:px-8">
        <div className="flex flex-col items-center gap-5 text-center">
          <Typography
            variant="h2"
            className="max-w-3xl text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blogPost8Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {t.blogPost8Summary}
          </Typography>
          <div className="flex items-center gap-3 pt-2">
            <Avatar
              src={AUTHOR_AVATAR_URL}
              alt={t.blogPost8AuthorName}
              fallback={t.blogPost8AuthorName.slice(0, 2)}
              size="md"
            />
            <div className="flex flex-col items-start gap-0.5 text-left">
              <span className="text-sm font-medium">
                {t.blogPost8AuthorName}
              </span>
              <Typography variant="caption">{t.blogPost8Date}</Typography>
            </div>
          </div>
        </div>

        <AspectRatio
          ratio={21 / 9}
          className="bg-surface relative overflow-hidden rounded-2xl"
        >
          <Image
            src="/img/placeholders/ph-2x1-7.webp"
            alt={t.blogPost8HeroImageAlt}
            fill
            sizes="(max-width: 768px) 100vw, 80vw"
            className="object-cover"
          />
        </AspectRatio>

        <div className="flex flex-col gap-10 lg:flex-row">
          <article className="flex min-w-0 flex-1 flex-col gap-10">
            {TOC_ITEMS.map((item) => (
              <section
                key={item.labelKey}
                className="flex scroll-mt-24 flex-col gap-4"
              >
                <Typography
                  variant="h3"
                  className="text-2xl font-medium tracking-tighter"
                >
                  {t[item.labelKey]}
                </Typography>
                <Typography variant="body" className="text-muted">
                  {t[item.paragraph1Key]}
                </Typography>
                {item.paragraph2Key && (
                  <Typography variant="body" className="text-muted">
                    {t[item.paragraph2Key]}
                  </Typography>
                )}
                {item.quoteKey && (
                  <Quote className="text-muted">{t[item.quoteKey]}</Quote>
                )}
              </section>
            ))}
          </article>

          <aside className="hidden shrink-0 lg:block lg:w-64">
            <div className="border-border bg-surface rounded-2xl border p-5 lg:sticky lg:top-24">
              <p className="text-muted mb-4 text-xs font-semibold tracking-wider uppercase">
                {t.blogPost8TocTitle}
              </p>
              <nav
                aria-label={t.blogPost8TocTitle}
                className="flex flex-col gap-1"
              >
                {TOC_ITEMS.map((item) => (
                  <button
                    key={item.labelKey}
                    type="button"
                    className="hover:bg-surface-hover flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors"
                  >
                    <span className="text-muted w-5 shrink-0 text-xs font-medium tabular-nums">
                      {item.number}
                    </span>
                    <span className="text-muted hover:text-fg transition-colors">
                      {t[item.labelKey]}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
