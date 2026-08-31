"use client";

import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const SECTIONS = [
  { id: "product", titleKey: "footer49ColProductTitle", linkKeys: ["footer49ColProductLink1", "footer49ColProductLink2", "footer49ColProductLink3"] },
  { id: "solutions", titleKey: "footer49ColSolutionsTitle", linkKeys: ["footer49ColSolutionsLink1", "footer49ColSolutionsLink2"] },
  { id: "company", titleKey: "footer49ColCompanyTitle", linkKeys: ["footer49ColCompanyLink1", "footer49ColCompanyLink2"] },
  { id: "legal", titleKey: "footer49ColLegalTitle", linkKeys: ["footer49ColLegalLink1", "footer49ColLegalLink2"] },
] as const;

export function MegaAccordionLinksFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="border-border bg-surface w-full border-t py-16">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <span className="text-fg text-lg font-semibold tracking-tight">{f.footer49Logo}</span>
        <div className="mt-6">
          <Accordion type="single">
            {SECTIONS.map((section) => (
              <AccordionItem key={section.id} value={section.id}>
                <AccordionTrigger>{f[section.titleKey]}</AccordionTrigger>
                <AccordionContent>
                  <ul className="flex flex-col gap-2">
                    {section.linkKeys.map((linkKey) => (
                      <li key={linkKey}>
                        <Link href="#" className="text-muted hover:text-fg text-sm">
                          {f[linkKey]}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <span className="text-muted mt-6 block text-xs">{f.footer49Copyright}</span>
      </div>
    </footer>
  );
}
