"use client";

import { useState } from "react";
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
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithNavbarMessages } from "@/types/pages/navbar/NavbarMessages-types";

interface NavLink {
  id: string;
  labelKey: string;
}

const LINKS: NavLink[] = [
  { id: "overview", labelKey: "navbar4Link1Label" },
  { id: "features", labelKey: "navbar4Link2Label" },
  { id: "pricing", labelKey: "navbar4Link3Label" },
];

interface FillerSection {
  id: string;
  titleKey: string;
  bodyKey: string;
}

const SECTIONS: FillerSection[] = [
  {
    id: "speed",
    titleKey: "navbar4Section1Title",
    bodyKey: "navbar4Section1Body",
  },
  {
    id: "control",
    titleKey: "navbar4Section2Title",
    bodyKey: "navbar4Section2Body",
  },
  {
    id: "insight",
    titleKey: "navbar4Section3Title",
    bodyKey: "navbar4Section3Body",
  },
  {
    id: "scale",
    titleKey: "navbar4Section4Title",
    bodyKey: "navbar4Section4Body",
  },
];

export function ScrollFadeNavbar() {
  const t = useMessages("pages") as unknown as PagesWithNavbarMessages;
  const n = t.navbar;
  const [scrolled, setScrolled] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="border-border overflow-hidden rounded-2xl border">
          <div
            onScroll={(event) => {
              setScrolled(event.currentTarget.scrollTop > 24);
            }}
            className="relative h-[420px] overflow-y-auto"
          >
            <header
              className={cn(
                "sticky top-0 z-10 flex items-center justify-between gap-4 px-5 py-4 transition-colors duration-300 sm:px-6",
                scrolled
                  ? "bg-bg border-border border-b shadow-sm"
                  : "bg-transparent",
              )}
            >
              <Link href="#" className="flex shrink-0 items-center gap-2">
                <span className="bg-brand text-brand-fg flex size-8 items-center justify-center rounded-lg text-sm font-bold">
                  {n.navbar4Brand.slice(0, 1)}
                </span>
                <span className="text-fg text-lg font-semibold tracking-tight">
                  {n.navbar4Brand}
                </span>
              </Link>

              <nav
                className="hidden items-center gap-1 md:flex"
                aria-label={n.navbar4PrimaryNavAria}
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
                  {n.navbar4CtaLabel}
                </Button>
                <Sheet>
                  <SheetTrigger
                    aria-label={n.navbar4MenuAria}
                    className="hover:bg-surface-hover inline-flex size-9 shrink-0 items-center justify-center rounded-md md:hidden"
                  >
                    <IconMenu2 size={18} aria-hidden="true" />
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="flex flex-col gap-6 overflow-y-auto"
                  >
                    <SheetHeader className="text-left">
                      <SheetTitle>{n.navbar4Brand}</SheetTitle>
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
                      {n.navbar4CtaLabel}
                    </Button>
                  </SheetContent>
                </Sheet>
              </div>
            </header>

            <div className="px-6 pb-16 sm:px-10">
              <div className="flex flex-col gap-3 pt-4">
                <h2 className="text-fg max-w-lg text-2xl font-semibold tracking-tight sm:text-3xl">
                  {n.navbar4HeroHeading}
                </h2>
                <p className="text-muted max-w-md text-sm leading-relaxed">
                  {n.navbar4HeroBody}
                </p>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {SECTIONS.map((sectionItem) => (
                  <div
                    key={sectionItem.id}
                    className="border-border rounded-xl border p-5"
                  >
                    <h3 className="text-fg text-sm font-semibold">
                      {n[sectionItem.titleKey]}
                    </h3>
                    <p className="text-muted mt-1 text-xs leading-relaxed">
                      {n[sectionItem.bodyKey]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="border-border bg-surface/50 text-muted border-t px-5 py-2 text-center text-xs">
            {n.navbar4ScrollHint}
          </p>
        </div>
      </div>
    </section>
  );
}
