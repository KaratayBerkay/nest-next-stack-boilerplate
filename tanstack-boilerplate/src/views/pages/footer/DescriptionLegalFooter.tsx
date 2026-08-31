"use client";

import Link from "next/link";
import { IconBrandGithub, IconBrandLinkedin, IconBrandX } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const COLUMNS = [
  { id: "product", titleKey: "footer7ColProductTitle", linkKeys: ["footer7ColProductLink1", "footer7ColProductLink2", "footer7ColProductLink3"] },
  { id: "company", titleKey: "footer7ColCompanyTitle", linkKeys: ["footer7ColCompanyLink1", "footer7ColCompanyLink2", "footer7ColCompanyLink3"] },
  { id: "resources", titleKey: "footer7ColResourcesTitle", linkKeys: ["footer7ColResourcesLink1", "footer7ColResourcesLink2", "footer7ColResourcesLink3"] },
] as const;
const SOCIALS = [
  { icon: IconBrandX, ariaKey: "footer7Social1Aria" },
  { icon: IconBrandGithub, ariaKey: "footer7Social2Aria" },
  { icon: IconBrandLinkedin, ariaKey: "footer7Social3Aria" },
] as const;
const LEGAL_LINKS = ["footer7Legal1", "footer7Legal2", "footer7Legal3"] as const;

export function DescriptionLegalFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="border-border bg-surface w-full border-t py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))]">
          <div className="flex flex-col gap-3">
            <span className="text-fg text-lg font-semibold tracking-tight">{f.footer7Logo}</span>
            <p className="text-muted max-w-xs text-sm leading-relaxed">{f.footer7Description}</p>
            <div className="mt-1 flex gap-3">
              {SOCIALS.map((social) => (
                <Link key={social.ariaKey} href="#" aria-label={f[social.ariaKey]} className="text-muted hover:text-fg">
                  <social.icon size={18} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
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
        </div>
        <div className="border-border mt-12 flex flex-col-reverse items-center gap-4 border-t pt-6 sm:flex-row sm:justify-between">
          <span className="text-muted text-xs">{f.footer7Copyright}</span>
          <div className="flex gap-5">
            {LEGAL_LINKS.map((key) => (
              <Link key={key} href="#" className="text-muted hover:text-fg text-xs">
                {f[key]}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
