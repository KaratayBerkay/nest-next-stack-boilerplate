"use client";

import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  IconArrowUp,
  IconBrandLinkedin,
  IconCheck,
  IconClock,
  IconLink,
  IconX,
} from "@tabler/icons-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/Breadcrumb";
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
} from "@/types/pages/blog-post/WithBreadcrumbShareArticle-types";

const LINK_URL = "https://example.com" as const;
const SHARE_URL = "https://example.com/article" as const;

const NAV_ITEMS: BlogPostNavItem[] = [
  { id: "bp4-section-1", labelKey: "blogPost4NavItem1" },
  { id: "bp4-section-2", labelKey: "blogPost4NavItem2" },
  { id: "bp4-section-3", labelKey: "blogPost4NavItem3" },
  { id: "bp4-section-4", labelKey: "blogPost4NavItem4" },
];

const TABLE_ROWS: BlogPostTableRow[] = [
  {
    col1Key: "blogPost4TableRow1Col1",
    col2Key: "blogPost4TableRow1Col2",
    col3Key: "blogPost4TableRow1Col3",
  },
  {
    col1Key: "blogPost4TableRow2Col1",
    col2Key: "blogPost4TableRow2Col2",
    col3Key: "blogPost4TableRow2Col3",
  },
  {
    col1Key: "blogPost4TableRow3Col1",
    col2Key: "blogPost4TableRow3Col2",
    col3Key: "blogPost4TableRow3Col3",
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

function handleScrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function handleCopyLink(setCopied: Dispatch<SetStateAction<boolean>>) {
  try {
    await navigator.clipboard.writeText(SHARE_URL);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  } catch {
    setCopied(false);
  }
}

export function WithBreadcrumbShareArticle() {
  const t = (useMessages("pages") as unknown as BlogPostPagesMessages).blogPost;
  const [activeId, setActiveId] = useState(NAV_ITEMS[0].id);
  const [copied, setCopied] = useState(false);

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
                {t.blogPost4BreadcrumbHome}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={LINK_URL}>
                {t.blogPost4BreadcrumbBlog}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t.blogPost4Title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <header className="flex flex-col gap-5">
          <Typography
            variant="h1"
            className="max-w-3xl text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blogPost4Title}
          </Typography>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="font-medium">{t.blogPost4AuthorName}</span>
            <span aria-hidden="true" className="text-muted">
              ·
            </span>
            <span className="text-muted">{t.blogPost4MetaDate}</span>
            <span aria-hidden="true" className="text-muted">
              ·
            </span>
            <span className="text-muted flex items-center gap-1">
              <IconClock size={14} aria-hidden="true" />
              {t.blogPost4MetaReadTime}
            </span>
          </div>
          <div className="border-border border-t" />
        </header>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_240px]">
          <article className="flex min-w-0 flex-col gap-10">
            <Typography variant="bodyLarge">{t.blogPost4Lead}</Typography>

            <div
              id="bp4-section-1"
              className="flex scroll-mt-24 flex-col gap-4"
            >
              <Typography variant="h2">{t.blogPost4Section1Heading}</Typography>
              <Typography variant="body" className="text-muted">
                {t.blogPost4Section1Body}
              </Typography>
            </div>

            <div
              id="bp4-section-2"
              className="flex scroll-mt-24 flex-col gap-4"
            >
              <Typography variant="h2">{t.blogPost4Section2Heading}</Typography>
              <Typography variant="body" className="text-muted">
                {t.blogPost4Section2Body}
              </Typography>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.blogPost4TableCol1}</TableHead>
                    <TableHead>{t.blogPost4TableCol2}</TableHead>
                    <TableHead>{t.blogPost4TableCol3}</TableHead>
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
              <Quote className="text-muted">{t.blogPost4Quote}</Quote>
            </div>

            <div
              id="bp4-section-3"
              className="flex scroll-mt-24 flex-col gap-4"
            >
              <Typography variant="h2">{t.blogPost4Section3Heading}</Typography>
              <Typography variant="body" className="text-muted">
                {t.blogPost4Section3Body}
              </Typography>
            </div>

            <div
              id="bp4-section-4"
              className="flex scroll-mt-24 flex-col gap-4"
            >
              <Typography variant="h2">{t.blogPost4Section4Heading}</Typography>
              <Typography variant="body" className="text-muted">
                {t.blogPost4Section4Body}
              </Typography>
            </div>

            <Button
              variant="link"
              className="w-fit"
              onClick={handleScrollToTop}
            >
              <IconArrowUp size={16} aria-hidden="true" />
              {t.blogPost4BackToTop}
            </Button>
          </article>

          <aside className="hidden lg:sticky lg:top-24 lg:flex lg:h-fit lg:flex-col lg:gap-8">
            <nav
              aria-label={t.blogPost4NavLabel}
              className="flex flex-col gap-3"
            >
              <Typography variant="overline">{t.blogPost4NavLabel}</Typography>
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
                {t.blogPost4ShareLabel}
              </Typography>
              <div className="flex items-center gap-2">
                <a
                  href={LINK_URL}
                  aria-label={t.blogPost4ShareX}
                  className="border-border text-muted hover:bg-surface-hover hover:text-fg inline-flex size-10 items-center justify-center rounded-full border transition-colors"
                >
                  <IconX size={18} aria-hidden="true" />
                </a>
                <a
                  href={LINK_URL}
                  aria-label={t.blogPost4ShareLinkedIn}
                  className="border-border text-muted hover:bg-surface-hover hover:text-fg inline-flex size-10 items-center justify-center rounded-full border transition-colors"
                >
                  <IconBrandLinkedin size={18} aria-hidden="true" />
                </a>
                <button
                  type="button"
                  onClick={() => handleCopyLink(setCopied)}
                  aria-label={t.blogPost4CopyLink}
                  className="border-border text-muted hover:bg-surface-hover hover:text-fg relative inline-flex size-10 items-center justify-center rounded-full border transition-colors"
                >
                  {copied ? (
                    <IconCheck
                      size={18}
                      className="text-success"
                      aria-hidden="true"
                    />
                  ) : (
                    <IconLink size={18} aria-hidden="true" />
                  )}
                  {copied && (
                    <span className="text-success absolute top-12 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap">
                      {t.blogPost4Copied}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleScrollToTop}
            >
              <IconArrowUp size={16} aria-hidden="true" />
              {t.blogPost4BackToTop}
            </Button>
          </aside>
        </div>
      </div>
    </section>
  );
}
