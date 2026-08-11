"use client";

import { IconArrowUpRight } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { IconButton } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { BlogTagListPost } from "@/types/pages/blog/BlogBlocks-types";

const POSTS = [
  {
    dateKey: "blog29Post1Date",
    titleKey: "blog29Post1Title",
    summaryKey: "blog29Post1Summary",
    tagsKey: "blog29Post1Tags",
  },
  {
    dateKey: "blog29Post2Date",
    titleKey: "blog29Post2Title",
    summaryKey: "blog29Post2Summary",
    tagsKey: "blog29Post2Tags",
  },
  {
    dateKey: "blog29Post3Date",
    titleKey: "blog29Post3Title",
    summaryKey: "blog29Post3Summary",
    tagsKey: "blog29Post3Tags",
  },
  {
    dateKey: "blog29Post4Date",
    titleKey: "blog29Post4Title",
    summaryKey: "blog29Post4Summary",
    tagsKey: "blog29Post4Tags",
  },
  {
    dateKey: "blog29Post5Date",
    titleKey: "blog29Post5Title",
    summaryKey: "blog29Post5Summary",
    tagsKey: "blog29Post5Tags",
  },
  {
    dateKey: "blog29Post6Date",
    titleKey: "blog29Post6Title",
    summaryKey: "blog29Post6Summary",
    tagsKey: "blog29Post6Tags",
  },
  {
    dateKey: "blog29Post7Date",
    titleKey: "blog29Post7Title",
    summaryKey: "blog29Post7Summary",
    tagsKey: "blog29Post7Tags",
  },
  {
    dateKey: "blog29Post8Date",
    titleKey: "blog29Post8Title",
    summaryKey: "blog29Post8Summary",
    tagsKey: "blog29Post8Tags",
  },
  {
    dateKey: "blog29Post9Date",
    titleKey: "blog29Post9Title",
    summaryKey: "blog29Post9Summary",
    tagsKey: "blog29Post9Tags",
  },
] as const satisfies readonly BlogTagListPost[];

export function WithTagList() {
  const t = useMessages("pages").blog;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 lg:gap-20 lg:px-8">
        <Typography
          variant="h2"
          className="max-w-2xl text-4xl font-medium tracking-tighter md:text-5xl"
        >
          {t.blog29Heading}
        </Typography>

        <div className="flex flex-col">
          {POSTS.map((post, index) => (
            <div key={post.titleKey} className="flex flex-col gap-10 lg:gap-12">
              {index > 0 && <Separator />}
              <article className="group flex items-start justify-between gap-6">
                <div className="flex max-w-3xl flex-col gap-3">
                  <Typography variant="caption">{t[post.dateKey]}</Typography>
                  <Typography
                    variant="h3"
                    className="group-hover:text-brand text-xl font-medium tracking-tight transition-colors md:text-2xl"
                  >
                    {t[post.titleKey]}
                  </Typography>
                  <Typography variant="body" className="text-muted">
                    {t[post.summaryKey]}
                  </Typography>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {t[post.tagsKey].map((tag) => (
                      <Badge key={tag} variant="secondary" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <IconButton
                  icon={<IconArrowUpRight size={20} />}
                  label={t.blog29ReadArticle}
                  variant="secondary"
                  className="mt-1 shrink-0 rounded-full transition-transform duration-300 group-hover:rotate-45"
                />
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
