"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/Accordion";

export function MultiStateExample() {
  const t = useMessages("accordion");

  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">{t.multipleOpen}</h3>
      <Accordion type="multiple" className="w-full">
        <AccordionItem value="1">
          <AccordionTrigger>{t.accessibleQ}</AccordionTrigger>
          <AccordionContent>
            {t.accessibleA}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="2">
          <AccordionTrigger>{t.styledQ}</AccordionTrigger>
          <AccordionContent>
            {t.styledA}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="3">
          <AccordionTrigger>{t.animatedQ}</AccordionTrigger>
          <AccordionContent>
            {t.animatedA}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
