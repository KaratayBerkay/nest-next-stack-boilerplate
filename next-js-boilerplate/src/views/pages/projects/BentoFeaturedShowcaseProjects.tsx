"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithProjectsMessages } from "@/types/pages/projects/ProjectsMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PlaceholderAspect } from "@/views/pages/_shared/placeholder-image";

const LINK_URL = "https://example.com" as const;

interface BentoItem {
  titleKey: string;
  tagKey: string;
  altKey: string;
  imageSeed: string;
  aspect: PlaceholderAspect;
  spanClassName: string;
}

const ITEMS: BentoItem[] = [
  {
    titleKey: "projects5Item1Title",
    tagKey: "projects5Item1Tag",
    altKey: "projects5Item1Alt",
    imageSeed: "projects-bento-1",
    aspect: "4x3",
    spanClassName: "sm:col-span-2 sm:row-span-2",
  },
  {
    titleKey: "projects5Item2Title",
    tagKey: "projects5Item2Tag",
    altKey: "projects5Item2Alt",
    imageSeed: "projects-bento-2",
    aspect: "1x1",
    spanClassName: "sm:col-span-1 sm:row-span-1",
  },
  {
    titleKey: "projects5Item3Title",
    tagKey: "projects5Item3Tag",
    altKey: "projects5Item3Alt",
    imageSeed: "projects-bento-3",
    aspect: "1x1",
    spanClassName: "sm:col-span-1 sm:row-span-1",
  },
  {
    titleKey: "projects5Item4Title",
    tagKey: "projects5Item4Tag",
    altKey: "projects5Item4Alt",
    imageSeed: "projects-bento-4",
    aspect: "16x9",
    spanClassName: "sm:col-span-2 sm:row-span-1",
  },
  {
    titleKey: "projects5Item5Title",
    tagKey: "projects5Item5Tag",
    altKey: "projects5Item5Alt",
    imageSeed: "projects-bento-5",
    aspect: "3x4",
    spanClassName: "sm:col-span-1 sm:row-span-2",
  },
  {
    titleKey: "projects5Item6Title",
    tagKey: "projects5Item6Tag",
    altKey: "projects5Item6Alt",
    imageSeed: "projects-bento-6",
    aspect: "3x4",
    spanClassName: "sm:col-span-1 sm:row-span-2",
  },
];

export function BentoFeaturedShowcaseProjects() {
  const t = useMessages("pages") as unknown as PagesWithProjectsMessages;
  const pr = t.projects;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {pr.projects5Eyebrow}
          </span>
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {pr.projects5Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {pr.projects5Intro}
          </Typography>
        </div>

        <div className="grid auto-rows-[9rem] grid-cols-1 gap-4 sm:grid-cols-4">
          {ITEMS.map((item) => (
            <a
              key={item.titleKey}
              href={LINK_URL}
              className={cn(
                "group border-border relative flex overflow-hidden rounded-2xl border",
                item.spanClassName,
              )}
            >
              <Image
                src={placeholderImage(item.imageSeed, item.aspect)}
                alt={pr[item.altKey]}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="from-fg/85 absolute inset-0 flex flex-col justify-end gap-2 bg-gradient-to-t via-transparent to-transparent p-4">
                <Badge variant="soft" size="sm" className="w-fit">
                  {pr[item.tagKey]}
                </Badge>
                <Typography
                  variant="h3"
                  className="text-bg text-base font-medium tracking-tight"
                >
                  {pr[item.titleKey]}
                </Typography>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
