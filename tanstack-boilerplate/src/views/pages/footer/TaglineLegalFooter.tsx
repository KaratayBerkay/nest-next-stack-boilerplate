"use client";

import Link from "next/link";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const COLUMNS = [
  { id: "product", titleKey: "footer2ColProductTitle", linkKeys: ["footer2ColProductLink1", "footer2ColProductLink2"] },
  { id: "company", titleKey: "footer2ColCompanyTitle", linkKeys: ["footer2ColCompanyLink1", "footer2ColCompanyLink2"] },
  { id: "legal", titleKey: "footer2ColLegalTitle", linkKeys: ["footer2ColLegalLink1", "footer2ColLegalLink2"] },
] as const;

const LEGAL_LINKS = ["footer2Legal1", "footer2Legal2", "footer2Legal3"] as const;

export function TaglineLegalFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="border-border bg-surface w-full border-t py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3">
            <span className="text-fg text-lg font-semibold tracking-tight">{f.footer2Logo}</span>
            <p className="text-muted max-w-xs text-sm leading-relaxed">{f.footer2Tagline}</p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.id} className="flex flex-col gap-3">
              <span className="text-fg text-sm font-semibold">{f[col.titleKey]}</span>
              <ul className="flex flex-col gap-2.5">
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
          <span className="text-muted text-xs">{f.footer2Copyright}</span>
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
