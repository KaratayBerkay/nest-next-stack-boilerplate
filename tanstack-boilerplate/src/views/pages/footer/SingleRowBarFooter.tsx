"use client";

import Link from "next/link";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const NAV_LINKS = ["footer59Link1", "footer59Link2", "footer59Link3", "footer59Link4"] as const;

export function SingleRowBarFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="border-border w-full border-t py-5">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 sm:flex-row sm:justify-between lg:px-8">
        <span className="text-fg text-sm font-semibold">{f.footer59Logo}</span>
        <nav className="flex flex-wrap gap-x-5 gap-y-1.5">
          {NAV_LINKS.map((key) => (
            <Link key={key} href="#" className="text-muted hover:text-fg text-xs">
              {f[key]}
            </Link>
          ))}
        </nav>
        <span className="text-muted text-xs">{f.footer59Copyright}</span>
      </div>
    </footer>
  );
}
