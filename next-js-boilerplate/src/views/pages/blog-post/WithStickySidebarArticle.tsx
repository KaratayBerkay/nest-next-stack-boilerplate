"use client";

import Image from "next/image";
import {
  IconBrandLinkedin,
  IconChevronLeft,
  IconClock,
  IconLink,
  IconX,
} from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Avatar } from "@/components/ui/Avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { Quote, Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { BlogPostPagesMessages } from "@/types/pages/blog-post/BlogPostMessages-types";
import type { BlogPostTwoColRow } from "@/types/pages/blog-post/WithStickySidebarArticle-types";

const LINK_URL = "https://example.com" as const;

const TABLE_ROWS: BlogPostTwoColRow[] = [
  {
    col1Key: "blogPost2TableRow1Col1",
    col2Key: "blogPost2TableRow1Col2",
  },
  {
    col1Key: "blogPost2TableRow2Col1",
    col2Key: "blogPost2TableRow2Col2",
  },
  {
    col1Key: "blogPost2TableRow3Col1",
    col2Key: "blogPost2TableRow3Col2",
  },
];

const LIST_KEYS = ["blogPost2List1", "blogPost2List2", "blogPost2List3"];

export function WithStickySidebarArticle() {
  const t = (useMessages("pages") as unknown as BlogPostPagesMessages).blogPost;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-[260px_1fr] lg:gap-16 lg:px-8">
        <aside className="flex flex-col gap-8 lg:sticky lg:top-8 lg:self-start">
          <a
            href={LINK_URL}
            className="text-muted hover:text-fg flex items-center gap-1 text-sm font-medium transition-colors"
          >
            <IconChevronLeft size={16} aria-hidden="true" />
            {t.blogPost2BackLabel}
          </a>

          <div className="border-border bg-surface flex flex-col gap-3 rounded-2xl border p-6">
            <Avatar
              src="https://picsum.photos/seed/blogpost2-author/128/128"
              alt={t.blogPost2AuthorName}
              fallback={t.blogPost2AuthorName}
              size="xl"
            />
            <div className="flex flex-col gap-1">
              <span className="font-medium">{t.blogPost2AuthorName}</span>
              <span className="text-muted text-sm">
                {t.blogPost2AuthorRole}
              </span>
            </div>
            <Typography variant="bodySmall" className="text-muted">
              {t.blogPost2AuthorBio}
            </Typography>
            <div className="border-border border-t pt-3">
              <Typography variant="caption">
                {t.blogPost2PublishedLabel}
              </Typography>
              <div className="text-muted mt-1 flex items-center gap-1 text-sm">
                <IconClock size={14} aria-hidden="true" />
                {t.blogPost2MetaDate} · {t.blogPost2MetaReadTime}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Typography variant="overline">{t.blogPost2ShareLabel}</Typography>
            <div className="flex items-center gap-2">
              <a
                href={LINK_URL}
                aria-label={t.blogPost2ShareX}
                className="border-border text-muted hover:bg-surface-hover hover:text-fg inline-flex size-10 items-center justify-center rounded-full border transition-colors"
              >
                <IconX size={18} aria-hidden="true" />
              </a>
              <a
                href={LINK_URL}
                aria-label={t.blogPost2ShareLinkedIn}
                className="border-border text-muted hover:bg-surface-hover hover:text-fg inline-flex size-10 items-center justify-center rounded-full border transition-colors"
              >
                <IconBrandLinkedin size={18} aria-hidden="true" />
              </a>
              <a
                href={LINK_URL}
                aria-label={t.blogPost2ShareLink}
                className="border-border text-muted hover:bg-surface-hover hover:text-fg inline-flex size-10 items-center justify-center rounded-full border transition-colors"
              >
                <IconLink size={18} aria-hidden="true" />
              </a>
            </div>
          </div>
        </aside>

        <article className="flex min-w-0 flex-col gap-8">
          <AspectRatio
            ratio={16 / 9}
            className="border-border bg-surface relative rounded-2xl border"
          >
            <Image
              src="https://picsum.photos/seed/blogpost2-hero/1600/900"
              alt={t.blogPost2HeroAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover"
            />
          </AspectRatio>

          <Typography
            variant="h1"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {t.blogPost2Title}
          </Typography>
          <Typography variant="bodyLarge">{t.blogPost2Lead}</Typography>

          <div className="flex flex-col gap-4">
            <Typography variant="h2">{t.blogPost2Section1Heading}</Typography>
            <Typography variant="body" className="text-muted">
              {t.blogPost2Section1Body}
            </Typography>
            <Quote className="text-muted">{t.blogPost2Quote}</Quote>
          </div>

          <div className="flex flex-col gap-4">
            <Typography variant="h2">{t.blogPost2Section2Heading}</Typography>
            <Typography variant="body" className="text-muted">
              {t.blogPost2Section2Body}
            </Typography>
            <ul className="text-muted flex list-disc flex-col gap-2 pl-6">
              {LIST_KEYS.map((key) => (
                <li key={key} className="leading-relaxed">
                  {t[key]}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <Typography variant="h2">{t.blogPost2Section3Heading}</Typography>
            <Typography variant="body" className="text-muted">
              {t.blogPost2Section3Body}
            </Typography>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.blogPost2TableCol1}</TableHead>
                  <TableHead>{t.blogPost2TableCol2}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {TABLE_ROWS.map((row) => (
                  <TableRow key={row.col1Key}>
                    <TableCell className="font-medium">
                      {t[row.col1Key]}
                    </TableCell>
                    <TableCell>{t[row.col2Key]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Typography variant="body" className="text-muted">
            {t.blogPost2Closing}
          </Typography>
        </article>
      </div>
    </section>
  );
}
