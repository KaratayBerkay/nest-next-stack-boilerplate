"use client";

import { IconArrowRight } from "@tabler/icons-react";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  CaseStudy3Featured,
  CaseStudy3Supporting,
  PagesWithCaseStudiesMessages,
} from "@/types/pages/case-studies/CaseStudiesMessages-types";

const LINK_URL = "https://example.com" as const;

const FEATURED: CaseStudy3Featured = {
  categoryKey: "caseStudy3FeaturedCategory",
  titleKey: "caseStudy3FeaturedTitle",
  descriptionKey: "caseStudy3FeaturedDescription",
  altKey: "caseStudy3FeaturedAlt",
  imageSeed: "case-study3-featured",
};

const SUPPORTING: CaseStudy3Supporting[] = [
  {
    titleKey: "caseStudy3Supporting1Title",
    descriptionKey: "caseStudy3Supporting1Description",
    altKey: "caseStudy3Supporting1Alt",
    imageSeed: "case-study3-1",
  },
  {
    titleKey: "caseStudy3Supporting2Title",
    descriptionKey: "caseStudy3Supporting2Description",
    altKey: "caseStudy3Supporting2Alt",
    imageSeed: "case-study3-2",
  },
  {
    titleKey: "caseStudy3Supporting3Title",
    descriptionKey: "caseStudy3Supporting3Description",
    altKey: "caseStudy3Supporting3Alt",
    imageSeed: "case-study3-3",
  },
];

export function FeaturedSupportingGrid() {
  const t = useMessages("pages") as unknown as PagesWithCaseStudiesMessages;
  const cs = t.caseStudies;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {cs.caseStudy3Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {cs.caseStudy3Description}
          </Typography>
        </div>

        <a
          href={LINK_URL}
          className="border-border bg-surface group grid gap-8 overflow-hidden rounded-2xl border p-6 lg:grid-cols-2 lg:gap-12 lg:p-10"
        >
          <AspectRatio
            ratio={16 / 10}
            className="bg-surface relative overflow-hidden rounded-xl"
          >
            <Image
              src={`https://picsum.photos/seed/${FEATURED.imageSeed}/800/500`}
              alt={cs[FEATURED.altKey]}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </AspectRatio>
          <div className="flex flex-col justify-center gap-5">
            <span className="text-brand text-sm font-medium">
              {cs[FEATURED.categoryKey]}
            </span>
            <Typography
              variant="h2"
              className="text-3xl font-medium tracking-tighter md:text-4xl"
            >
              {cs[FEATURED.titleKey]}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {cs[FEATURED.descriptionKey]}
            </Typography>
            <span className="text-brand inline-flex items-center gap-1.5 pt-1 text-sm font-medium">
              {cs.caseStudy3Link}
              <IconArrowRight
                size={15}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </span>
          </div>
        </a>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {SUPPORTING.map((item) => (
            <a
              key={item.titleKey}
              href={LINK_URL}
              className="group flex flex-col gap-4"
            >
              <AspectRatio
                ratio={16 / 10}
                className="bg-surface relative overflow-hidden rounded-2xl"
              >
                <Image
                  src={`https://picsum.photos/seed/${item.imageSeed}/800/500`}
                  alt={cs[item.altKey]}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </AspectRatio>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-medium tracking-tight">
                  {cs[item.titleKey]}
                </h3>
                <Typography variant="bodySmall" className="text-muted">
                  {cs[item.descriptionKey]}
                </Typography>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
