"use client";

import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

export function LargeBrandCtaFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="border-border bg-surface w-full border-t py-16">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 text-center lg:px-8">
        <h2 className="text-fg text-[16vw] leading-none font-bold tracking-tighter lg:text-8xl">
          {f.footer50Brand}
        </h2>
        <Button asChild variant="primary" size="lg">
          <Link href="#">
            {f.footer50Button}
            <IconArrowRight size={16} aria-hidden="true" />
          </Link>
        </Button>
        <span className="text-muted text-xs">{f.footer50Copyright}</span>
      </div>
    </footer>
  );
}
