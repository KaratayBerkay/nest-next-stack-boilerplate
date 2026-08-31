"use client";

import Link from "next/link";
import { IconBrandGithub, IconBrandX } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const SOCIALS = [
  { icon: IconBrandX, ariaKey: "footer53Social1Aria" },
  { icon: IconBrandGithub, ariaKey: "footer53Social2Aria" },
] as const;

export function MutedSplitContrastBarFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="bg-surface-hover w-full">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <span className="text-fg text-sm font-semibold tracking-tight">{f.footer53Logo}</span>
        <div className="flex gap-4">
          {SOCIALS.map((social) => (
            <Link key={social.ariaKey} href="#" aria-label={f[social.ariaKey]} className="text-muted hover:text-fg">
              <social.icon size={18} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
      <div className="bg-fg text-bg py-2.5">
        <span className="mx-auto block max-w-6xl px-6 text-center text-xs lg:px-8">
          {f.footer53Copyright}
        </span>
      </div>
    </footer>
  );
}
