"use client";

import Link from "next/link";
import { IconArrowRight, IconBrandGithub, IconBrandX } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const SOCIALS = [
  { icon: IconBrandX, ariaKey: "footer27Social1Aria" },
  { icon: IconBrandGithub, ariaKey: "footer27Social2Aria" },
] as const;

export function AnimatedCtaFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="w-full py-16">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 text-center lg:px-8">
        <Button asChild variant="primary" size="lg" className="group">
          <Link href="#">
            {f.footer27CtaButton}
            <IconArrowRight
              size={16}
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </Button>
        <Separator className="w-24" />
        <div className="flex gap-4">
          {SOCIALS.map((social) => (
            <Link key={social.ariaKey} href="#" aria-label={f[social.ariaKey]} className="text-muted hover:text-fg">
              <social.icon size={18} aria-hidden="true" />
            </Link>
          ))}
        </div>
        <span className="text-muted text-xs">{f.footer27Copyright}</span>
      </div>
    </footer>
  );
}
