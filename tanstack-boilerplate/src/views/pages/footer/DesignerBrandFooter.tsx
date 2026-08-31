"use client";

import Link from "next/link";
import { IconMail } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const NAV_LINKS = ["footer30Link1", "footer30Link2", "footer30Link3", "footer30Link4"] as const;

export function DesignerBrandFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="w-full overflow-hidden py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <h2 className="text-fg text-[14vw] leading-[0.9] font-bold tracking-tighter lg:text-[9vw]">
          {f.footer30GiantBrand}
        </h2>
        <div className="border-border mt-8 flex flex-col gap-6 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
          <a href="mailto:studio@example.com" className="text-fg inline-flex items-center gap-2 text-lg font-medium">
            <IconMail size={20} aria-hidden="true" />
            {f.footer30Email}
          </a>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {NAV_LINKS.map((key) => (
              <Link key={key} href="#" className="text-muted hover:text-fg text-sm">
                {f[key]}
              </Link>
            ))}
          </nav>
        </div>
        <span className="text-muted mt-8 block text-xs">{f.footer30Copyright}</span>
      </div>
    </footer>
  );
}
