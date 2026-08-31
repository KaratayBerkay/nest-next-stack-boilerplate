"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/Carousel";
import { Avatar } from "@/components/ui/Avatar";
import { Typography } from "@/components/ui/Typography";
import { Dots } from "@/views/ui/carousel/CarouselHelpers";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  CaseStudy5Item,
  PagesWithCaseStudiesMessages,
} from "@/types/pages/case-studies/CaseStudiesMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const TESTIMONIALS: CaseStudy5Item[] = [
  {
    quoteKey: "caseStudy5Quote1",
    nameKey: "caseStudy5Name1",
    roleKey: "caseStudy5Role1",
    altKey: "caseStudy5Alt1",
    imageSeed: "case-study5-1",
  },
  {
    quoteKey: "caseStudy5Quote2",
    nameKey: "caseStudy5Name2",
    roleKey: "caseStudy5Role2",
    altKey: "caseStudy5Alt2",
    imageSeed: "caseStudy5-2",
  },
  {
    quoteKey: "caseStudy5Quote3",
    nameKey: "caseStudy5Name3",
    roleKey: "caseStudy5Role3",
    altKey: "caseStudy5Alt3",
    imageSeed: "caseStudy5-3",
  },
  {
    quoteKey: "caseStudy5Quote4",
    nameKey: "caseStudy5Name4",
    roleKey: "caseStudy5Role4",
    altKey: "caseStudy5Alt4",
    imageSeed: "caseStudy5-4",
  },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function TestimonialCarouselCase() {
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
            {cs.caseStudy5Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {cs.caseStudy5Description}
          </Typography>
        </div>
        <Carousel opts={{ loop: true }}>
          <div className="relative">
            <CarouselContent className="-ml-4">
              {TESTIMONIALS.map((item, i) => (
                <CarouselItem key={i} className="pl-4">
                  <div className="border-border bg-surface flex min-h-[320px] flex-col items-center justify-center rounded-2xl border p-8 text-center md:min-h-[300px] md:p-12">
                    <p className="text-fg mt-2 mb-8 max-w-2xl text-lg leading-relaxed italic md:text-xl">
                      &ldquo;{cs[item.quoteKey]}&rdquo;
                    </p>
                    <Avatar
                      className="ring-border mb-3 h-12 w-12 ring-2"
                      src={placeholderImage(item.imageSeed, "1x1")}
                      alt={cs[item.altKey]}
                      fallback={getInitials(cs[item.nameKey])}
                    />
                    <div>
                      <p className="text-sm font-semibold">
                        {cs[item.nameKey]}
                      </p>
                      <p className="text-muted text-xs">{cs[item.roleKey]}</p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </div>
          <Dots total={TESTIMONIALS.length} className="mt-3" />
        </Carousel>
      </div>
    </section>
  );
}
