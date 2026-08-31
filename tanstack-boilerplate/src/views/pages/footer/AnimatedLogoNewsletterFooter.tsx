"use client";

import Link from "next/link";
import { IconBolt, IconBrandGithub, IconBrandX } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const SPIN_CSS = `
@keyframes footer31-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
.footer31-pulse { animation: footer31-pulse 2.4s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .footer31-pulse { animation: none; } }
`;

const NAV_LINKS = ["footer31Link1", "footer31Link2", "footer31Link3"] as const;
const SOCIALS = [
  { icon: IconBrandX, ariaKey: "footer31Social1Aria" },
  { icon: IconBrandGithub, ariaKey: "footer31Social2Aria" },
] as const;

export function AnimatedLogoNewsletterFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="bg-fg text-bg w-full py-16">
      <style>{SPIN_CSS}</style>
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 text-center lg:px-8">
        <span className="bg-bg/10 footer31-pulse flex size-12 items-center justify-center rounded-full">
          <IconBolt size={22} aria-hidden="true" />
        </span>
        <h3 className="text-2xl font-semibold tracking-tight">{f.footer31Heading}</h3>
        <form className="flex w-full max-w-sm gap-2">
          <Input type="email" placeholder={f.footer31Placeholder} className="bg-bg/10 border-bg/20 text-bg placeholder:text-bg/50 flex-1" />
          <Button type="submit" variant="shadow" className="shrink-0">
            {f.footer31Submit}
          </Button>
        </form>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {NAV_LINKS.map((key) => (
            <Link key={key} href="#" className="text-bg/70 hover:text-bg text-sm">
              {f[key]}
            </Link>
          ))}
        </nav>
        <div className="flex gap-4">
          {SOCIALS.map((social) => (
            <Link key={social.ariaKey} href="#" aria-label={f[social.ariaKey]} className="text-bg/70 hover:text-bg">
              <social.icon size={18} aria-hidden="true" />
            </Link>
          ))}
        </div>
        <span className="text-bg/60 text-xs">{f.footer31Copyright}</span>
      </div>
    </footer>
  );
}
