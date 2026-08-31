"use client";

import Link from "next/link";
import { IconBrandGithub, IconBrandX } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const SOCIALS = [
  { icon: IconBrandX, ariaKey: "footer60Social1Aria" },
  { icon: IconBrandGithub, ariaKey: "footer60Social2Aria" },
] as const;

export function NoLegalBarFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="w-full py-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 lg:px-8">
        <span className="text-muted text-xs">{f.footer60Copyright}</span>
        <div className="flex gap-3">
          {SOCIALS.map((social) => (
            <Link
              key={social.ariaKey}
              href="#"
              aria-label={f[social.ariaKey]}
              className="text-muted hover:text-fg"
            >
              <social.icon size={16} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
