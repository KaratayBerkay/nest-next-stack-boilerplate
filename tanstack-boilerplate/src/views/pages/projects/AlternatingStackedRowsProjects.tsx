"use client";

import Image from "next/image";
import { IconArrowRight } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Badge } from "@/components/ui/Badge";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithProjectsMessages } from "@/types/pages/projects/ProjectsMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const LINK_URL = "https://example.com" as const;

interface RowItem {
  titleKey: string;
  blurbKey: string;
  tagKey: string;
  altKey: string;
  imageSeed: string;
}

const ITEMS: RowItem[] = [
  {
    titleKey: "projects9Item1Title",
    blurbKey: "projects9Item1Blurb",
    tagKey: "projects9Item1Tag",
    altKey: "projects9Item1Alt",
    imageSeed: "projects-rows-1",
  },
  {
    titleKey: "projects9Item2Title",
    blurbKey: "projects9Item2Blurb",
    tagKey: "projects9Item2Tag",
    altKey: "projects9Item2Alt",
    imageSeed: "projects-rows-2",
  },
  {
    titleKey: "projects9Item3Title",
    blurbKey: "projects9Item3Blurb",
    tagKey: "projects9Item3Tag",
    altKey: "projects9Item3Alt",
    imageSeed: "projects-rows-3",
  },
  {
    titleKey: "projects9Item4Title",
    blurbKey: "projects9Item4Blurb",
    tagKey: "projects9Item4Tag",
    altKey: "projects9Item4Alt",
    imageSeed: "projects-rows-4",
  },
];

export function AlternatingStackedRowsProjects() {
  const t = useMessages("pages") as unknown as PagesWithProjectsMessages;
  const pr = t.projects;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {pr.projects9Eyebrow}
          </span>
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {pr.projects9Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {pr.projects9Intro}
          </Typography>
        </div>

        <div className="flex flex-col gap-16">
          {ITEMS.map((item, index) => {
            const reversed = index % 2 === 1;
            return (
              <a
                key={item.titleKey}
                href={LINK_URL}
                className={cn(
                  "group grid items-center gap-8 lg:grid-cols-2 lg:gap-16",
                )}
              >
                <div className={cn(reversed && "lg:order-2")}>
                  <AspectRatio
                    ratio={16 / 10}
                    className="bg-surface relative overflow-hidden rounded-2xl"
                  >
                    <Image
                      src={placeholderImage(item.imageSeed, "16x9")}
                      alt={pr[item.altKey]}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </AspectRatio>
                </div>
                <div className={cn("flex flex-col gap-4", reversed && "lg:order-1")}>
                  <Badge variant="soft" size="sm" className="w-fit">
                    {pr[item.tagKey]}
                  </Badge>
                  <Typography
                    variant="h3"
                    className="text-fg text-2xl font-medium tracking-tight md:text-3xl"
                  >
                    {pr[item.titleKey]}
                  </Typography>
                  <Typography
                    variant="bodyLarge"
                    className="text-muted leading-relaxed"
                  >
                    {pr[item.blurbKey]}
                  </Typography>
                  <span className="text-brand mt-1 inline-flex items-center gap-1.5 text-sm font-medium">
                    {pr.projects9ViewLabel}
                    <IconArrowRight
                      size={15}
                      aria-hidden="true"
                      className="transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
