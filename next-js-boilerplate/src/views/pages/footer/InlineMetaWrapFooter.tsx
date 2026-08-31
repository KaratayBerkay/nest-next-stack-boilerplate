"use client";

import Link from "next/link";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const META_KEYS = ["footer61Meta1", "footer61Meta2", "footer61Meta3"] as const;

export function InlineMetaWrapFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="border-border w-full border-t py-5">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-6 text-center lg:px-8">
        <span className="text-muted text-xs">{f.footer61Copyright}</span>
        {META_KEYS.map((key) => (
          <span key={key} className="flex items-center gap-3">
            <span className="text-border" aria-hidden="true">
              ·
            </span>
            <Link href="#" className="text-muted hover:text-fg text-xs">
              {f[key]}
            </Link>
          </span>
        ))}
      </div>
    </footer>
  );
}
