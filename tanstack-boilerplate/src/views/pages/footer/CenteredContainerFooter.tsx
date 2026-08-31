"use client";

import Link from "next/link";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const NAV_LINKS = ["footer54Link1", "footer54Link2", "footer54Link3", "footer54Link4", "footer54Link5"] as const;

export function CenteredContainerFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="border-border w-full border-t py-10">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-6 text-center lg:px-8">
        <span className="text-fg text-sm font-semibold tracking-tight">{f.footer54Logo}</span>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {NAV_LINKS.map((key) => (
            <Link key={key} href="#" className="text-muted hover:text-fg text-sm">
              {f[key]}
            </Link>
          ))}
        </nav>
        <span className="text-muted text-xs">{f.footer54Copyright}</span>
      </div>
    </footer>
  );
}
