"use client";

import Image from "next/image";
import { IconChevronDown } from "@tabler/icons-react";
import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const FEATURE_ITEMS = [
  {
    value: "item1",
    titleKey: "feature106Item1Title",
    excerptKey: "feature106Item1Excerpt",
    bodyKey: "feature106Item1Body",
    imageKey: "feature106Item1ImageAlt",
    src: "/img/placeholders/ph-4x3-3.webp",
  },
  {
    value: "item2",
    titleKey: "feature106Item2Title",
    excerptKey: "feature106Item2Excerpt",
    bodyKey: "feature106Item2Body",
    imageKey: "feature106Item2ImageAlt",
    src: "/img/placeholders/ph-4x3-7.webp",
  },
  {
    value: "item3",
    titleKey: "feature106Item3Title",
    excerptKey: "feature106Item3Excerpt",
    bodyKey: "feature106Item3Body",
    imageKey: "feature106Item3ImageAlt",
    src: "/img/placeholders/ph-4x3-3.webp",
  },
  {
    value: "item4",
    titleKey: "feature106Item4Title",
    excerptKey: "feature106Item4Excerpt",
    bodyKey: "feature106Item4Body",
    imageKey: "feature106Item4ImageAlt",
    src: "/img/placeholders/ph-4x3-3.webp",
  },
] as const;

function handleAccordionValueChange(
  value: string,
  setActive: Dispatch<SetStateAction<string>>,
) {
  if (value) {
    setActive(value);
  }
}

function findActiveItem(
  items: readonly (typeof FEATURE_ITEMS)[number][],
  value: string,
) {
  return items.find((item) => item.value === value) ?? items[0];
}

export function TabsToAccordionFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  const [active, setActive] = useState<string>(FEATURE_ITEMS[0].value);
  const activeItem = findActiveItem(FEATURE_ITEMS, active);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
        <Accordion
          type="single"
          collapsible
          value={active}
          onValueChange={(value) =>
            handleAccordionValueChange(value, setActive)
          }
        >
          {FEATURE_ITEMS.map((item) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionTrigger>
                <span>{f[item.excerptKey]}</span>
                <IconChevronDown
                  size={16}
                  className="shrink-0 transition-transform duration-300 data-[state=open]:rotate-180"
                />
              </AccordionTrigger>
              <AccordionContent>
                <span className="text-fg font-semibold">
                  {f[item.titleKey]}
                </span>
                <p className="text-muted mt-2 leading-relaxed">
                  {f[item.bodyKey]}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="border-border bg-surface hidden aspect-[4/3] overflow-hidden rounded-lg border lg:block">
          <Image
            key={active}
            src={activeItem.src}
            alt={f[activeItem.imageKey]}
            width={800}
            height={600}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
