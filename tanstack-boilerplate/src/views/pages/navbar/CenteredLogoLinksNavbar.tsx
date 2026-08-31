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

const LEFT_LINKS: NavLink[] = [
  { id: "features", labelKey: "navbar1Link1Label" },
  { id: "solutions", labelKey: "navbar1Link2Label" },
];

const RIGHT_LINKS: NavLink[] = [
  { id: "pricing", labelKey: "navbar1Link3Label" },
  { id: "resources", labelKey: "navbar1Link4Label" },
];

export function CenteredLogoLinksNavbar() {
  const t = useMessages("pages") as unknown as PagesWithNavbarMessages;
  const n = t.navbar;
  const allLinks = [...LEFT_LINKS, ...RIGHT_LINKS];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="border-border overflow-hidden rounded-2xl border">
          <header className="border-border bg-bg border-b px-5 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-1 items-center gap-1">
                <Sheet>
                  <SheetTrigger
                    aria-label={n.navbar1MenuAria}
                    className="hover:bg-surface-hover inline-flex size-9 shrink-0 items-center justify-center rounded-md md:hidden"
                  >
                    <IconMenu2 size={18} aria-hidden="true" />
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="flex flex-col gap-6 overflow-y-auto"
                  >
                    <SheetHeader className="text-left">
                      <SheetTitle>{n.navbar1Brand}</SheetTitle>
                    </SheetHeader>
                    <nav className="flex flex-col gap-1">
                      {allLinks.map((link) => (
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
                      {n.navbar1CtaLabel}
                    </Button>
                  </SheetContent>
                </Sheet>
                <nav
                  className="hidden items-center gap-1 md:flex"
                  aria-label={n.navbar1PrimaryNavAria}
                >
                  {LEFT_LINKS.map((link) => (
                    <Link
                      key={link.id}
                      href="#"
                      className="hover:bg-surface-hover rounded-md px-3 py-2 text-sm font-medium"
                    >
                      {n[link.labelKey]}
                    </Link>
                  ))}
                </nav>
              </div>

              <Link href="#" className="flex shrink-0 items-center gap-2">
                <span className="bg-brand text-brand-fg flex size-8 items-center justify-center rounded-lg text-sm font-bold">
                  {n.navbar1Brand.slice(0, 1)}
                </span>
                <span className="text-fg text-lg font-semibold tracking-tight">
                  {n.navbar1Brand}
                </span>
              </Link>

              <div className="flex flex-1 items-center justify-end gap-1">
                <nav className="hidden items-center gap-1 md:flex">
                  {RIGHT_LINKS.map((link) => (
                    <Link
                      key={link.id}
                      href="#"
                      className="hover:bg-surface-hover rounded-md px-3 py-2 text-sm font-medium"
                    >
                      {n[link.labelKey]}
                    </Link>
                  ))}
                </nav>
                <Button
                  variant="primary"
                  size="sm"
                  className="hidden md:inline-flex"
                >
                  {n.navbar1CtaLabel}
                </Button>
                <span className="size-9 md:hidden" aria-hidden="true" />
              </div>
            </div>
          </header>

          <div className="bg-bg flex flex-col items-center gap-4 px-6 py-14 text-center sm:px-10">
            <h2 className="text-fg max-w-lg text-2xl font-semibold tracking-tight sm:text-3xl">
              {n.navbar1HeroHeading}
            </h2>
            <p className="text-muted max-w-md text-sm leading-relaxed">
              {n.navbar1HeroBody}
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <Button variant="primary">{n.navbar1HeroPrimaryCta}</Button>
              <Button variant="outline">{n.navbar1HeroSecondaryCta}</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
