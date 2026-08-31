"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/Carousel";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const ROWS = [
  { id: "connect", titleKey: "feature69Row1Title", bodyKey: "feature69Row1Body", altKey: "feature69Row1ImageAlt", src: "/img/placeholders/ph-4x3-0.webp" },
  { id: "sync", titleKey: "feature69Row2Title", bodyKey: "feature69Row2Body", altKey: "feature69Row2ImageAlt", src: "/img/placeholders/ph-4x3-2.webp" },
  { id: "resolve", titleKey: "feature69Row3Title", bodyKey: "feature69Row3Body", altKey: "feature69Row3ImageAlt", src: "/img/placeholders/ph-4x3-4.webp" },
] as const;

export function RightCarouselSyncAccordionFeature() {
  const [openId, setOpenId] = useState<string>(ROWS[0].id);
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;
  const activeIndex = ROWS.findIndex((row) => row.id === openId);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Accordion
            type="single"
            value={openId}
            onValueChange={(value) => value && setOpenId(value)}
            className="lg:order-1"
          >
            {ROWS.map((row) => (
              <AccordionItem key={row.id} value={row.id}>
                <AccordionTrigger>{f[row.titleKey]}</AccordionTrigger>
                <AccordionContent>{f[row.bodyKey]}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <Carousel className="lg:order-2">
            <CarouselContent
              style={{ transform: `translate3d(-${Math.max(activeIndex, 0) * 100}%, 0, 0)` }}
              className="transition-transform duration-300"
            >
              {ROWS.map((row) => (
                <CarouselItem key={row.id} className="pl-0">
                  <div className="border-border bg-surface overflow-hidden rounded-xl border">
                    <Image
                      src={row.src}
                      alt={f[row.altKey]}
                      width={640}
                      height={480}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  );
}
