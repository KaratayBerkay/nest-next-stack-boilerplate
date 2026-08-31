"use client";

import Link from "next/link";
import { IconWorld } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const SPIN_CSS = `
@keyframes footer23-spin { to { transform: rotate(360deg); } }
.footer23-globe { animation: footer23-spin 18s linear infinite; }
@media (prefers-reduced-motion: reduce) { .footer23-globe { animation: none; } }
`;

const COLUMNS = [
  { id: "product", titleKey: "footer23ColProductTitle", linkKeys: ["footer23ColProductLink1", "footer23ColProductLink2"] },
  { id: "company", titleKey: "footer23ColCompanyTitle", linkKeys: ["footer23ColCompanyLink1", "footer23ColCompanyLink2"] },
] as const;

export function AnimatedGlobeFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="border-border bg-surface w-full border-t py-16">
      <style>{SPIN_CSS}</style>
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[auto_repeat(2,minmax(0,1fr))] lg:items-start">
          <div className="flex flex-col items-start gap-3">
            <span className="bg-brand/10 text-brand flex size-11 items-center justify-center rounded-full">
              <IconWorld size={22} aria-hidden="true" className="footer23-globe" />
            </span>
            <span className="text-fg text-base font-semibold tracking-tight">{f.footer23Logo}</span>
            <span className="text-muted text-xs">{f.footer23RegionCount}</span>
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
        <div className="border-border mt-10 border-t pt-6">
          <span className="text-muted text-xs">{f.footer23Copyright}</span>
        </div>
      </div>
    </footer>
  );
}
