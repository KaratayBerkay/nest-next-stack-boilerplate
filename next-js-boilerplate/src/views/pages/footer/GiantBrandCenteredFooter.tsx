"use client";

import Link from "next/link";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandX,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const NAV_LINKS = [
  "footer12Link1",
  "footer12Link2",
  "footer12Link3",
  "footer12Link4",
] as const;
const SOCIALS = [
  { icon: IconBrandX, ariaKey: "footer12Social1Aria" },
  { icon: IconBrandGithub, ariaKey: "footer12Social2Aria" },
  { icon: IconBrandLinkedin, ariaKey: "footer12Social3Aria" },
] as const;

export function GiantBrandCenteredFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="border-border bg-surface w-full overflow-hidden border-t py-16">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 text-center lg:px-8">
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
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
        <div className="flex gap-4">
          {SOCIALS.map((social) => (
            <Link
              key={social.ariaKey}
              href="#"
              aria-label={f[social.ariaKey]}
              className="text-muted hover:text-fg"
            >
              <social.icon size={18} aria-hidden="true" />
            </Link>
          ))}
        </div>
        <span className="text-muted text-xs">{f.footer12Copyright}</span>
      </div>
      <div
        aria-hidden="true"
        className="text-fg/5 pointer-events-none -mt-6 text-center text-[13vw] leading-none font-bold tracking-tighter select-none"
      >
        {f.footer12GiantBrand}
      </div>
    </footer>
  );
}
