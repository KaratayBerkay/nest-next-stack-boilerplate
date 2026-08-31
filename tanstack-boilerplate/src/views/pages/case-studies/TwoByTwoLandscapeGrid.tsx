"use client";

import Image from "next/image";
import { IconArrowUpRight } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  CaseStudy12Item,
  PagesWithCaseStudiesMessages,
} from "@/types/pages/case-studies/CaseStudiesMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const LINK_URL = "https://example.com" as const;

const IMAGE_SIZES = "(max-width: 768px) 100vw, 50vw";

const ITEMS: CaseStudy12Item[] = [
  {
    categoryKey: "caseStudy12Item1Category",
    titleKey: "caseStudy12Item1Title",
    descriptionKey: "caseStudy12Item1Description",
    altKey: "caseStudy12Item1Alt",
    imageSeed: "case-study-12-1",
  },
  {
    categoryKey: "caseStudy12Item2Category",
    titleKey: "caseStudy12Item2Title",
    descriptionKey: "caseStudy12Item2Description",
    altKey: "caseStudy12Item2Alt",
    imageSeed: "case-study-12-2",
  },
  {
    categoryKey: "caseStudy12Item3Category",
    titleKey: "caseStudy12Item3Title",
    descriptionKey: "caseStudy12Item3Description",
    altKey: "caseStudy12Item3Alt",
    imageSeed: "case-study-12-3",
  },
  {
    categoryKey: "caseStudy12Item4Category",
    titleKey: "caseStudy12Item4Title",
    descriptionKey: "caseStudy12Item4Description",
    altKey: "caseStudy12Item4Alt",
    imageSeed: "case-study-12-4",
  },
];

export function TwoByTwoLandscapeGrid() {
  const t = useMessages("pages") as unknown as PagesWithCaseStudiesMessages;
  const cs = t.caseStudies;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {cs.caseStudy12Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {cs.caseStudy12Description}
          </Typography>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:gap-8">
          {ITEMS.map((item) => (
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
                  src={placeholderImage(item.imageSeed, "3x2")}
                  alt={cs[item.altKey]}
                  fill
                  sizes={IMAGE_SIZES}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </AspectRatio>
              <div className="flex flex-col gap-2">
                <span className="text-brand text-xs font-semibold tracking-wider uppercase">
                  {cs[item.categoryKey]}
                </span>
                <Typography
                  variant="h3"
                  className="text-xl font-medium tracking-tight"
                >
                  {cs[item.titleKey]}
                </Typography>
                <Typography variant="bodySmall" className="text-muted">
                  {cs[item.descriptionKey]}
                </Typography>
                <span className="text-brand mt-1 inline-flex items-center gap-1.5 text-sm font-medium">
                  {cs.caseStudy12Link}
                  <IconArrowUpRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
