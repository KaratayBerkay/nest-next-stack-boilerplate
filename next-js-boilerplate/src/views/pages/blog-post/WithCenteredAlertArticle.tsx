"use client";

import Image from "next/image";
import { IconAlertCircle, IconClock } from "@tabler/icons-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/Alert";
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
import type { BlogPostTableRow } from "@/types/pages/blog-post/WithCenteredAlertArticle-types";

const LINK_URL = "https://example.com" as const;

const TABLE_ROWS: BlogPostTableRow[] = [
  {
    col1Key: "blogPost1TableRow1Col1",
    col2Key: "blogPost1TableRow1Col2",
    col3Key: "blogPost1TableRow1Col3",
  },
  {
    col1Key: "blogPost1TableRow2Col1",
    col2Key: "blogPost1TableRow2Col2",
    col3Key: "blogPost1TableRow2Col3",
  },
  {
    col1Key: "blogPost1TableRow3Col1",
    col2Key: "blogPost1TableRow3Col2",
    col3Key: "blogPost1TableRow3Col3",
  },
];

const LIST_KEYS = ["blogPost1List1", "blogPost1List2", "blogPost1List3"];

export function WithCenteredAlertArticle() {
  const t = (useMessages("pages") as unknown as BlogPostPagesMessages).blogPost;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-3xl flex-col gap-12 px-4 lg:px-8">
        <header className="flex flex-col items-center gap-4 text-center">
          <Typography variant="overline">{t.blogPost1Category}</Typography>
          <Typography
            variant="h1"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blogPost1Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {t.blogPost1Subheading}
          </Typography>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-sm">
            <Avatar
              src="https://picsum.photos/seed/blogpost1-author/128/128"
              alt={t.blogPost1MetaAuthor}
              fallback={t.blogPost1MetaAuthor}
              size="md"
            />
            <span className="font-medium">{t.blogPost1MetaAuthor}</span>
            <span aria-hidden="true" className="text-muted">
              ·
            </span>
            <a href={LINK_URL} className="text-brand hover:underline">
              {t.blogPost1MetaSiteLabel}
            </a>
            <span aria-hidden="true" className="text-muted">
              ·
            </span>
            <span className="text-muted flex items-center gap-1">
              <IconClock size={14} />
              {t.blogPost1MetaReadTime}
            </span>
            <span aria-hidden="true" className="text-muted">
              ·
            </span>
            <span className="text-muted">{t.blogPost1MetaDate}</span>
          </div>
        </header>

        <AspectRatio
          ratio={16 / 9}
          className="border-border bg-surface relative rounded-2xl border"
        >
          <Image
            src="https://picsum.photos/seed/blogpost1-hero/1600/900"
            alt={t.blogPost1HeroAlt}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </AspectRatio>

        <div className="flex flex-col gap-8">
          <Typography variant="bodyLarge">{t.blogPost1Intro}</Typography>

          <Alert variant="info">
            <div className="flex gap-3">
              <IconAlertCircle
                size={20}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <div className="flex flex-col gap-1">
                <AlertTitle>{t.blogPost1AlertTitle}</AlertTitle>
                <AlertDescription>{t.blogPost1AlertBody}</AlertDescription>
              </div>
            </div>
          </Alert>

          <div className="flex flex-col gap-4">
            <Typography variant="h2">{t.blogPost1Section1Heading}</Typography>
            <Typography variant="body" className="text-muted">
              {t.blogPost1Section1Body}
            </Typography>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.blogPost1TableCol1}</TableHead>
                  <TableHead>{t.blogPost1TableCol2}</TableHead>
                  <TableHead>{t.blogPost1TableCol3}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {TABLE_ROWS.map((row) => (
                  <TableRow key={row.col1Key}>
                    <TableCell className="font-medium">
                      {t[row.col1Key]}
                    </TableCell>
                    <TableCell>{t[row.col2Key]}</TableCell>
                    <TableCell>{t[row.col3Key]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-4">
            <Typography variant="h2">{t.blogPost1Section2Heading}</Typography>
            <Typography variant="body" className="text-muted">
              {t.blogPost1Section2Body}
            </Typography>
            <Quote className="text-muted">{t.blogPost1Quote}</Quote>
            <Typography variant="body" className="text-muted">
              {t.blogPost1ListLead}
            </Typography>
            <ul className="text-muted flex list-disc flex-col gap-2 pl-6">
              {LIST_KEYS.map((key) => (
                <li key={key} className="leading-relaxed">
                  {t[key]}
                </li>
              ))}
            </ul>
          </div>

          <Typography variant="body" className="text-muted">
            {t.blogPost1Closing}
          </Typography>
        </div>
      </div>
    </section>
  );
}
