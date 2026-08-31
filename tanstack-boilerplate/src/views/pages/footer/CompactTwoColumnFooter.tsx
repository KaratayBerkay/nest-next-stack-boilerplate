"use client";

import Link from "next/link";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const COLUMNS = [
  { id: "product", titleKey: "footer6ColProductTitle", linkKeys: ["footer6ColProductLink1", "footer6ColProductLink2", "footer6ColProductLink3"] },
  { id: "support", titleKey: "footer6ColSupportTitle", linkKeys: ["footer6ColSupportLink1", "footer6ColSupportLink2", "footer6ColSupportLink3"] },
] as const;

export function CompactTwoColumnFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="w-full py-16">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,1fr))]">
          <div className="flex flex-col gap-3">
            <span className="text-fg text-base font-semibold tracking-tight">{f.footer6Logo}</span>
            <p className="text-muted text-sm leading-relaxed">{f.footer6Description}</p>
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
        <div className="border-border mt-8 border-t pt-4">
          <span className="text-muted text-xs">{f.footer6Copyright}</span>
        </div>
      </div>
    </footer>
  );
}
