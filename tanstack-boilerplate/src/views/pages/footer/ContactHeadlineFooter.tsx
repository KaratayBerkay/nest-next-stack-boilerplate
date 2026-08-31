"use client";

import Link from "next/link";
import { IconBrandGithub, IconBrandLinkedin, IconBrandX, IconMail, IconPhone } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const COLUMNS = [
  { id: "product", titleKey: "footer24ColProductTitle", linkKeys: ["footer24ColProductLink1", "footer24ColProductLink2", "footer24ColProductLink3"] },
  { id: "company", titleKey: "footer24ColCompanyTitle", linkKeys: ["footer24ColCompanyLink1", "footer24ColCompanyLink2", "footer24ColCompanyLink3"] },
] as const;
const SOCIALS = [
  { icon: IconBrandX, ariaKey: "footer24Social1Aria" },
  { icon: IconBrandGithub, ariaKey: "footer24Social2Aria" },
  { icon: IconBrandLinkedin, ariaKey: "footer24Social3Aria" },
] as const;

export function ContactHeadlineFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="w-full py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <h2 className="text-fg max-w-xl text-4xl font-semibold tracking-tight lg:text-5xl">
          {f.footer24Headline}
        </h2>
        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
          <a href="mailto:hello@example.com" className="text-fg inline-flex items-center gap-2 text-sm font-medium">
            <IconMail size={16} aria-hidden="true" />
            {f.footer24Email}
          </a>
          <a href="tel:+14155550100" className="text-fg inline-flex items-center gap-2 text-sm font-medium">
            <IconPhone size={16} aria-hidden="true" />
            {f.footer24Phone}
          </a>
        </div>
        <div className="border-border mt-12 grid gap-8 border-t pt-8 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.id} className="flex flex-col gap-2.5">
              <span className="text-fg text-sm font-semibold">{f[col.titleKey]}</span>
              <ul className="flex flex-col gap-2">
                {col.linkKeys.map((linkKey) => (
                  <li key={linkKey}>
                    <Link href="#" className="text-muted hover:text-fg text-sm">
                      {f[linkKey]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex flex-col gap-2.5">
            <span className="text-fg text-sm font-semibold">{f.footer24SocialTitle}</span>
            <div className="flex gap-3">
              {SOCIALS.map((social) => (
                <Link key={social.ariaKey} href="#" aria-label={f[social.ariaKey]} className="text-muted hover:text-fg">
                  <social.icon size={18} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
