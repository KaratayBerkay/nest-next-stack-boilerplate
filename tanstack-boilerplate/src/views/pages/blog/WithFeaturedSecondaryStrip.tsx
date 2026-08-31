"use client";

import Image from "next/image";
import { IconArrowRight } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { SecondaryTopic } from "@/types/pages/blog/WithFeaturedSecondaryStrip-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const POST_URL = "https://example.com" as const;

const TOPICS: SecondaryTopic[] = [
  {
    titleKey: "blog22Topic1Title",
    blurbKey: "blog22Topic1Blurb",
    seed: "blog22-1",
  },
  {
    titleKey: "blog22Topic2Title",
    blurbKey: "blog22Topic2Blurb",
    seed: "blog22-2",
  },
  {
    titleKey: "blog22Topic3Title",
    blurbKey: "blog22Topic3Blurb",
    seed: "blog22-3",
  },
  {
    titleKey: "blog22Topic4Title",
    blurbKey: "blog22Topic4Blurb",
    seed: "blog22-4",
  },
];

export function WithFeaturedSecondaryStrip() {
  const t = useMessages("pages").blog;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col px-4 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2">
            <Typography
              variant="h2"
              className="text-4xl font-medium tracking-tighter md:text-5xl"
            >
              {t.blog22Heading}
            </Typography>
            <Typography variant="body" className="text-muted">
              {t.blog22Subtitle}
            </Typography>
          </div>
          <Button
            variant="outline"
            className="w-fit"
            rightIcon={<IconArrowRight size={16} />}
          >
            {t.blog22ReadMore}
          </Button>
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <div className="flex flex-col gap-6">
            <AspectRatio
              ratio={16 / 9}
              className="bg-surface relative overflow-hidden rounded-2xl"
            >
              <Image
                src="/img/placeholders/ph-16x9-4.webp"
                alt={t.blog22FeaturedTitle}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            </AspectRatio>
            <Typography
              variant="h3"
              className="text-2xl font-medium tracking-tight"
            >
              <a
                href={POST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand transition-colors"
              >
                {t.blog22FeaturedTitle}
              </a>
            </Typography>
            <div className="flex items-center gap-3">
              <span className="bg-surface relative block size-10 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src="/img/placeholders/ph-1x1-3.webp"
                  alt={t.blog22FeaturedAuthor}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {t.blog22FeaturedAuthor}
                </span>
                <Typography variant="caption">
                  {t.blog22FeaturedRole}
                </Typography>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            {TOPICS.map((topic) => (
              <article
                key={topic.titleKey}
                className="border-border flex items-start gap-5 border-b py-5 first:pt-0 last:border-none"
              >
                <AspectRatio
                  ratio={1 / 1}
                  className="bg-surface relative w-20 shrink-0 overflow-hidden rounded-xl"
                >
                  <Image
                    src={placeholderImage(topic.seed, "1x1")}
                    alt={t[topic.titleKey]}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </AspectRatio>
                <div className="flex flex-col gap-1.5">
                  <a
                    href={POST_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand text-sm font-medium transition-colors"
                  >
                    {t[topic.titleKey]}
                  </a>
                  <p className="text-muted text-sm leading-relaxed">
                    {t[topic.blurbKey]}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
