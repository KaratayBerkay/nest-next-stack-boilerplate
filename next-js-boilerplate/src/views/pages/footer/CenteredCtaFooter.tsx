"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

export function CenteredCtaFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="w-full py-16">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 px-6 text-center lg:px-8">
        <h3 className="text-fg text-3xl font-semibold tracking-tight">
          {f.footer32Heading}
        </h3>
        <p className="text-muted text-sm leading-relaxed">{f.footer32Body}</p>
        <Button asChild variant="primary">
          <Link href="#">{f.footer32Button}</Link>
        </Button>
        <span className="text-muted mt-6 text-xs">{f.footer32Copyright}</span>
      </div>
    </footer>
  );
}
