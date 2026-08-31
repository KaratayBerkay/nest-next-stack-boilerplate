"use client";

import { Accordion, AccordionItemComplex } from "@/components/ui/Accordion";
import {
  IconInfoCircle,
  IconSettings,
  IconCircleCheck,
} from "@tabler/icons-react";

export function FaqSection(t: Record<string, string>) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">{t.faqWithIcons}</h3>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItemComplex
          value="faq1"
          centerSlot={
            <div>
              <div className="text-base font-semibold">{t.faq1Title}</div>
              <div className="text-muted mt-1 text-sm">{t.faq1Desc}</div>
            </div>
          }
          leftSlot={
            <div className="bg-brand text-brand-fg flex h-10 w-10 items-center justify-center rounded-full">
              <IconInfoCircle size={18} stroke={2.5} />
            </div>
          }
          rightSlot={
            <span className="bg-brand/15 text-brand inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
              {t.categoryGeneral}
            </span>
          }
          content={
            <div className="space-y-2">
              <p>{t.faq1Content1}</p>
              <p>{t.faq1Content2}</p>
            </div>
          }
        />
        <AccordionItemComplex
          value="faq2"
          centerSlot={
            <div>
              <div className="text-base font-semibold">{t.faq2Title}</div>
              <div className="text-muted mt-1 text-sm">{t.faq2Desc}</div>
            </div>
          }
          leftSlot={
            <div className="bg-info text-info-fg flex h-10 w-10 items-center justify-center rounded-full">
              <IconSettings size={18} stroke={2.5} />
            </div>
          }
          rightSlot={
            <span className="bg-info/15 text-info inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
              {t.categoryCustomization}
            </span>
          }
          content={
            <div className="space-y-2">
              <p>{t.faq2Content1}</p>
              <p>{t.faq2Content2}</p>
            </div>
          }
        />
        <AccordionItemComplex
          value="faq3"
          centerSlot={
            <div>
              <div className="text-base font-semibold">{t.faq3Title}</div>
              <div className="text-muted mt-1 text-sm">{t.faq3Desc}</div>
            </div>
          }
          leftSlot={
            <div className="bg-success text-success-fg flex h-10 w-10 items-center justify-center rounded-full">
              <IconCircleCheck size={18} stroke={2.5} />
            </div>
          }
          rightSlot={
            <span className="bg-success/15 text-success inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
              {t.categoryBehavior}
            </span>
          }
          content={
            <div className="space-y-2">
              <p>{t.faq3Content1}</p>
              <p>{t.faq3Content2}</p>
            </div>
          }
        />
      </Accordion>
    </section>
  );
}
