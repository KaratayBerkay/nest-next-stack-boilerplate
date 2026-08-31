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
    id: "plan",
    titleKey: "feature197Row1Title",
    bodyKey: "feature197Row1Body",
    altKey: "feature197Row1ImageAlt",
    src: "/img/placeholders/ph-4x3-1.webp",
  },
  {
    id: "build",
    titleKey: "feature197Row2Title",
    bodyKey: "feature197Row2Body",
    altKey: "feature197Row2ImageAlt",
    src: "/img/placeholders/ph-4x3-3.webp",
  },
  {
    id: "ship",
    titleKey: "feature197Row3Title",
    bodyKey: "feature197Row3Body",
    altKey: "feature197Row3ImageAlt",
    src: "/img/placeholders/ph-4x3-5.webp",
  },
] as const;

export function AccordionImagePanelFeature() {
  const [openId, setOpenId] = useState<string>(ROWS[0].id);
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;
  const active = ROWS.find((row) => row.id === openId) ?? ROWS[0];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Accordion
            type="single"
            value={openId}
            onValueChange={(value) => value && setOpenId(value)}
          >
            {ROWS.map((row) => (
              <AccordionItem key={row.id} value={row.id}>
                <AccordionTrigger>{f[row.titleKey]}</AccordionTrigger>
                <AccordionContent>{f[row.bodyKey]}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="border-border bg-surface overflow-hidden rounded-xl border">
            <Image
              src={active.src}
              alt={f[active.altKey]}
              width={640}
              height={480}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
