"use client";

import { IconArrowRight } from "@tabler/icons-react";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  CaseStudy1Item,
  PagesWithCaseStudiesMessages,
} from "@/types/pages/case-studies/CaseStudiesMessages-types";

const LINK_URL = "https://example.com" as const;

const ITEMS: CaseStudy1Item[] = [
  {
    categoryKey: "caseStudy1CategoryPlatform",
    titleKey: "caseStudy1Item1Title",
    descriptionKey: "caseStudy1Item1Description",
    altKey: "caseStudy1Item1Alt",
    imageSeed: "case-study1-1",
  },
  {
    categoryKey: "caseStudy1CategoryRetail",
    titleKey: "caseStudy1Item2Title",
    descriptionKey: "caseStudy1Item2Description",
    altKey: "caseStudy1Item2Alt",
    imageSeed: "case-study1-2",
  },
  {
    categoryKey: "caseStudy1CategoryLogistics",
    titleKey: "caseStudy1Item3Title",
    descriptionKey: "caseStudy1Item3Description",
    altKey: "caseStudy1Item3Alt",
    imageSeed: "case-study1-3",
  },
  {
    categoryKey: "caseStudy1CategoryDesign",
    titleKey: "caseStudy1Item4Title",
    descriptionKey: "caseStudy1Item4Description",
    altKey: "caseStudy1Item4Alt",
    imageSeed: "case-study1-4",
  },
  {
    categoryKey: "caseStudy1CategoryFintech",
    titleKey: "caseStudy1Item5Title",
    descriptionKey: "caseStudy1Item5Description",
    altKey: "caseStudy1Item5Alt",
    imageSeed: "case-study1-5",
  },
  {
    categoryKey: "caseStudy1CategoryEnterprise",
    titleKey: "caseStudy1Item6Title",
    descriptionKey: "caseStudy1Item6Description",
    altKey: "caseStudy1Item6Alt",
    imageSeed: "case-study1-6",
  },
];

export function HoverImageGrid() {
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
            {cs.caseStudy1Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {cs.caseStudy1Description}
          </Typography>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
                  src={`https://picsum.photos/seed/${item.imageSeed}/800/500`}
                  alt={cs[item.altKey]}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </AspectRatio>
              <div className="flex flex-col gap-2">
                <span className="text-brand text-sm font-medium">
                  {cs[item.categoryKey]}
                </span>
                <h3 className="text-lg font-medium tracking-tight">
                  {cs[item.titleKey]}
                </h3>
                <Typography variant="bodySmall" className="text-muted">
                  {cs[item.descriptionKey]}
                </Typography>
                <span className="text-brand mt-1 inline-flex items-center gap-1.5 text-sm font-medium">
                  {cs.caseStudy1Link}
                  <IconArrowRight
                    size={15}
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-0.5"
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
