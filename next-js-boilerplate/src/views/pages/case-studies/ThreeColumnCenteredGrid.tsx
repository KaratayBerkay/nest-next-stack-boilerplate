"use client";

import Image from "next/image";
import { IconArrowUpRight } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  CaseStudy11Item,
  PagesWithCaseStudiesMessages,
} from "@/types/pages/case-studies/CaseStudiesMessages-types";

const LINK_URL = "https://example.com" as const;

const IMAGE_SIZES = "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw";

const ITEMS: CaseStudy11Item[] = [
  {
    categoryKey: "caseStudy11Item1Category",
    titleKey: "caseStudy11Item1Title",
    descriptionKey: "caseStudy11Item1Description",
    altKey: "caseStudy11Item1Alt",
    imageSeed: "case-study-11-1",
  },
  {
    categoryKey: "caseStudy11Item2Category",
    titleKey: "caseStudy11Item2Title",
    descriptionKey: "caseStudy11Item2Description",
    altKey: "caseStudy11Item2Alt",
    imageSeed: "case-study-11-2",
  },
  {
    categoryKey: "caseStudy11Item3Category",
    titleKey: "caseStudy11Item3Title",
    descriptionKey: "caseStudy11Item3Description",
    altKey: "caseStudy11Item3Alt",
    imageSeed: "case-study-11-3",
  },
  {
    categoryKey: "caseStudy11Item4Category",
    titleKey: "caseStudy11Item4Title",
    descriptionKey: "caseStudy11Item4Description",
    altKey: "caseStudy11Item4Alt",
    imageSeed: "case-study-11-4",
  },
  {
    categoryKey: "caseStudy11Item5Category",
    titleKey: "caseStudy11Item5Title",
    descriptionKey: "caseStudy11Item5Description",
    altKey: "caseStudy11Item5Alt",
    imageSeed: "case-study-11-5",
  },
  {
    categoryKey: "caseStudy11Item6Category",
    titleKey: "caseStudy11Item6Title",
    descriptionKey: "caseStudy11Item6Description",
    altKey: "caseStudy11Item6Alt",
    imageSeed: "case-study-11-6",
  },
];

export function ThreeColumnCenteredGrid() {
  const t = useMessages("pages") as unknown as PagesWithCaseStudiesMessages;
  const cs = t.caseStudies;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 text-center">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {cs.caseStudy11Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {cs.caseStudy11Description}
          </Typography>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {ITEMS.map((item) => (
            <a
              key={item.titleKey}
              href={LINK_URL}
              className="group flex flex-col gap-4"
            >
              <AspectRatio
                ratio={4 / 3}
                className="bg-surface relative overflow-hidden rounded-2xl"
              >
                <Image
                  src={`https://picsum.photos/seed/${item.imageSeed}/800/500`}
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
                  {cs.caseStudy11Link}
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
