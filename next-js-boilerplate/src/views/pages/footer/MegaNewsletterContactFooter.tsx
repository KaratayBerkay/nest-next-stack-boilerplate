"use client";

import Link from "next/link";
import { IconMail } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const COLUMNS = [
  {
    id: "product",
    titleKey: "footer37ColProductTitle",
    linkKeys: [
      "footer37ColProductLink1",
      "footer37ColProductLink2",
      "footer37ColProductLink3",
    ],
  },
  {
    id: "company",
    titleKey: "footer37ColCompanyTitle",
    linkKeys: [
      "footer37ColCompanyLink1",
      "footer37ColCompanyLink2",
      "footer37ColCompanyLink3",
    ],
  },
] as const;

export function MegaNewsletterContactFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="border-border bg-surface w-full border-t py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="flex flex-col gap-2">
            <span className="text-fg text-lg font-semibold tracking-tight">
              {f.footer37Logo}
            </span>
            <a
              href="mailto:hello@example.com"
              className="text-muted hover:text-fg flex items-center gap-2 text-sm"
            >
              <IconMail size={14} aria-hidden="true" />
              {f.footer37Email}
            </a>
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
        <div className="border-border mt-10 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-muted text-xs">{f.footer37Copyright}</span>
          <form className="flex gap-2">
            <Input
              type="email"
              placeholder={f.footer37NewsletterPlaceholder}
              className="w-56"
            />
            <Button type="submit" variant="outline">
              {f.footer37NewsletterSubmit}
            </Button>
          </form>
        </div>
      </div>
    </footer>
  );
}
