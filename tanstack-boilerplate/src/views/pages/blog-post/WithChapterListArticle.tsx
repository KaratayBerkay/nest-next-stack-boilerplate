"use client";

import Image from "next/image";
import { IconBrandLinkedin, IconBrandX, IconCopy } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Avatar } from "@/components/ui/Avatar";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  BlogPostTProps,
  PagesWithBlogPostMessages,
} from "@/types/pages/blog-post/BlogPostMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const DOT_PATTERN = {
  backgroundImage:
    "radial-gradient(color-mix(in srgb, var(--fg) 8%, transparent) 1px, transparent 1px)",
  backgroundSize: "24px 24px",
} as const;

const CHAPTERS = [
  { number: 1, labelKey: "blogPost6Chapter1Label" },
  { number: 2, labelKey: "blogPost6Chapter2Label" },
  { number: 3, labelKey: "blogPost6Chapter3Label" },
  { number: 4, labelKey: "blogPost6Chapter4Label" },
] as const;

const SECTIONS = [
  {
    headingKey: "blogPost6Chapter1Heading",
    paragraphKeys: [
      "blogPost6Chapter1Paragraph1",
      "blogPost6Chapter1Paragraph2",
    ],
  },
  {
    headingKey: "blogPost6Chapter2Heading",
    paragraphKeys: [
      "blogPost6Chapter2Paragraph1",
      "blogPost6Chapter2Paragraph2",
    ],
  },
  {
    headingKey: "blogPost6Chapter3Heading",
    paragraphKeys: ["blogPost6Chapter3Paragraph"],
  },
  {
    headingKey: "blogPost6Chapter4Heading",
    paragraphKeys: ["blogPost6Chapter4Paragraph"],
  },
] as const;

const FIGURES = [
  { seed: "blogpost6-figure-1", altKey: "blogPost6Figure1Alt" },
  { seed: "blogpost6-figure-2", altKey: "blogPost6Figure2Alt" },
] as const;

const SHARE_ACTIONS = [
  { icon: IconBrandX, labelKey: "blogPost6ShareXLabel" },
  { icon: IconBrandLinkedin, labelKey: "blogPost6ShareLinkedinLabel" },
  { icon: IconCopy, labelKey: "blogPost6ShareCopyLabel" },
] as const;

const AUTHOR_AVATAR_URL = "/img/placeholders/ph-1x1-3.webp" as const;

function ChapterRail({ t }: BlogPostTProps) {
  return (
    <div className="border-border bg-surface rounded-2xl border p-5 lg:sticky lg:top-24">
      <p className="text-muted mb-4 text-xs font-semibold tracking-wider uppercase">
        {t.blogPost6ChapterLabel}
      </p>
      <nav aria-label={t.blogPost6ChapterLabel} className="flex flex-col gap-1">
        {CHAPTERS.map((chapter) => (
          <button
            key={chapter.labelKey}
            type="button"
            className="hover:bg-surface-hover flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors"
          >
            <span className="text-muted w-5 shrink-0 text-xs font-medium tabular-nums">
              {chapter.number}
            </span>
            <span className="hover:text-fg text-fg/80 transition-colors">
              {t[chapter.labelKey]}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function ShareRow({ t }: BlogPostTProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span className="text-muted text-xs font-medium tracking-wider uppercase">
        {t.blogPost6ShareLabel}
      </span>
      <div className="flex items-center gap-2">
        {SHARE_ACTIONS.map((action) => (
          <button
            key={action.labelKey}
            type="button"
            aria-label={t[action.labelKey]}
            className="border-border bg-surface text-muted hover:bg-surface-hover hover:text-fg flex size-9 items-center justify-center rounded-full border transition-colors"
          >
            <action.icon size={16} />
          </button>
        ))}
      </div>
    </div>
  );
}

function AuthorCard({ t }: BlogPostTProps) {
  return (
    <div className="border-border bg-surface flex flex-col gap-4 rounded-2xl border p-6 sm:flex-row sm:items-start">
      <Avatar
        src={AUTHOR_AVATAR_URL}
        alt={t.blogPost6AuthorAvatarAlt}
        fallback={t.blogPost6AuthorName.slice(0, 2)}
        size="xl"
      />
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-col gap-0.5">
          <span className="text-base font-medium">{t.blogPost6AuthorName}</span>
          <span className="text-muted text-sm">{t.blogPost6AuthorRole}</span>
        </div>
        <Typography variant="bodySmall" className="text-muted">
          {t.blogPost6AuthorBio}
        </Typography>
      </div>
    </div>
  );
}

export function WithChapterListArticle() {
  const t = (useMessages("pages") as unknown as PagesWithBlogPostMessages)
    .blogPost;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 lg:px-8">
        <div className="border-border bg-surface relative overflow-hidden rounded-3xl border">
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={DOT_PATTERN}
          />
          <div className="relative flex flex-col items-center gap-6 px-6 py-14 text-center lg:px-12 lg:py-20">
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-brand font-semibold tracking-wider uppercase">
                {t.blogPost6Eyebrow}
              </span>
              <span className="text-muted" aria-hidden="true">
                /
              </span>
              <span className="text-muted">{t.blogPost6Date}</span>
              <span className="text-muted" aria-hidden="true">
                /
              </span>
              <span className="text-muted">{t.blogPost6ReadTime}</span>
            </div>
            <Typography
              variant="h2"
              className="max-w-3xl text-4xl font-medium tracking-tighter md:text-5xl"
            >
              {t.blogPost6Heading}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted max-w-2xl">
              {t.blogPost6Subtitle}
            </Typography>
            <ShareRow t={t} />
          </div>
        </div>

        <div className="flex flex-col gap-10 lg:flex-row">
          <aside className="shrink-0 lg:w-64">
            <ChapterRail t={t} />
          </aside>

          <article className="flex min-w-0 flex-1 flex-col gap-10">
            <div className="flex items-center gap-3">
              <Avatar
                src={AUTHOR_AVATAR_URL}
                alt={t.blogPost6AuthorAvatarAlt}
                fallback={t.blogPost6AuthorName.slice(0, 2)}
                size="md"
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">
                  {t.blogPost6AuthorName}
                </span>
                <span className="text-muted text-xs">
                  {t.blogPost6AuthorRole}
                </span>
              </div>
            </div>

            {SECTIONS.map((section, index) => (
              <div
                key={section.headingKey}
                className="flex scroll-mt-24 flex-col gap-4"
              >
                <Typography
                  variant="h3"
                  className="text-2xl font-medium tracking-tighter"
                >
                  {t[section.headingKey]}
                </Typography>
                {section.paragraphKeys.map((key) => (
                  <Typography key={key} variant="body" className="text-muted">
                    {t[key]}
                  </Typography>
                ))}
                {FIGURES[index] && (
                  <figure className="flex flex-col gap-3 pt-2">
                    <AspectRatio
                      ratio={16 / 9}
                      className="bg-surface relative overflow-hidden rounded-2xl"
                    >
                      <Image
                        src={placeholderImage(FIGURES[index].seed, "16x9")}
                        alt={t[FIGURES[index].altKey]}
                        fill
                        sizes="(max-width: 768px) 100vw, 60vw"
                        className="object-cover"
                      />
                    </AspectRatio>
                  </figure>
                )}
              </div>
            ))}

            <div className="border-border bg-surface flex flex-col gap-3 rounded-2xl border p-6">
              <Typography
                variant="h3"
                className="text-xl font-medium tracking-tight"
              >
                {t.blogPost6ConclusionHeading}
              </Typography>
              <Typography variant="body" className="text-muted">
                {t.blogPost6ConclusionParagraph}
              </Typography>
            </div>

            <AuthorCard t={t} />
          </article>
        </div>
      </div>
    </section>
  );
}
