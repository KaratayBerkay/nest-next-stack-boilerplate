"use client";

import Link from "next/link";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const NAV_LINKS = ["footer55Link1", "footer55Link2", "footer55Link3"] as const;
const SOCIAL_LINKS = [
  "footer55Social1",
  "footer55Social2",
  "footer55Social3",
] as const;

export function TextSocialLinksFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="border-border w-full border-t py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
          <span className="text-fg text-sm font-semibold tracking-tight">
            {f.footer55Logo}
          </span>
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            {NAV_LINKS.map((key) => (
              <Link
                key={key}
                href="#"
                className="text-muted hover:text-fg text-sm"
              >
                {f[key]}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {SOCIAL_LINKS.map((key) => (
            <Link
              key={key}
              href="#"
              className="text-muted hover:text-fg text-sm"
            >
              {f[key]}
            </Link>
          ))}
        </div>
      </div>
      <span className="text-muted mx-auto mt-6 block max-w-6xl px-6 text-xs lg:px-8">
        {f.footer55Copyright}
      </span>
    </footer>
  );
}
