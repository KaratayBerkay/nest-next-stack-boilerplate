"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandX,
  IconChevronDown,
  IconSend2,
} from "@tabler/icons-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithEcommerceFooterMessages } from "@/types/pages/ecommerce-footer/EcommerceFooterMessages-types";

interface FooterLink {
  id: string;
  labelKey: string;
}

interface FooterSection {
  id: string;
  titleKey: string;
  links: FooterLink[];
}

const SECTIONS: FooterSection[] = [
  {
    id: "shop",
    titleKey: "ecommerceFooter2Section1Title",
    links: [
      { id: "new", labelKey: "ecommerceFooter2Section1Link1" },
      { id: "best", labelKey: "ecommerceFooter2Section1Link2" },
      { id: "sale", labelKey: "ecommerceFooter2Section1Link3" },
    ],
  },
  {
    id: "care",
    titleKey: "ecommerceFooter2Section2Title",
    links: [
      { id: "track", labelKey: "ecommerceFooter2Section2Link1" },
      { id: "returns", labelKey: "ecommerceFooter2Section2Link2" },
      { id: "faq", labelKey: "ecommerceFooter2Section2Link3" },
    ],
  },
  {
    id: "company",
    titleKey: "ecommerceFooter2Section3Title",
    links: [
      { id: "about", labelKey: "ecommerceFooter2Section3Link1" },
      { id: "careers", labelKey: "ecommerceFooter2Section3Link2" },
      { id: "sustainability", labelKey: "ecommerceFooter2Section3Link3" },
    ],
  },
];

const SOCIALS = [
  { icon: IconBrandInstagram, ariaKey: "ecommerceFooter2Social1Aria" },
  { icon: IconBrandTiktok, ariaKey: "ecommerceFooter2Social2Aria" },
  { icon: IconBrandX, ariaKey: "ecommerceFooter2Social3Aria" },
] as const;

export function AccordionLinksEcommerceFooter() {
  const t = useMessages("pages") as unknown as PagesWithEcommerceFooterMessages;
  const f = t.ecommerceFooter;

  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  function handleJoin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return;
    setJoined(true);
  }

  return (
    <footer className="border-border bg-surface w-full border-t">
      <div className="mx-auto max-w-3xl px-6 py-12 lg:px-8">
        <div className="flex flex-col gap-1">
          <span className="text-fg text-lg font-semibold tracking-tight">
            {f.ecommerceFooter2Brand}
          </span>
          <p className="text-muted text-sm">{f.ecommerceFooter2Tagline}</p>
        </div>

        <Accordion type="single" collapsible className="mt-8">
          {SECTIONS.map((section) => (
            <AccordionItem key={section.id} value={section.id}>
              <AccordionTrigger className="group">
                <span className="text-fg text-sm font-semibold">
                  {f[section.titleKey]}
                </span>
                <IconChevronDown
                  size={16}
                  className="text-muted shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                  aria-hidden="true"
                />
              </AccordionTrigger>
              <AccordionContent>
                <ul className="flex flex-col gap-3">
                  {section.links.map((link) => (
                    <li key={link.id}>
                      <Link href="#" className="text-muted hover:text-fg text-sm">
                        {f[link.labelKey]}
                      </Link>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {joined ? (
            <p className="text-fg text-sm font-medium">
              {f.ecommerceFooter2NewsletterJoined}
            </p>
          ) : (
            <form onSubmit={handleJoin} className="flex w-full max-w-xs gap-2">
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={f.ecommerceFooter2NewsletterPlaceholder}
                aria-label={f.ecommerceFooter2NewsletterPlaceholder}
                required
              />
              <Button
                type="submit"
                variant="outline"
                rightIcon={<IconSend2 size={14} aria-hidden="true" />}
                className="shrink-0"
              >
                {f.ecommerceFooter2NewsletterCta}
              </Button>
            </form>
          )}
          <div className="flex gap-3">
            {SOCIALS.map((social) => (
              <Link
                key={social.ariaKey}
                href="#"
                aria-label={f[social.ariaKey]}
                className="text-muted hover:text-fg"
              >
                <social.icon size={18} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>

        <p className="text-muted mt-8 text-xs">{f.ecommerceFooter2Copyright}</p>
      </div>
    </footer>
  );
}
