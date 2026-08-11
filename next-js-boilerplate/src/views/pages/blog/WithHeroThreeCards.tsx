"use client";

import Image from "next/image";
import { IconArrowRight } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { HeroCard } from "@/types/pages/blog/WithHeroThreeCards-types";

const POST_URL = "https://example.com" as const;

const CARDS: HeroCard[] = [
  {
    categoryKey: "blog38Card1Category",
    titleKey: "blog38Card1Title",
    excerptKey: "blog38Card1Excerpt",
    authorKey: "blog38Card1Author",
    dateKey: "blog38Card1Date",
    seed: "blog38-1",
  },
  {
    categoryKey: "blog38Card2Category",
    titleKey: "blog38Card2Title",
    excerptKey: "blog38Card2Excerpt",
    authorKey: "blog38Card2Author",
    dateKey: "blog38Card2Date",
    seed: "blog38-2",
  },
  {
    categoryKey: "blog38Card3Category",
    titleKey: "blog38Card3Title",
    excerptKey: "blog38Card3Excerpt",
    authorKey: "blog38Card3Author",
    dateKey: "blog38Card3Date",
    seed: "blog38-3",
  },
];

export function WithHeroThreeCards() {
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
              {t.blog38Heading}
            </Typography>
            <Typography variant="body" className="text-muted">
              {t.blog38Subtitle}
            </Typography>
          </div>
          <Button
            variant="outline"
            className="w-fit"
            rightIcon={<IconArrowRight size={16} />}
          >
            {t.blog38ReadMore}
          </Button>
        </div>

        <div className="mt-12 flex flex-col gap-6">
          <AspectRatio
            ratio={16 / 9}
            className="bg-surface relative overflow-hidden rounded-2xl"
          >
            <Image
              src="https://picsum.photos/seed/blog38-hero/1600/900"
              alt={t.blog38HeroTitle}
              fill
              sizes="100vw"
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          </AspectRatio>
          <div className="flex flex-col gap-4">
            <Badge variant="soft" pill className="w-fit">
              {t.blog38HeroCategory}
            </Badge>
            <Typography
              variant="h2"
              className="max-w-3xl text-3xl font-medium tracking-tighter md:text-4xl"
            >
              <a
                href={POST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand transition-colors"
              >
                {t.blog38HeroTitle}
              </a>
            </Typography>
            <Typography variant="body" className="text-muted max-w-3xl">
              {t.blog38HeroExcerpt}
            </Typography>
            <div className="flex items-center gap-3">
              <Avatar
                src="https://picsum.photos/seed/blog38-hero-avatar/128/128"
                alt={t.blog38HeroAuthor}
                fallback="SC"
                size="sm"
              />
              <span className="text-sm font-medium">{t.blog38HeroAuthor}</span>
              <span className="text-muted">·</span>
              <span className="text-muted text-sm">{t.blog38HeroDate}</span>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {CARDS.map((card) => (
            <Card
              key={card.titleKey}
              className="group flex flex-col overflow-hidden"
            >
              <AspectRatio
                ratio={4 / 3}
                className="bg-surface relative overflow-hidden"
              >
                <Image
                  src={`https://picsum.photos/seed/${card.seed}/600/450`}
                  alt={t[card.titleKey]}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-opacity duration-300 group-hover:opacity-90"
                />
              </AspectRatio>
              <div className="flex flex-col gap-3 p-6">
                <Badge variant="soft" pill className="w-fit">
                  {t[card.categoryKey]}
                </Badge>
                <Typography
                  variant="h3"
                  className="text-lg font-medium tracking-tight"
                >
                  <a
                    href={POST_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group-hover:text-brand transition-colors"
                  >
                    {t[card.titleKey]}
                  </a>
                </Typography>
                <Typography variant="body" className="text-muted line-clamp-2">
                  {t[card.excerptKey]}
                </Typography>
                <p className="text-muted mt-auto text-sm">
                  {t[card.authorKey]} · {t[card.dateKey]}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
