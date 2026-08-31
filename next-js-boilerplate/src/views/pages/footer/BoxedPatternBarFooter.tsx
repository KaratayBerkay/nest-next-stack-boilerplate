"use client";

import Link from "next/link";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const DOT_PATTERN_STYLE = {
  backgroundImage:
    "radial-gradient(color-mix(in srgb, var(--fg) 10%, transparent) 1px, transparent 1px)",
  backgroundSize: "16px 16px",
} as const;

const COLUMNS = [
  {
    id: "product",
    titleKey: "footer51ColProductTitle",
    linkKeys: ["footer51ColProductLink1", "footer51ColProductLink2"],
  },
  {
    id: "company",
    titleKey: "footer51ColCompanyTitle",
    linkKeys: ["footer51ColCompanyLink1", "footer51ColCompanyLink2"],
  },
  {
    id: "legal",
    titleKey: "footer51ColLegalTitle",
    linkKeys: ["footer51ColLegalLink1", "footer51ColLegalLink2"],
  },
] as const;

export function BoxedPatternBarFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="w-full py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="border-border bg-surface grid gap-8 rounded-2xl border p-8 sm:grid-cols-3">
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
        <div
          aria-hidden="true"
          className="border-border bg-surface mt-4 h-8 rounded-xl border"
          style={DOT_PATTERN_STYLE}
        />
        <span className="text-muted mt-4 block text-center text-xs">
          {f.footer51Copyright}
        </span>
      </div>
    </footer>
  );
}
