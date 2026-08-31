"use client";

import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { BlogTimelinePost } from "@/types/pages/blog/BlogBlocks-types";
const LINK_URL = "https://example.com" as const;

const POSTS = [
  {
    dateKey: "blog44Post1Date",
    categoryKey: "blog44Post1Category",
    titleKey: "blog44Post1Title",
    summaryKey: "blog44Post1Summary",
  },
  {
    dateKey: "blog44Post2Date",
    categoryKey: "blog44Post2Category",
    titleKey: "blog44Post2Title",
    summaryKey: "blog44Post2Summary",
  },
  {
    dateKey: "blog44Post3Date",
    categoryKey: "blog44Post3Category",
    titleKey: "blog44Post3Title",
    summaryKey: "blog44Post3Summary",
  },
  {
    dateKey: "blog44Post4Date",
    categoryKey: "blog44Post4Category",
    titleKey: "blog44Post4Title",
    summaryKey: "blog44Post4Summary",
  },
  {
    dateKey: "blog44Post5Date",
    categoryKey: "blog44Post5Category",
    titleKey: "blog44Post5Title",
    summaryKey: "blog44Post5Summary",
  },
  {
    dateKey: "blog44Post6Date",
    categoryKey: "blog44Post6Category",
    titleKey: "blog44Post6Title",
    summaryKey: "blog44Post6Summary",
  },
] as const satisfies readonly BlogTimelinePost[];

export function WithTimelineFeed() {
  const t = useMessages("pages").blog;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-14 px-4 lg:gap-20 lg:px-8">
        <div className="flex flex-col items-start gap-4">
          <Typography
            variant="h2"
            className="max-w-2xl text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blog44Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {t.blog44Intro}
          </Typography>
        </div>

        <div className="flex flex-col">
          {POSTS.map((post, index) => (
            <div key={post.titleKey} className="relative flex gap-5 md:gap-10">
              <div className="w-24 shrink-0 pt-0.5 md:w-32">
                <Typography
                  variant="bodySmall"
                  className="text-fg font-semibold tabular-nums"
                >
                  {t[post.dateKey]}
                </Typography>
              </div>
              <div className="flex flex-col items-center self-stretch">
                <span className="bg-brand ring-bg mt-1 size-2.5 shrink-0 rounded-full ring-4" />
                {index < POSTS.length - 1 && (
                  <span className="bg-border w-px flex-1" />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2.5 pb-12 md:pb-16">
                <Typography
                  variant="caption"
                  className="tracking-wider uppercase"
                >
                  {t[post.categoryKey]}
                </Typography>
                <a href={LINK_URL} className="w-fit">
                  <Typography
                    variant="h3"
                    className="hover:text-brand text-xl font-medium tracking-tight transition-colors md:text-2xl"
                  >
                    {t[post.titleKey]}
                  </Typography>
                </a>
                <Typography variant="body" className="text-muted max-w-xl">
                  {t[post.summaryKey]}
                </Typography>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
