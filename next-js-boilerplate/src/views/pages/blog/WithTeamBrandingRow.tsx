"use client";

import { IconArrowUpRight, IconChevronRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  BrandLockupProps,
  TeamBrandingPost,
} from "@/types/pages/blog/WithTeamBrandingRow-types";

const POST_URL = "https://example.com" as const;

const POSTS: TeamBrandingPost[] = [
  {
    brandKey: "blog16Brand1Name",
    mark: "B",
    categoryKey: "blog16Post1Category",
    titleKey: "blog16Post1Title",
    descriptionKey: "blog16Post1Description",
    dateKey: "blog16Post1Date",
  },
  {
    brandKey: "blog16Brand2Name",
    mark: "F",
    categoryKey: "blog16Post2Category",
    titleKey: "blog16Post2Title",
    descriptionKey: "blog16Post2Description",
    dateKey: "blog16Post2Date",
  },
  {
    brandKey: "blog16Brand3Name",
    mark: "T",
    categoryKey: "blog16Post3Category",
    titleKey: "blog16Post3Title",
    descriptionKey: "blog16Post3Description",
    dateKey: "blog16Post3Date",
  },
  {
    brandKey: "blog16Brand4Name",
    mark: "L",
    categoryKey: "blog16Post4Category",
    titleKey: "blog16Post4Title",
    descriptionKey: "blog16Post4Description",
    dateKey: "blog16Post4Date",
  },
  {
    brandKey: "blog16Brand5Name",
    mark: "P",
    categoryKey: "blog16Post5Category",
    titleKey: "blog16Post5Title",
    descriptionKey: "blog16Post5Description",
    dateKey: "blog16Post5Date",
  },
];

function BrandLockup({ post, t }: BrandLockupProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold">
        {post.mark}
      </span>
      <span className="text-sm font-medium">{t[post.brandKey]}</span>
    </div>
  );
}

export function WithTeamBrandingRow() {
  const t = useMessages("pages").blog;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col px-4 lg:px-8">
        <div className="flex flex-col gap-2">
          <Typography
            variant="h2"
            className="text-muted text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blog16Eyebrow}
          </Typography>
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blog16Heading}
          </Typography>
        </div>

        <div className="border-border mt-10 flex flex-col border-b">
          {POSTS.map((post) => (
            <article
              key={post.titleKey}
              className="border-border border-t py-8"
            >
              <div className="flex items-center justify-between gap-4 lg:hidden">
                <BrandLockup post={post} t={t} />
                <span className="text-muted text-sm">{t[post.dateKey]}</span>
              </div>

              <div className="mt-4 grid gap-5 lg:mt-0 lg:grid-cols-[180px_1fr_auto] lg:items-center lg:gap-8">
                <div className="hidden flex-col gap-2 lg:flex">
                  <BrandLockup post={post} t={t} />
                  <span className="text-muted text-xs">
                    {t.blog16TeamCaption}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  <a
                    href={POST_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group border-border hover:bg-muted inline-flex w-fit items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors"
                  >
                    {t[post.categoryKey]}
                    <IconChevronRight
                      size={12}
                      className="text-muted transition-transform group-hover:translate-x-0.5"
                    />
                  </a>
                  <a
                    href={POST_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand text-xl font-semibold tracking-tight transition-colors"
                  >
                    {t[post.titleKey]}
                  </a>
                  <Typography variant="body" className="text-muted">
                    {t[post.descriptionKey]}
                  </Typography>
                </div>

                <div className="hidden items-center gap-4 lg:flex">
                  <span className="text-muted text-sm">{t[post.dateKey]}</span>
                  <Button asChild variant="outline" size="icon">
                    <a
                      href={POST_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t.blog16ReadMore}
                    >
                      <IconArrowUpRight size={16} />
                    </a>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
