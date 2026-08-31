"use client";

import { useState } from "react";
import Image from "next/image";
import { IconArrowUpRight } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithIndustriesMessages } from "@/types/pages/industries/IndustriesMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

interface IndustryRow {
  id: string;
  seed: string;
  titleKey: string;
  metaKey: string;
  imageAltKey: string;
}

const INDUSTRIES: IndustryRow[] = [
  {
    id: "healthcare",
    seed: "industries3-healthcare",
    titleKey: "industries3Item1Title",
    metaKey: "industries3Item1Meta",
    imageAltKey: "industries3Item1ImageAlt",
  },
  {
    id: "financial-services",
    seed: "industries3-financial",
    titleKey: "industries3Item2Title",
    metaKey: "industries3Item2Meta",
    imageAltKey: "industries3Item2ImageAlt",
  },
  {
    id: "retail-ecommerce",
    seed: "industries3-retail",
    titleKey: "industries3Item3Title",
    metaKey: "industries3Item3Meta",
    imageAltKey: "industries3Item3ImageAlt",
  },
  {
    id: "manufacturing",
    seed: "industries3-manufacturing",
    titleKey: "industries3Item4Title",
    metaKey: "industries3Item4Meta",
    imageAltKey: "industries3Item4ImageAlt",
  },
  {
    id: "logistics",
    seed: "industries3-logistics",
    titleKey: "industries3Item5Title",
    metaKey: "industries3Item5Meta",
    imageAltKey: "industries3Item5ImageAlt",
  },
  {
    id: "education",
    seed: "industries3-education",
    titleKey: "industries3Item6Title",
    metaKey: "industries3Item6Meta",
    imageAltKey: "industries3Item6ImageAlt",
  },
];

export function HoverPreviewIndustryRows() {
  const t = useMessages("pages") as unknown as PagesWithIndustriesMessages;
  const i = t.industries;
  const [activeIndex, setActiveIndex] = useState(0);
  const active = INDUSTRIES[activeIndex];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mb-10 flex max-w-2xl flex-col gap-4">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {i.industries3Heading}
          </h2>
          <p className="text-muted">{i.industries3Intro}</p>
        </div>
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-12">
          <div className="border-border divide-border order-last divide-y border-t border-b lg:order-first">
            {INDUSTRIES.map((industry, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={industry.id}
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  className="focus-visible:ring-brand flex w-full items-center justify-between gap-4 rounded-md py-5 text-left focus-visible:ring-2 focus-visible:outline-none"
                >
                  <span className="flex items-center gap-4">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "size-1.5 shrink-0 rounded-full transition-colors",
                        isActive ? "bg-brand" : "bg-transparent",
                      )}
                    />
                    <span className="flex flex-col gap-0.5">
                      <span
                        className={cn(
                          "text-base font-semibold transition-colors sm:text-lg",
                          isActive ? "text-fg" : "text-muted",
                        )}
                      >
                        {i[industry.titleKey]}
                      </span>
                      <span className="text-muted text-xs">
                        {i[industry.metaKey]}
                      </span>
                    </span>
                  </span>
                  <IconArrowUpRight
                    size={18}
                    aria-hidden="true"
                    className={cn(
                      "shrink-0 transition-all",
                      isActive
                        ? "text-brand translate-x-0.5 -translate-y-0.5"
                        : "text-muted",
                    )}
                  />
                </button>
              );
            })}
          </div>
          <div className="border-border bg-surface relative order-first aspect-[16/9] overflow-hidden rounded-2xl border lg:sticky lg:top-8 lg:order-last lg:aspect-[4/3]">
            <Image
              key={active.id}
              src={placeholderImage(active.seed, "4x3")}
              alt={i[active.imageAltKey]}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
            <div className="from-fg/90 absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent p-5">
              <span className="text-bg block text-sm font-semibold">
                {i[active.titleKey]}
              </span>
              <span className="text-bg/80 block text-xs">
                {i[active.metaKey]}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
