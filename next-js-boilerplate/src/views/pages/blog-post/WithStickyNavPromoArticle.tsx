"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { IconAlertCircle, IconClock } from "@tabler/icons-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/Alert";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { Quote, Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { BlogPostPagesMessages } from "@/types/pages/blog-post/BlogPostMessages-types";
import type {
  BlogPostNavItem,
  BlogPostTableRow,
} from "@/types/pages/blog-post/WithStickyNavPromoArticle-types";

const LINK_URL = "https://example.com" as const;

const NAV_ITEMS: BlogPostNavItem[] = [
  { id: "bp3-section-1", labelKey: "blogPost3NavItem1" },
  { id: "bp3-section-2", labelKey: "blogPost3NavItem2" },
  { id: "bp3-section-3", labelKey: "blogPost3NavItem3" },
  { id: "bp3-section-4", labelKey: "blogPost3NavItem4" },
];

const TABLE_ROWS: BlogPostTableRow[] = [
  {
    col1Key: "blogPost3TableRow1Col1",
    col2Key: "blogPost3TableRow1Col2",
    col3Key: "blogPost3TableRow1Col3",
  },
  {
    col1Key: "blogPost3TableRow2Col1",
    col2Key: "blogPost3TableRow2Col2",
    col3Key: "blogPost3TableRow2Col3",
  },
  {
    col1Key: "blogPost3TableRow3Col1",
    col2Key: "blogPost3TableRow3Col2",
    col3Key: "blogPost3TableRow3Col3",
  },
];

function handleSectionIntersect(
  entries: IntersectionObserverEntry[],
  setActiveId: Dispatch<SetStateAction<string>>,
) {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      setActiveId(entry.target.id);
      return;
    }
  }
}

function handleNavClick(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function WithStickyNavPromoArticle() {
  const t = (useMessages("pages") as unknown as BlogPostPagesMessages).blogPost;
  const [activeId, setActiveId] = useState(NAV_ITEMS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => handleSectionIntersect(entries, setActiveId),
      { rootMargin: "-20% 0px -70% 0px" },
    );
    for (const item of NAV_ITEMS) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 lg:px-8">
        <header className="flex flex-col items-center gap-4 text-center">
          <Badge variant="soft" pill>
            {t.blogPost3Badge}
          </Badge>
          <Typography
            variant="h1"
            className="max-w-2xl text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blogPost3Heading}
          </Typography>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            <Avatar
              src="https://picsum.photos/seed/blogpost3-author/128/128"
              alt={t.blogPost3AuthorName}
              fallback={t.blogPost3AuthorName}
              size="sm"
            />
            <span className="font-medium">{t.blogPost3AuthorName}</span>
            <span aria-hidden="true" className="text-muted">
              ·
            </span>
            <span className="text-muted flex items-center gap-1">
              <IconClock size={14} aria-hidden="true" />
              {t.blogPost3MetaReadTime}
            </span>
            <span aria-hidden="true" className="text-muted">
              ·
            </span>
            <span className="text-muted">{t.blogPost3MetaDate}</span>
          </div>
          <AspectRatio
            ratio={16 / 9}
            className="border-border bg-surface relative mt-4 w-full rounded-2xl border"
          >
            <Image
              src="https://picsum.photos/seed/blogpost3-hero/1600/900"
              alt={t.blogPost3HeroAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover"
            />
          </AspectRatio>
        </header>

        <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)_300px]">
          <nav
            aria-label={t.blogPost3NavLabel}
            className="hidden lg:sticky lg:top-24 lg:block lg:self-start"
          >
            <Typography variant="overline">{t.blogPost3NavLabel}</Typography>
            <ul className="mt-3 flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={cn(
                      "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                      activeId === item.id
                        ? "text-brand font-medium"
                        : "text-muted hover:bg-surface hover:text-fg",
                    )}
                  >
                    {t[item.labelKey]}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <article className="flex min-w-0 flex-col gap-10">
            <div
              id="bp3-section-1"
              className="flex scroll-mt-24 flex-col gap-4"
            >
              <Typography variant="h2">{t.blogPost3Section1Heading}</Typography>
              <Typography variant="body" className="text-muted">
                {t.blogPost3Section1Body}
              </Typography>
              <Alert variant="info">
                <div className="flex gap-3">
                  <IconAlertCircle
                    size={20}
                    className="mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <div className="flex flex-col gap-1">
                    <AlertTitle>{t.blogPost3AlertTitle}</AlertTitle>
                    <AlertDescription>{t.blogPost3AlertBody}</AlertDescription>
                  </div>
                </div>
              </Alert>
            </div>

            <div
              id="bp3-section-2"
              className="flex scroll-mt-24 flex-col gap-4"
            >
              <Typography variant="h2">{t.blogPost3Section2Heading}</Typography>
              <Typography variant="body" className="text-muted">
                {t.blogPost3Section2Body}
              </Typography>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.blogPost3TableCol1}</TableHead>
                    <TableHead>{t.blogPost3TableCol2}</TableHead>
                    <TableHead>{t.blogPost3TableCol3}</TableHead>
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

            <div
              id="bp3-section-3"
              className="flex scroll-mt-24 flex-col gap-4"
            >
              <Typography variant="h2">{t.blogPost3Section3Heading}</Typography>
              <Typography variant="body" className="text-muted">
                {t.blogPost3Section3Body}
              </Typography>
              <Quote className="text-muted">{t.blogPost3Quote}</Quote>
            </div>

            <div
              id="bp3-section-4"
              className="flex scroll-mt-24 flex-col gap-4"
            >
              <Typography variant="h2">{t.blogPost3Section4Heading}</Typography>
              <Typography variant="body" className="text-muted">
                {t.blogPost3Section4Body}
              </Typography>
            </div>
          </article>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="border-border bg-surface flex flex-col gap-4 rounded-2xl border p-6">
              <Typography
                variant="h3"
                className="text-xl font-medium tracking-tight"
              >
                {t.blogPost3PromoHeading}
              </Typography>
              <Typography variant="bodySmall" className="text-muted">
                {t.blogPost3PromoBody}
              </Typography>
              <Button variant="primary" size="lg" className="w-full" asChild>
                <a href={LINK_URL}>{t.blogPost3PromoCta}</a>
              </Button>
              <Typography variant="caption" className="text-center">
                {t.blogPost3PromoNote}
              </Typography>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
