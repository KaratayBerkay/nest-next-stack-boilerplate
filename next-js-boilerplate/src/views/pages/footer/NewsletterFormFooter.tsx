"use client";

import Link from "next/link";
import { IconBrandGithub, IconBrandX, IconSend2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const COLUMNS = [
  {
    id: "product",
    titleKey: "footer3ColProductTitle",
    linkKeys: ["footer3ColProductLink1", "footer3ColProductLink2"],
  },
  {
    id: "company",
    titleKey: "footer3ColCompanyTitle",
    linkKeys: ["footer3ColCompanyLink1", "footer3ColCompanyLink2"],
  },
] as const;
const SOCIALS = [
  { icon: IconBrandX, ariaKey: "footer3Social1Aria" },
  { icon: IconBrandGithub, ariaKey: "footer3Social2Aria" },
] as const;

export function NewsletterFormFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="border-border bg-surface w-full border-t py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_repeat(2,minmax(0,0.7fr))_minmax(0,1.2fr)]">
          <div className="flex flex-col gap-3">
            <span className="text-fg text-lg font-semibold tracking-tight">
              {f.footer3Logo}
            </span>
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
          <div className="flex flex-col gap-2.5">
            <span className="text-fg text-sm font-semibold">
              {f.footer3NewsletterTitle}
            </span>
            <p className="text-muted text-xs leading-relaxed">
              {f.footer3NewsletterBody}
            </p>
            <form className="flex gap-2">
              <Input
                type="email"
                placeholder={f.footer3NewsletterPlaceholder}
                className="flex-1"
              />
              <Button
                type="submit"
                variant="primary"
                size="icon"
                aria-label={f.footer3NewsletterSubmitAria}
              >
                <IconSend2 size={14} aria-hidden="true" />
              </Button>
            </form>
          </div>
        </div>
        <div className="border-border mt-10 border-t pt-6">
          <span className="text-muted text-xs">{f.footer3Copyright}</span>
        </div>
      </div>
    </footer>
  );
}
