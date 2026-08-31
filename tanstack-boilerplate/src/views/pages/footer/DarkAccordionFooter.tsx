"use client";

import Link from "next/link";
import { IconBrandGithub, IconBrandX } from "@tabler/icons-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const SECTIONS = [
  { id: "product", titleKey: "footer16ColProductTitle", linkKeys: ["footer16ColProductLink1", "footer16ColProductLink2", "footer16ColProductLink3"] },
  { id: "company", titleKey: "footer16ColCompanyTitle", linkKeys: ["footer16ColCompanyLink1", "footer16ColCompanyLink2", "footer16ColCompanyLink3"] },
  { id: "resources", titleKey: "footer16ColResourcesTitle", linkKeys: ["footer16ColResourcesLink1", "footer16ColResourcesLink2", "footer16ColResourcesLink3"] },
] as const;
const SOCIALS = [
  { icon: IconBrandX, ariaKey: "footer16Social1Aria" },
  { icon: IconBrandGithub, ariaKey: "footer16Social2Aria" },
] as const;

export function DarkAccordionFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="border-border bg-surface w-full overflow-hidden border-t py-16">
      <div className="mx-auto max-w-2xl px-6 lg:px-8">
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
        <div className="mt-8 flex items-center justify-between">
          <div className="flex gap-3">
            {SOCIALS.map((social) => (
              <Link key={social.ariaKey} href="#" aria-label={f[social.ariaKey]} className="text-muted hover:text-fg">
                <social.icon size={18} aria-hidden="true" />
              </Link>
            ))}
          </div>
          <span className="text-muted text-xs">{f.footer16Copyright}</span>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="text-fg/5 mt-10 text-center text-[15vw] leading-none font-bold tracking-tighter select-none"
      >
        {f.footer16Watermark}
      </div>
    </footer>
  );
}
