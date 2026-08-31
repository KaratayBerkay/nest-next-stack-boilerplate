"use client";

import Link from "next/link";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const NAV_LINKS = ["footer62Link1", "footer62Link2", "footer62Link3"] as const;

export function LogoMenuBarFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="border-border bg-surface w-full border-t py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 lg:px-8">
        <span className="text-fg text-sm font-semibold tracking-tight">{f.footer62Logo}</span>
        <nav className="flex gap-5">
          {NAV_LINKS.map((key) => (
            <Link key={key} href="#" className="text-muted hover:text-fg text-sm">
              {f[key]}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
