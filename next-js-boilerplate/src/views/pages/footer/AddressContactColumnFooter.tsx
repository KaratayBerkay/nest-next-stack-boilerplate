"use client";

import Link from "next/link";
import { IconMail, IconMapPin, IconPhone } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const COLUMNS = [
  {
    id: "product",
    titleKey: "footer56ColProductTitle",
    linkKeys: ["footer56ColProductLink1", "footer56ColProductLink2"],
  },
  {
    id: "company",
    titleKey: "footer56ColCompanyTitle",
    linkKeys: ["footer56ColCompanyLink1", "footer56ColCompanyLink2"],
  },
] as const;

export function AddressContactColumnFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="border-border bg-surface w-full border-t py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-3">
          <div className="flex flex-col gap-2.5">
            <span className="text-fg text-sm font-semibold">
              {f.footer56ContactTitle}
            </span>
            <span className="text-muted flex items-start gap-2 text-sm">
              <IconMapPin
                size={15}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />
              {f.footer56Address}
            </span>
            <a
              href="tel:+14155550100"
              className="text-muted hover:text-fg flex items-center gap-2 text-sm"
            >
              <IconPhone size={15} aria-hidden="true" />
              {f.footer56Phone}
            </a>
            <a
              href="mailto:hello@example.com"
              className="text-muted hover:text-fg flex items-center gap-2 text-sm"
            >
              <IconMail size={15} aria-hidden="true" />
              {f.footer56Email}
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
        <div className="border-border mt-10 border-t pt-6">
          <span className="text-muted text-xs">{f.footer56Copyright}</span>
        </div>
      </div>
    </footer>
  );
}
