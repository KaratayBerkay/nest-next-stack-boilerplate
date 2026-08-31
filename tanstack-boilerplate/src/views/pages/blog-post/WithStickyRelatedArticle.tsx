"use client";

import Image from "next/image";
import { useState } from "react";
import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";
import { IconArrowRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  BlogPostMessages,
  BlogPostRelatedItem,
  BlogPostRelatedCardProps,
} from "@/types/pages/blog-post/BlogPostMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
const LINK_URL = "https://example.com" as const;

const RELATED_POSTS: BlogPostRelatedItem[] = [
  {
    titleKey: "blogPost13Related1Title",
    categoryKey: "blogPost13Related1Category",
    altKey: "blogPost13Related1Alt",
    seed: "blogpost13-1",
  },
  {
    titleKey: "blogPost13Related2Title",
    categoryKey: "blogPost13Related2Category",
    altKey: "blogPost13Related2Alt",
    seed: "blogpost13-2",
  },
  {
    titleKey: "blogPost13Related3Title",
    categoryKey: "blogPost13Related3Category",
    altKey: "blogPost13Related3Alt",
    seed: "blogpost13-3",
  },
];

function handleEmailChange(
  event: ChangeEvent<HTMLInputElement>,
  setEmail: Dispatch<SetStateAction<string>>,
) {
  setEmail(event.target.value);
}

function handleNewsletterSubmit(
  event: FormEvent<HTMLFormElement>,
  setEmail: Dispatch<SetStateAction<string>>,
) {
  event.preventDefault();
  setEmail("");
}

function RelatedCard({ item, t }: BlogPostRelatedCardProps) {
  return (
    <a
      href={LINK_URL}
      className="group hover:bg-surface flex items-center gap-3 rounded-lg p-2 transition-colors"
    >
      <div className="relative size-16 shrink-0 overflow-hidden rounded-md">
        <Image
          src={placeholderImage(item.seed, "1x1")}
          alt={t[item.altKey]}
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-brand text-xs font-semibold tracking-wider uppercase">
          {t[item.categoryKey]}
        </span>
        <span className="group-hover:text-brand line-clamp-2 text-sm font-medium transition-colors">
          {t[item.titleKey]}
        </span>
      </div>
      <IconArrowRight
        size={16}
        aria-hidden="true"
        className="text-muted group-hover:text-brand shrink-0 transition-transform group-hover:translate-x-0.5"
      />
    </a>
  );
}

export function WithStickyRelatedArticle() {
  const t = (
    useMessages("pages") as unknown as {
      blogPost: BlogPostMessages;
    }
  ).blogPost;
  const [email, setEmail] = useState("");

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-3 lg:gap-16 lg:px-8">
        <article className="flex flex-col gap-6 lg:col-span-2">
          <div className="flex flex-col gap-4">
            <time className="text-muted text-sm">{t.blogPost13Date}</time>
            <Typography
              variant="h2"
              className="text-4xl font-medium tracking-tighter md:text-5xl"
            >
              {t.blogPost13Title}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {t.blogPost13Summary}
            </Typography>
          </div>

          <div className="flex flex-col gap-4">
            <Typography
              variant="h3"
              className="text-xl font-medium tracking-tight"
            >
              {t.blogPost13Heading1}
            </Typography>
            <Typography variant="body" className="leading-relaxed">
              {t.blogPost13Paragraph1}
            </Typography>
            <Typography variant="body" className="leading-relaxed">
              {t.blogPost13Paragraph2}
            </Typography>
          </div>

          <blockquote className="border-border text-muted border-l-2 pl-6 text-lg leading-relaxed italic">
            {t.blogPost13Quote}
          </blockquote>

          <div className="flex flex-col gap-4">
            <Typography
              variant="h3"
              className="text-xl font-medium tracking-tight"
            >
              {t.blogPost13Heading2}
            </Typography>
            <Typography variant="body" className="leading-relaxed">
              {t.blogPost13Paragraph3}
            </Typography>
            <Typography variant="body" className="leading-relaxed">
              {t.blogPost13Paragraph4}
            </Typography>
          </div>
        </article>

        <aside className="flex flex-col gap-8 lg:sticky lg:top-24 lg:self-start">
          <div className="border-border bg-surface flex flex-col rounded-2xl border p-6">
            <Typography
              variant="h3"
              className="text-lg font-medium tracking-tight"
            >
              {t.blogPost13RelatedTitle}
            </Typography>
            <div className="divide-border mt-4 flex flex-col divide-y">
              {RELATED_POSTS.map((item) => (
                <RelatedCard key={item.titleKey} item={item} t={t} />
              ))}
            </div>
          </div>

          <div className="border-border bg-surface flex flex-col gap-4 rounded-2xl border p-6">
            <div className="flex flex-col gap-2">
              <Typography
                variant="h3"
                className="text-lg font-medium tracking-tight"
              >
                {t.blogPost13NewsletterTitle}
              </Typography>
              <Typography variant="bodySmall" className="text-muted">
                {t.blogPost13NewsletterDescription}
              </Typography>
            </div>
            <form
              onSubmit={(event) => handleNewsletterSubmit(event, setEmail)}
              className="flex flex-col gap-3"
            >
              <Input
                type="email"
                required
                value={email}
                onChange={(event) => handleEmailChange(event, setEmail)}
                placeholder={t.blogPost13NewsletterPlaceholder}
                aria-label={t.blogPost13NewsletterPlaceholder}
              />
              <Button type="submit" variant="primary">
                {t.blogPost13NewsletterButton}
              </Button>
            </form>
          </div>
        </aside>
      </div>
    </section>
  );
}
