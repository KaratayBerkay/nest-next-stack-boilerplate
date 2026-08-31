"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  IconAlertCircle,
  IconBrandLinkedin,
  IconClock,
  IconLink,
  IconX,
} from "@tabler/icons-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/Alert";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Avatar } from "@/components/ui/Avatar";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/Breadcrumb";
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
} from "@/types/pages/blog-post/WithOffsetRailArticle-types";

const LINK_URL = "https://example.com" as const;

const NAV_ITEMS: BlogPostNavItem[] = [
  { id: "bp5-section-1", labelKey: "blogPost5NavItem1" },
  { id: "bp5-section-2", labelKey: "blogPost5NavItem2" },
  { id: "bp5-section-3", labelKey: "blogPost5NavItem3" },
  { id: "bp5-section-4", labelKey: "blogPost5NavItem4" },
];

const TABLE_ROWS: BlogPostTableRow[] = [
  {
    col1Key: "blogPost5TableRow1Col1",
    col2Key: "blogPost5TableRow1Col2",
    col3Key: "blogPost5TableRow1Col3",
  },
  {
    col1Key: "blogPost5TableRow2Col1",
    col2Key: "blogPost5TableRow2Col2",
    col3Key: "blogPost5TableRow2Col3",
  },
  {
    col1Key: "blogPost5TableRow3Col1",
    col2Key: "blogPost5TableRow3Col2",
    col3Key: "blogPost5TableRow3Col3",
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

export function WithOffsetRailArticle() {
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
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 lg:px-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={LINK_URL}>
                {t.blogPost5BreadcrumbHome}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={LINK_URL}>
                {t.blogPost5BreadcrumbBlog}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t.blogPost5Heading}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <header className="flex flex-col gap-6">
          <Typography
            variant="h1"
            className="max-w-4xl text-5xl font-semibold tracking-tighter md:text-6xl lg:text-7xl"
          >
            {t.blogPost5Heading}
          </Typography>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="font-medium">{t.blogPost5AuthorName}</span>
            <span aria-hidden="true" className="text-muted">
              ·
            </span>
            <span className="text-muted">{t.blogPost5MetaDate}</span>
            <span aria-hidden="true" className="text-muted">
              ·
            </span>
            <span className="text-muted flex items-center gap-1">
              <IconClock size={14} aria-hidden="true" />
              {t.blogPost5MetaReadTime}
            </span>
          </div>
          <AspectRatio
            ratio={16 / 9}
            className="border-border bg-surface relative rounded-2xl border"
          >
            <Image
              src="/img/placeholders/ph-16x9-7.webp"
              alt={t.blogPost5HeroAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover"
            />
          </AspectRatio>
          <Typography variant="caption">{t.blogPost5HeroCaption}</Typography>
        </header>

        <div className="grid gap-10 lg:grid-cols-12">
          <article className="flex min-w-0 flex-col gap-10 lg:col-span-8">
            <div
              id="bp5-section-1"
              className="flex scroll-mt-24 flex-col gap-4"
            >
              <Typography variant="h2">{t.blogPost5Section1Heading}</Typography>
              <Typography variant="body" className="text-muted">
                {t.blogPost5Section1Body}
              </Typography>
            </div>

            <div
              id="bp5-section-2"
              className="flex scroll-mt-24 flex-col gap-4"
            >
              <Typography variant="h2">{t.blogPost5Section2Heading}</Typography>
              <Typography variant="body" className="text-muted">
                {t.blogPost5Section2Body}
              </Typography>
              <Quote className="text-muted">{t.blogPost5Quote}</Quote>
              <Alert variant="info">
                <div className="flex gap-3">
                  <IconAlertCircle
                    size={20}
                    className="mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <div className="flex flex-col gap-1">
                    <AlertTitle>{t.blogPost5AlertTitle}</AlertTitle>
                    <AlertDescription>{t.blogPost5AlertBody}</AlertDescription>
                  </div>
                </div>
              </Alert>
            </div>

            <div
              id="bp5-section-3"
              className="flex scroll-mt-24 flex-col gap-4"
            >
              <Typography variant="h2">{t.blogPost5Section3Heading}</Typography>
              <Typography variant="body" className="text-muted">
                {t.blogPost5Section3Body}
              </Typography>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.blogPost5TableCol1}</TableHead>
                    <TableHead>{t.blogPost5TableCol2}</TableHead>
                    <TableHead>{t.blogPost5TableCol3}</TableHead>
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
              id="bp5-section-4"
              className="flex scroll-mt-24 flex-col gap-4"
            >
              <Typography variant="h2">{t.blogPost5Section4Heading}</Typography>
              <Typography variant="body" className="text-muted">
                {t.blogPost5Section4Body}
              </Typography>
            </div>
          </article>

          <aside className="border-border flex flex-col gap-8 border-t pt-8 lg:sticky lg:top-24 lg:col-span-3 lg:col-start-10 lg:self-start lg:border-t-0 lg:pt-0">
            <div className="flex flex-col gap-3">
              <Typography variant="overline">
                {t.blogPost5RailAuthorLabel}
              </Typography>
              <div className="flex items-center gap-3">
                <Avatar
                  src="/img/placeholders/ph-1x1-7.webp"
                  alt={t.blogPost5AuthorName}
                  fallback={t.blogPost5AuthorName}
                  size="md"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {t.blogPost5AuthorName}
                  </span>
                  <Typography variant="caption">
                    {t.blogPost5RailDateLabel} {t.blogPost5MetaDate}
                  </Typography>
                </div>
              </div>
            </div>

            <nav
              aria-label={t.blogPost5NavLabel}
              className="flex flex-col gap-3"
            >
              <Typography variant="overline">{t.blogPost5NavLabel}</Typography>
              <ul className="flex flex-col gap-1">
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

            <div className="flex flex-col gap-3">
              <Typography variant="overline">
                {t.blogPost5ShareLabel}
              </Typography>
              <div className="flex items-center gap-2">
                <a
                  href={LINK_URL}
                  aria-label={t.blogPost5ShareX}
                  className="border-border text-muted hover:bg-surface-hover hover:text-fg inline-flex size-9 items-center justify-center rounded-full border transition-colors"
                >
                  <IconX size={16} aria-hidden="true" />
                </a>
                <a
                  href={LINK_URL}
                  aria-label={t.blogPost5ShareLinkedIn}
                  className="border-border text-muted hover:bg-surface-hover hover:text-fg inline-flex size-9 items-center justify-center rounded-full border transition-colors"
                >
                  <IconBrandLinkedin size={16} aria-hidden="true" />
                </a>
                <a
                  href={LINK_URL}
                  aria-label={t.blogPost5ShareLink}
                  className="border-border text-muted hover:bg-surface-hover hover:text-fg inline-flex size-9 items-center justify-center rounded-full border transition-colors"
                >
                  <IconLink size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
