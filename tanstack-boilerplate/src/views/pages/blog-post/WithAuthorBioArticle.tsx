"use client";

import Image from "next/image";
import {
  IconBrandLinkedin,
  IconBrandX,
  IconClock,
  IconCopy,
  IconMail,
} from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { Quote, Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  BlogPostSection,
  PagesWithBlogPostMessages,
} from "@/types/pages/blog-post/BlogPostMessages-types";

const SECTIONS: BlogPostSection[] = [
  {
    headingKey: "blogPost9Section1Heading",
    paragraphKeys: [
      "blogPost9Section1Paragraph1",
      "blogPost9Section1Paragraph2",
    ],
  },
  {
    headingKey: "blogPost9Section2Heading",
    paragraphKeys: [
      "blogPost9Section2Paragraph1",
      "blogPost9Section2Paragraph2",
    ],
    quoteKey: "blogPost9Quote",
  },
  {
    headingKey: "blogPost9Section3Heading",
    paragraphKeys: ["blogPost9Section3Paragraph"],
  },
];

const SHARE_ACTIONS = [
  { icon: IconBrandX, labelKey: "blogPost9ShareXLabel" },
  { icon: IconBrandLinkedin, labelKey: "blogPost9ShareLinkedinLabel" },
  { icon: IconMail, labelKey: "blogPost9ShareMailLabel" },
  { icon: IconCopy, labelKey: "blogPost9ShareCopyLabel" },
] as const;

const AUTHOR_AVATAR_URL = "/img/placeholders/ph-1x1-6.webp" as const;

export function WithAuthorBioArticle() {
  const t = (useMessages("pages") as unknown as PagesWithBlogPostMessages)
    .blogPost;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 lg:px-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {t.blogPost9Category}
          </span>
          <span className="text-muted" aria-hidden="true">
            /
          </span>
          <span className="text-muted text-xs">{t.blogPost9Date}</span>
          <span className="text-muted" aria-hidden="true">
            /
          </span>
          <span className="text-muted flex items-center gap-1.5 text-xs">
            <IconClock size={14} />
            {t.blogPost9ReadTime}
          </span>
        </div>

        <div className="flex flex-col gap-4">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.blogPost9Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {t.blogPost9Summary}
          </Typography>
        </div>

        <AspectRatio
          ratio={16 / 9}
          className="bg-surface border-border relative overflow-hidden rounded-2xl border"
        >
          <Image
            src="/img/placeholders/ph-16x9-5.webp"
            alt={t.blogPost9HeroImageAlt}
            fill
            sizes="(max-width: 768px) 100vw, 48rem"
            className="object-cover"
          />
        </AspectRatio>

        <div className="flex flex-col gap-10">
          {SECTIONS.map((section) => (
            <div key={section.headingKey} className="flex flex-col gap-4">
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
              {section.quoteKey && (
                <Quote className="text-muted">{t[section.quoteKey]}</Quote>
              )}
            </div>
          ))}
        </div>

        <Separator />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="text-sm font-medium">{t.blogPost9ShareTitle}</span>
          <div className="flex items-center gap-2">
            {SHARE_ACTIONS.map((action) => (
              <Button
                key={action.labelKey}
                type="button"
                variant="outline"
                size="icon"
                aria-label={t[action.labelKey]}
              >
                <action.icon size={16} />
              </Button>
            ))}
          </div>
        </div>

        <div className="border-border bg-surface flex flex-col gap-4 rounded-2xl border p-6 sm:flex-row sm:items-start">
          <Avatar
            src={AUTHOR_AVATAR_URL}
            alt={t.blogPost9AuthorAvatarAlt}
            fallback={t.blogPost9AuthorName.slice(0, 2)}
            size="xl"
          />
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-col gap-0.5">
              <span className="text-base font-medium">
                {t.blogPost9AuthorName}
              </span>
              <span className="text-muted text-sm">
                {t.blogPost9AuthorRole}
              </span>
            </div>
            <Typography variant="bodySmall" className="text-muted">
              {t.blogPost9AuthorBio}
            </Typography>
          </div>
        </div>
      </div>
    </section>
  );
}
