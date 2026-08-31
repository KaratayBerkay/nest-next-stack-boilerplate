"use client";

import Image from "next/image";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithProjectsMessages } from "@/types/pages/projects/ProjectsMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

interface MetadataItem {
  titleKey: string;
  blurbKey: string;
  clientKey: string;
  yearKey: string;
  roleKey: string;
  altKey: string;
  imageSeed: string;
}

const ITEMS: MetadataItem[] = [
  {
    titleKey: "projects7Item1Title",
    blurbKey: "projects7Item1Blurb",
    clientKey: "projects7Item1Client",
    yearKey: "projects7Item1Year",
    roleKey: "projects7Item1Role",
    altKey: "projects7Item1Alt",
    imageSeed: "projects-metadata-1",
  },
  {
    titleKey: "projects7Item2Title",
    blurbKey: "projects7Item2Blurb",
    clientKey: "projects7Item2Client",
    yearKey: "projects7Item2Year",
    roleKey: "projects7Item2Role",
    altKey: "projects7Item2Alt",
    imageSeed: "projects-metadata-2",
  },
  {
    titleKey: "projects7Item3Title",
    blurbKey: "projects7Item3Blurb",
    clientKey: "projects7Item3Client",
    yearKey: "projects7Item3Year",
    roleKey: "projects7Item3Role",
    altKey: "projects7Item3Alt",
    imageSeed: "projects-metadata-3",
  },
  {
    titleKey: "projects7Item4Title",
    blurbKey: "projects7Item4Blurb",
    clientKey: "projects7Item4Client",
    yearKey: "projects7Item4Year",
    roleKey: "projects7Item4Role",
    altKey: "projects7Item4Alt",
    imageSeed: "projects-metadata-4",
  },
  {
    titleKey: "projects7Item5Title",
    blurbKey: "projects7Item5Blurb",
    clientKey: "projects7Item5Client",
    yearKey: "projects7Item5Year",
    roleKey: "projects7Item5Role",
    altKey: "projects7Item5Alt",
    imageSeed: "projects-metadata-5",
  },
  {
    titleKey: "projects7Item6Title",
    blurbKey: "projects7Item6Blurb",
    clientKey: "projects7Item6Client",
    yearKey: "projects7Item6Year",
    roleKey: "projects7Item6Role",
    altKey: "projects7Item6Alt",
    imageSeed: "projects-metadata-6",
  },
];

export function YearClientMetadataGridProjects() {
  const t = useMessages("pages") as unknown as PagesWithProjectsMessages;
  const pr = t.projects;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {pr.projects7Eyebrow}
          </span>
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {pr.projects7Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {pr.projects7Intro}
          </Typography>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item) => (
            <Card key={item.titleKey} variant="default">
              <div className="flex flex-col gap-4 p-4 @sm:p-5">
                <AspectRatio
                  ratio={16 / 10}
                  className="bg-surface relative overflow-hidden rounded-lg"
                >
                  <Image
                    src={placeholderImage(item.imageSeed, "3x2")}
                    alt={pr[item.altKey]}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </AspectRatio>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary" size="sm">
                    {pr[item.yearKey]}
                  </Badge>
                  <Badge variant="outline" size="sm">
                    {pr[item.clientKey]}
                  </Badge>
                  <Badge variant="outline" size="sm">
                    {pr[item.roleKey]}
                  </Badge>
                </div>
                <div>
                  <Typography
                    variant="h3"
                    className="text-fg text-base font-medium tracking-tight"
                  >
                    {pr[item.titleKey]}
                  </Typography>
                  <Typography
                    variant="bodySmall"
                    className="text-muted mt-1 line-clamp-2"
                  >
                    {pr[item.blurbKey]}
                  </Typography>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
