"use client";

import {
  IconArrowUpRight,
  IconBrandSlack,
  IconBrandStripe,
  IconBrandVercel,
  IconBrandNotion,
  IconBrandFramer,
} from "@tabler/icons-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/Carousel";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { Icon } from "@tabler/icons-react";
import type {
  CaseStudy6Item,
  PagesWithCaseStudiesMessages,
} from "@/types/pages/case-studies/CaseStudiesMessages-types";

const LOGO_ITEMS: { icon: Icon; item: CaseStudy6Item }[] = [
  {
    icon: IconBrandSlack,
    item: {
      titleKey: "caseStudy6Title1",
      descriptionKey: "caseStudy6Description1",
    },
  },
  {
    icon: IconBrandStripe,
    item: {
      titleKey: "caseStudy6Title2",
      descriptionKey: "caseStudy6Description2",
    },
  },
  {
    icon: IconBrandVercel,
    item: {
      titleKey: "caseStudy6Title3",
      descriptionKey: "caseStudy6Description3",
    },
  },
  {
    icon: IconBrandNotion,
    item: {
      titleKey: "caseStudy6Title4",
      descriptionKey: "caseStudy6Description4",
    },
  },
  {
    icon: IconBrandFramer,
    item: {
      titleKey: "caseStudy6Title5",
      descriptionKey: "caseStudy6Description5",
    },
  },
  {
    icon: IconArrowUpRight,
    item: {
      titleKey: "caseStudy6Title6",
      descriptionKey: "caseStudy6Description6",
    },
  },
];

export function MaskedLogoCarousel() {
  const t = useMessages("pages") as unknown as PagesWithCaseStudiesMessages;
  const cs = t.caseStudies;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {cs.caseStudy6Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {cs.caseStudy6Description}
          </Typography>
        </div>
        <Carousel opts={{ loop: true }}>
          <div className="relative">
            <CarouselContent className="-ml-3">
              {LOGO_ITEMS.map((logo) => (
                <CarouselItem
                  key={logo.item.titleKey}
                  className="basis-[300px] pl-3"
                >
                  <div className="border-border bg-surface flex h-full flex-col gap-3 rounded-2xl border p-6">
                    <div className="border-border bg-surface flex size-11 items-center justify-center rounded-xl border">
                      <logo.icon
                        size={20}
                        className="text-brand"
                        aria-hidden="true"
                      />
                    </div>
                    <Typography
                      variant="h3"
                      className="text-lg font-medium tracking-tight"
                    >
                      {cs[logo.item.titleKey]}
                    </Typography>
                    <Typography variant="bodySmall" className="text-muted">
                      {cs[logo.item.descriptionKey]}
                    </Typography>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
            <div className="from-bg pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r to-transparent" />
            <div className="from-bg pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l to-transparent" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
