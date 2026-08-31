"use client";

import Link from "next/link";
import { IconMenu2 } from "@tabler/icons-react";
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
  { id: "work", labelKey: "navbar7Link1Label" },
  { id: "about", labelKey: "navbar7Link2Label" },
  { id: "journal", labelKey: "navbar7Link3Label" },
  { id: "contact", labelKey: "navbar7Link4Label" },
];

export function MinimalHamburgerNavbar() {
  const t = useMessages("pages") as unknown as PagesWithNavbarMessages;
  const n = t.navbar;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="border-border overflow-hidden rounded-2xl border">
          <header className="border-border bg-bg flex items-center justify-between border-b px-5 py-4 sm:px-6">
            <Link href="#" className="text-fg text-lg font-semibold tracking-tight">
              {n.navbar7Brand}
            </Link>
            <Sheet>
              <SheetTrigger
                aria-label={n.navbar7MenuAria}
                className="hover:bg-surface-hover inline-flex size-9 items-center justify-center rounded-md"
              >
                <IconMenu2 size={20} aria-hidden="true" />
              </SheetTrigger>
              <SheetContent
                side="right"
                className="flex flex-col gap-8 overflow-y-auto"
              >
                <SheetHeader className="text-left">
                  <SheetTitle>{n.navbar7Brand}</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2">
                  {LINKS.map((link) => (
                    <Link
                      key={link.id}
                      href="#"
                      className="text-fg hover:text-muted text-2xl font-medium"
                    >
                      {n[link.labelKey]}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto flex flex-col gap-3">
                  <Button variant="primary" className="w-full">
                    {n.navbar7CtaLabel}
                  </Button>
                  <p className="text-muted text-center text-xs">
                    {n.navbar7FooterNote}
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </header>

          <div className="bg-bg flex flex-col items-center gap-4 px-6 py-20 text-center sm:px-10">
            <h2 className="text-fg max-w-md text-2xl font-semibold tracking-tight sm:text-3xl">
              {n.navbar7HeroHeading}
            </h2>
            <p className="text-muted max-w-sm text-sm leading-relaxed">
              {n.navbar7HeroBody}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
