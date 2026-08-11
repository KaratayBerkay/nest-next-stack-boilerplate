"use client";

import Image from "next/image";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Avatar } from "@/components/ui/Avatar";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { MagazineLatestPost } from "@/types/pages/blog/WithMagazineSplit-types";

const POST_URL = "https://example.com" as const;

const LATEST_POSTS: MagazineLatestPost[] = [
  {
    titleKey: "blog26Latest1Title",
    authorKey: "blog26Latest1Author",
    dateKey: "blog26Latest1Date",
  },
  {
    titleKey: "blog26Latest2Title",
    authorKey: "blog26Latest2Author",
    dateKey: "blog26Latest2Date",
  },
  {
    titleKey: "blog26Latest3Title",
    authorKey: "blog26Latest3Author",
    dateKey: "blog26Latest3Date",
  },
  {
    titleKey: "blog26Latest4Title",
    authorKey: "blog26Latest4Author",
    dateKey: "blog26Latest4Date",
  },
];

export function WithMagazineSplit() {
  const t = useMessages("pages").blog;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col px-4 lg:px-8">
        <div className="flex flex-col gap-8">
          <Typography
            variant="h1"
            className="text-6xl font-medium tracking-tighter md:text-8xl"
          >
            {t.blog26Wordmark}
          </Typography>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-1">
              <Typography variant="body" className="text-muted">
                {t.blog26Tagline}
              </Typography>
              <Typography
                variant="h3"
                className="text-xl font-medium tracking-tight"
              >
                {t.blog26Subtitle}
              </Typography>
            </div>
            <div className="border-border flex w-fit items-center gap-3 rounded-2xl border p-3">
              <Avatar
                src="https://picsum.photos/seed/blog26-editor/128/128"
                alt={t.blog26EditorName}
                fallback="AP"
                size="md"
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {t.blog26EditorName}
                </span>
                <span className="text-muted text-xs">{t.blog26EditorRole}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div className="flex flex-col gap-6">
            <AspectRatio
              ratio={4 / 3}
              className="bg-surface relative overflow-hidden rounded-2xl"
            >
              <Image
                src="https://picsum.photos/seed/blog26-lead/1200/900"
                alt={t.blog26LeadTitle}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </AspectRatio>
            <Typography
              variant="h2"
              className="text-3xl font-medium tracking-tighter"
            >
              <a
                href={POST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand transition-colors"
              >
                {t.blog26LeadTitle}
              </a>
            </Typography>
            <Typography variant="body" className="text-muted">
              {t.blog26LeadExcerpt}
            </Typography>
            <p className="text-muted text-sm">
              {t.blog26LeadBy}{" "}
              <a
                href={POST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-fg hover:text-brand underline underline-offset-4 transition-colors"
              >
                {t.blog26LeadAuthor}
              </a>{" "}
              · {t.blog26LeadDate}
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <Typography
              variant="h3"
              className="text-2xl font-medium tracking-tight"
            >
              {t.blog26LatestHeading}
            </Typography>
            <div className="divide-border flex flex-col divide-y">
              {LATEST_POSTS.map((post) => (
                <article
                  key={post.titleKey}
                  className="flex flex-col gap-2 py-5"
                >
                  <a
                    href={POST_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-medium tracking-tight underline-offset-4 hover:underline"
                  >
                    {t[post.titleKey]}
                  </a>
                  <p className="text-muted text-sm">
                    <a
                      href={POST_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-fg hover:underline"
                    >
                      {t[post.authorKey]}
                    </a>{" "}
                    · {t[post.dateKey]}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
