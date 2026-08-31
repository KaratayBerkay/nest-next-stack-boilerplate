"use client";

import Link from "next/link";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const COLUMNS = [
  {
    id: "product",
    titleKey: "footer14ColProductTitle",
    linkKeys: [
      "footer14ColProductLink1",
      "footer14ColProductLink2",
      "footer14ColProductLink3",
    ],
  },
  {
    id: "company",
    titleKey: "footer14ColCompanyTitle",
    linkKeys: [
      "footer14ColCompanyLink1",
      "footer14ColCompanyLink2",
      "footer14ColCompanyLink3",
    ],
  },
  {
    id: "resources",
    titleKey: "footer14ColResourcesTitle",
    linkKeys: [
      "footer14ColResourcesLink1",
      "footer14ColResourcesLink2",
      "footer14ColResourcesLink3",
    ],
  },
] as const;
const SOCIALS = [
  { icon: IconBrandX, ariaKey: "footer14Social1Aria" },
  { icon: IconBrandGithub, ariaKey: "footer14Social2Aria" },
  { icon: IconBrandLinkedin, ariaKey: "footer14Social3Aria" },
] as const;

export function ThreeColumnNewsletterFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="border-border bg-surface w-full border-t py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,0.8fr))]">
          <div className="flex flex-col gap-3">
            <span className="text-fg text-lg font-semibold tracking-tight">
              {f.footer14Logo}
            </span>
            <form className="flex flex-col gap-2">
              <span className="text-muted text-xs">
                {f.footer14NewsletterLabel}
              </span>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder={f.footer14NewsletterPlaceholder}
                  className="flex-1"
                />
                <Button type="submit" variant="outline" className="shrink-0">
                  {f.footer14NewsletterSubmit}
                </Button>
              </div>
            </form>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.id} className="flex flex-col gap-2.5">
              <span className="text-fg text-sm font-semibold">
                {f[col.titleKey]}
              </span>
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
          <span className="text-muted text-xs">{f.footer14Copyright}</span>
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
      </div>
    </footer>
  );
}
