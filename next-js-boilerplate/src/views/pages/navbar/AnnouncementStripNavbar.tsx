"use client";

import { useState } from "react";
import Link from "next/link";
import { IconMenu2, IconSparkles, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/Sheet";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithNavbarMessages } from "@/types/pages/navbar/NavbarMessages-types";

interface NavLink {
  id: string;
  labelKey: string;
}

const LINKS: NavLink[] = [
  { id: "product", labelKey: "navbar2Link1Label" },
  { id: "changelog", labelKey: "navbar2Link2Label" },
  { id: "pricing", labelKey: "navbar2Link3Label" },
];

export function AnnouncementStripNavbar() {
  const t = useMessages("pages") as unknown as PagesWithNavbarMessages;
  const n = t.navbar;
  const [dismissed, setDismissed] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="border-border overflow-hidden rounded-2xl border">
          {!dismissed && (
            <div className="bg-brand text-brand-fg flex items-center justify-center gap-2 px-4 py-2 text-center text-xs font-medium">
              <IconSparkles size={14} aria-hidden="true" className="shrink-0" />
              <span>
                {n.navbar2AnnouncementText}{" "}
                <Link href="#" className="underline underline-offset-2">
                  {n.navbar2AnnouncementCta}
                </Link>
              </span>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                aria-label={n.navbar2DismissAria}
                className="ml-1 shrink-0 opacity-80 hover:opacity-100"
              >
                <IconX size={14} aria-hidden="true" />
              </button>
            </div>
          )}

          <header className="border-border bg-bg flex items-center justify-between gap-4 border-b px-5 py-4 sm:px-6">
            <Link href="#" className="flex shrink-0 items-center gap-2">
              <span className="bg-brand text-brand-fg flex size-8 items-center justify-center rounded-lg text-sm font-bold">
                {n.navbar2Brand.slice(0, 1)}
              </span>
              <span className="text-fg text-lg font-semibold tracking-tight">
                {n.navbar2Brand}
              </span>
            </Link>

            <nav
              className="hidden items-center gap-1 md:flex"
              aria-label={n.navbar2PrimaryNavAria}
            >
              {LINKS.map((link) => (
                <Link
                  key={link.id}
                  href="#"
                  className="hover:bg-surface-hover rounded-md px-3 py-2 text-sm font-medium"
                >
                  {n[link.labelKey]}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1">
              <Button
                variant="primary"
                size="sm"
                className="hidden md:inline-flex"
              >
                {n.navbar2CtaLabel}
              </Button>
              <Sheet>
                <SheetTrigger
                  aria-label={n.navbar2MenuAria}
                  className="hover:bg-surface-hover inline-flex size-9 shrink-0 items-center justify-center rounded-md md:hidden"
                >
                  <IconMenu2 size={18} aria-hidden="true" />
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="flex flex-col gap-6 overflow-y-auto"
                >
                  <SheetHeader className="text-left">
                    <SheetTitle>{n.navbar2Brand}</SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-1">
                    {LINKS.map((link) => (
                      <Link
                        key={link.id}
                        href="#"
                        className="text-fg hover:bg-surface-hover rounded-md px-2 py-2 text-sm font-medium"
                      >
                        {n[link.labelKey]}
                      </Link>
                    ))}
                  </nav>
                  <Button variant="primary" className="w-full">
                    {n.navbar2CtaLabel}
                  </Button>
                </SheetContent>
              </Sheet>
            </div>
          </header>

          <div className="bg-bg flex flex-col items-start gap-4 px-6 py-14 sm:px-10">
            <h2 className="text-fg max-w-lg text-2xl font-semibold tracking-tight sm:text-3xl">
              {n.navbar2HeroHeading}
            </h2>
            <p className="text-muted max-w-md text-sm leading-relaxed">
              {n.navbar2HeroBody}
            </p>
            <Button variant="primary">{n.navbar2HeroCta}</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
