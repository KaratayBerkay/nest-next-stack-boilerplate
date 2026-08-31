"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const ROWS = [
  {
    id: "capture",
    titleKey: "feature192Row1Title",
    bodyKey: "feature192Row1Body",
    altKey: "feature192Row1ImageAlt",
    src: "/img/placeholders/ph-3x4-0.webp",
  },
  {
    id: "refine",
    titleKey: "feature192Row2Title",
    bodyKey: "feature192Row2Body",
    altKey: "feature192Row2ImageAlt",
    src: "/img/placeholders/ph-3x4-3.webp",
  },
  {
    id: "publish",
    titleKey: "feature192Row3Title",
    bodyKey: "feature192Row3Body",
    altKey: "feature192Row3ImageAlt",
    src: "/img/placeholders/ph-3x4-6.webp",
  },
] as const;

export function AccordionDesktopImageSyncFeature() {
  const [openId, setOpenId] = useState<string>(ROWS[0].id);
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;
  const active = ROWS.find((row) => row.id === openId) ?? ROWS[0];

  return (
    <section className="relative w-full py-16 lg:py-24">
      <div className="hidden lg:absolute lg:inset-y-0 lg:right-0 lg:block lg:w-[38%]">
        <Image
          src={active.src}
          alt={f[active.altKey]}
          fill
          className="object-cover"
        />
      </div>
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <div className="max-w-xl lg:pr-[42%]">
          <h2 className="text-fg mb-8 text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature192Heading}
          </h2>
          <Accordion
            type="single"
            value={openId}
            onValueChange={(value) => value && setOpenId(value)}
          >
            {ROWS.map((row) => (
              <AccordionItem key={row.id} value={row.id}>
                <AccordionTrigger>{f[row.titleKey]}</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-4">
                    <span>{f[row.bodyKey]}</span>
                    <div className="border-border bg-surface overflow-hidden rounded-lg border lg:hidden">
                      <Image
                        src={row.src}
                        alt={f[row.altKey]}
                        width={400}
                        height={300}
                        className="aspect-[4/3] w-full object-cover"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
