"use client";

import Image from "next/image";
import { IconArrowUpRight } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithProjectsMessages } from "@/types/pages/projects/ProjectsMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PlaceholderAspect } from "@/views/pages/_shared/placeholder-image";

const LINK_URL = "https://example.com" as const;

interface MasonryItem {
  titleKey: string;
  tagKey: string;
  altKey: string;
  imageSeed: string;
  aspect: PlaceholderAspect;
  aspectRatio: number;
}

const ITEMS: MasonryItem[] = [
  {
    titleKey: "projects1Item1Title",
    tagKey: "projects1Item1Tag",
    altKey: "projects1Item1Alt",
    imageSeed: "projects-masonry-1",
    aspect: "3x4",
    aspectRatio: 3 / 4,
  },
  {
    titleKey: "projects1Item2Title",
    tagKey: "projects1Item2Tag",
    altKey: "projects1Item2Alt",
    imageSeed: "projects-masonry-2",
    aspect: "1x1",
    aspectRatio: 1,
  },
  {
    titleKey: "projects1Item3Title",
    tagKey: "projects1Item3Tag",
    altKey: "projects1Item3Alt",
    imageSeed: "projects-masonry-3",
    aspect: "3x2",
    aspectRatio: 3 / 2,
  },
  {
    titleKey: "projects1Item4Title",
    tagKey: "projects1Item4Tag",
    altKey: "projects1Item4Alt",
    imageSeed: "projects-masonry-4",
    aspect: "4x5",
    aspectRatio: 4 / 5,
  },
  {
    titleKey: "projects1Item5Title",
    tagKey: "projects1Item5Tag",
    altKey: "projects1Item5Alt",
    imageSeed: "projects-masonry-5",
    aspect: "16x9",
    aspectRatio: 16 / 9,
  },
  {
    titleKey: "projects1Item6Title",
    tagKey: "projects1Item6Tag",
    altKey: "projects1Item6Alt",
    imageSeed: "projects-masonry-6",
    aspect: "1x1",
    aspectRatio: 1,
  },
  {
    titleKey: "projects1Item7Title",
    tagKey: "projects1Item7Tag",
    altKey: "projects1Item7Alt",
    imageSeed: "projects-masonry-7",
    aspect: "3x4",
    aspectRatio: 3 / 4,
  },
  {
    titleKey: "projects1Item8Title",
    tagKey: "projects1Item8Tag",
    altKey: "projects1Item8Alt",
    imageSeed: "projects-masonry-8",
    aspect: "4x3",
    aspectRatio: 4 / 3,
  },
];

export function MasonryPortfolioGridProjects() {
  const t = useMessages("pages") as unknown as PagesWithProjectsMessages;
  const pr = t.projects;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {pr.projects1Eyebrow}
          </span>
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {pr.projects1Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {pr.projects1Intro}
          </Typography>
        </div>

        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {ITEMS.map((item) => (
            <a
              key={item.titleKey}
              href={LINK_URL}
              className="group relative mb-5 block break-inside-avoid overflow-hidden rounded-2xl"
              style={{ aspectRatio: item.aspectRatio }}
            >
              <Image
                src={placeholderImage(item.imageSeed, item.aspect)}
                alt={pr[item.altKey]}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="from-fg/80 via-fg/10 absolute inset-0 flex flex-col justify-end gap-2 bg-gradient-to-t to-transparent p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <Badge variant="soft" size="sm" className="w-fit">
                  {pr[item.tagKey]}
                </Badge>
                <div className="flex items-center gap-1.5">
                  <Typography
                    variant="h3"
                    className="text-bg text-base font-medium tracking-tight"
                  >
                    {pr[item.titleKey]}
                  </Typography>
                  <IconArrowUpRight
                    size={16}
                    aria-hidden="true"
                    className="text-bg shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
