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
    titleKey: "footer4ColProductTitle",
    linkKeys: ["footer4ColProductLink1", "footer4ColProductLink2"],
  },
  {
    id: "company",
    titleKey: "footer4ColCompanyTitle",
    linkKeys: ["footer4ColCompanyLink1", "footer4ColCompanyLink2"],
  },
] as const;
const SOCIALS = [
  { icon: IconBrandX, ariaKey: "footer4Social1Aria" },
  { icon: IconBrandGithub, ariaKey: "footer4Social2Aria" },
  { icon: IconBrandLinkedin, ariaKey: "footer4Social3Aria" },
] as const;
const LEGAL_LINKS = ["footer4Legal1", "footer4Legal2"] as const;

export function SocialNewsletterLegalFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="border-border bg-surface w-full border-t py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="border-border flex flex-col gap-6 border-b pb-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-fg text-lg font-semibold tracking-tight">
              {f.footer4Logo}
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
          <form className="flex w-full max-w-xs gap-2">
            <Input
              type="email"
              placeholder={f.footer4NewsletterPlaceholder}
              className="flex-1"
            />
            <Button type="submit" variant="outline" className="shrink-0">
              {f.footer4NewsletterSubmit}
            </Button>
          </form>
        </div>
        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          {COLUMNS.map((col) => (
            <div key={col.id} className="flex flex-col gap-2.5">
              <span className="text-fg text-sm font-semibold">
                {f[col.titleKey]}
              </span>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                {col.linkKeys.map((linkKey) => (
                  <Link
                    key={linkKey}
                    href="#"
                    className="text-muted hover:text-fg text-sm"
                  >
                    {f[linkKey]}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-between">
          <span className="text-muted text-xs">{f.footer4Copyright}</span>
          <div className="flex gap-5">
            {LEGAL_LINKS.map((key) => (
              <Link
                key={key}
                href="#"
                className="text-muted hover:text-fg text-xs"
              >
                {f[key]}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
