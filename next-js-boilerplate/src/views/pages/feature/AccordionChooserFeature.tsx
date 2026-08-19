"use client";

import { useState } from "react";
import Image from "next/image";
import { IconArrowRight, IconChevronDown } from "@tabler/icons-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const CTA_URL = "#" as const;

const FEATURE_145_ITEMS = [
  {
    value: "focus",
    titleKey: "feature145Item1Title",
    bodyKey: "feature145Item1Body",
    imageKey: "https://picsum.photos/seed/feature145-1/800/600",
    imageAltKey: "feature145Item1ImageAlt",
  },
  {
    value: "collaboration",
    titleKey: "feature145Item2Title",
    bodyKey: "feature145Item2Body",
    imageKey: "https://picsum.photos/seed/feature145-2/800/600",
    imageAltKey: "feature145Item2ImageAlt",
  },
  {
    value: "review",
    titleKey: "feature145Item3Title",
    bodyKey: "feature145Item3Body",
    imageKey: "https://picsum.photos/seed/feature145-3/800/600",
    imageAltKey: "feature145Item3ImageAlt",
  },
] as const;

export function AccordionChooserFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;
  const [openValue, setOpenValue] = useState<string>(
    FEATURE_145_ITEMS[0].value,
  );

  const activeItem =
    FEATURE_145_ITEMS.find((item) => item.value === openValue) ??
    FEATURE_145_ITEMS[0];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col items-start gap-4">
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature145HeadingPrefix}{" "}
              <span className="text-brand">{f.feature145HeadingSuffix}</span>
            </h2>
            <p className="text-muted">{f.feature145Paragraph}</p>
            <a
              href={CTA_URL}
              className="text-muted group hover:text-fg inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
            >
              {f.feature145CtaLabel}
              <IconArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </a>
          </div>
          <div className="flex flex-col gap-6">
            <Accordion
              type="single"
              collapsible
              value={openValue}
              onValueChange={setOpenValue}
            >
              {FEATURE_145_ITEMS.map((item) => (
                <AccordionItem key={item.value} value={item.value}>
                  <AccordionTrigger>
                    <span>{f[item.titleKey]}</span>
                    <IconChevronDown
                      size={16}
                      className="shrink-0 transition-transform duration-300 data-[state=open]:rotate-180"
                    />
                  </AccordionTrigger>
                  <AccordionContent>{f[item.bodyKey]}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="border-border bg-surface overflow-hidden rounded-lg border p-2">
              <Image
                src={activeItem.imageKey}
                alt={f[activeItem.imageAltKey]}
                width={800}
                height={600}
                className="h-full w-full rounded-md object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
