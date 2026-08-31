"use client";

import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  BlogMessages,
  BlogPost,
} from "@/types/pages/blog/BlogBlock-types";
const LINK_URL = "https://example.com" as const;

const POSTS: BlogPost[] = [
  {
    titleKey: "blog45Post1Title",
    dateKey: "blog45Post1Date",
    seed: "blog45-1",
  },
  {
    titleKey: "blog45Post2Title",
    dateKey: "blog45Post2Date",
    seed: "blog45-2",
  },
  {
    titleKey: "blog45Post3Title",
    dateKey: "blog45Post3Date",
    seed: "blog45-3",
  },
  {
    titleKey: "blog45Post4Title",
    dateKey: "blog45Post4Date",
    seed: "blog45-4",
  },
  {
    titleKey: "blog45Post5Title",
    dateKey: "blog45Post5Date",
    seed: "blog45-5",
  },
  {
    titleKey: "blog45Post6Title",
    dateKey: "blog45Post6Date",
    seed: "blog45-6",
  },
  {
    titleKey: "blog45Post7Title",
    dateKey: "blog45Post7Date",
    seed: "blog45-7",
  },
  {
    titleKey: "blog45Post8Title",
    dateKey: "blog45Post8Date",
    seed: "blog45-8",
  },
  {
    titleKey: "blog45Post9Title",
    dateKey: "blog45Post9Date",
    seed: "blog45-9",
  },
];

export function WithTextOnlyIndex() {
  const t = useMessages("pages").blog as unknown as BlogMessages;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 lg:px-8">
        <div className="flex flex-col gap-4">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blog45Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {t.blog45Description}
          </Typography>
        </div>
        <div className="divide-border border-border flex flex-col divide-y border-y">
          {POSTS.map((post) => (
            <a
              key={post.titleKey}
              href={LINK_URL}
              className="group flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
            >
              <span className="group-hover:text-brand text-lg font-medium underline-offset-4 transition-colors group-hover:underline">
                {t[post.titleKey]}
              </span>
              <time className="text-muted font-mono text-sm tabular-nums">
                {t[post.dateKey]}
              </time>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
