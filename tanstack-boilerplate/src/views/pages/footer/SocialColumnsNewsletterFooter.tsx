"use client";

import Link from "next/link";
import { IconBrandDiscord, IconBrandGithub, IconBrandX } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const COLUMNS = [
  { id: "product", titleKey: "footer8ColProductTitle", linkKeys: ["footer8ColProductLink1", "footer8ColProductLink2"] },
  { id: "company", titleKey: "footer8ColCompanyTitle", linkKeys: ["footer8ColCompanyLink1", "footer8ColCompanyLink2"] },
] as const;
const SOCIALS = [
  { icon: IconBrandX, ariaKey: "footer8Social1Aria" },
  { icon: IconBrandDiscord, ariaKey: "footer8Social2Aria" },
  { icon: IconBrandGithub, ariaKey: "footer8Social3Aria" },
] as const;

export function SocialColumnsNewsletterFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="border-border bg-surface w-full border-t py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-3 pb-8 text-center">
          <span className="text-fg text-lg font-semibold tracking-tight">{f.footer8Logo}</span>
          <div className="flex justify-center gap-3">
            {SOCIALS.map((social) => (
              <Link key={social.ariaKey} href="#" aria-label={f[social.ariaKey]} className="text-muted hover:text-fg">
                <social.icon size={18} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
        <div className="border-border grid gap-8 border-t pt-8 sm:grid-cols-3">
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
            <span className="text-fg text-sm font-semibold">{f.footer8NewsletterTitle}</span>
            <form className="flex flex-col gap-2">
              <Input type="email" placeholder={f.footer8NewsletterPlaceholder} />
              <Button type="submit" variant="primary" size="sm">
                {f.footer8NewsletterSubmit}
              </Button>
            </form>
          </div>
        </div>
        <div className="border-border mt-8 border-t pt-6 text-center">
          <span className="text-muted text-xs">{f.footer8Copyright}</span>
        </div>
      </div>
    </footer>
  );
}
