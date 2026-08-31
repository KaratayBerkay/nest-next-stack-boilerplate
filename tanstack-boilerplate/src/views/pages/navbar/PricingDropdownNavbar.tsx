"use client";

import Link from "next/link";
import { IconChevronDown, IconMenu2 } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
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

interface PlanEntry {
  id: string;
  nameKey: string;
  priceKey: string;
  blurbKey: string;
  highlighted?: boolean;
}

const PLANS: PlanEntry[] = [
  {
    id: "starter",
    nameKey: "navbar8Plan1Name",
    priceKey: "navbar8Plan1Price",
    blurbKey: "navbar8Plan1Blurb",
  },
  {
    id: "pro",
    nameKey: "navbar8Plan2Name",
    priceKey: "navbar8Plan2Price",
    blurbKey: "navbar8Plan2Blurb",
    highlighted: true,
  },
  {
    id: "enterprise",
    nameKey: "navbar8Plan3Name",
    priceKey: "navbar8Plan3Price",
    blurbKey: "navbar8Plan3Blurb",
  },
];

export function PricingDropdownNavbar() {
  const t = useMessages("pages") as unknown as PagesWithNavbarMessages;
  const n = t.navbar;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="border-border overflow-hidden rounded-2xl border">
          <header className="border-border bg-bg flex items-center justify-between gap-4 border-b px-5 py-3 sm:px-6">
            <Link href="#" className="flex shrink-0 items-center gap-2">
              <span className="bg-brand text-brand-fg flex size-8 items-center justify-center rounded-lg text-sm font-bold">
                {n.navbar8Brand.slice(0, 1)}
              </span>
              <span className="text-fg text-lg font-semibold tracking-tight">
                {n.navbar8Brand}
              </span>
            </Link>

            <nav
              className="hidden items-center gap-1 md:flex"
              aria-label={n.navbar8PrimaryNavAria}
            >
              <Link
                href="#"
                className="hover:bg-surface-hover rounded-md px-3 py-2 text-sm font-medium"
              >
                {n.navbar8NavFeatures}
              </Link>
              <Popover>
                <PopoverTrigger className="hover:bg-surface-hover gap-1 rounded-md px-3 py-2 text-sm font-medium">
                  {n.navbar8NavPricing}
                  <IconChevronDown size={14} aria-hidden="true" />
                </PopoverTrigger>
                <PopoverContent
                  title={n.navbar8PricingPopoverTitle}
                  className="w-[min(90vw,560px)]"
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {PLANS.map((plan) => (
                      <div
                        key={plan.id}
                        className={cn(
                          "border-border relative flex flex-col gap-2 rounded-lg border p-4",
                          plan.highlighted && "border-brand",
                        )}
                      >
                        {plan.highlighted && (
                          <Badge
                            variant="soft"
                            size="sm"
                            className="absolute -top-2.5 left-3"
                          >
                            {n.navbar8PopularBadge}
                          </Badge>
                        )}
                        <span className="text-fg text-sm font-semibold">
                          {n[plan.nameKey]}
                        </span>
                        <span className="text-fg text-xl font-bold">
                          {n[plan.priceKey]}
                        </span>
                        <span className="text-muted text-xs leading-relaxed">
                          {n[plan.blurbKey]}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="mt-4 w-full">
                    {n.navbar8ComparePlansCta}
                  </Button>
                </PopoverContent>
              </Popover>
              <Link
                href="#"
                className="hover:bg-surface-hover rounded-md px-3 py-2 text-sm font-medium"
              >
                {n.navbar8NavDocs}
              </Link>
            </nav>

            <div className="flex items-center gap-1">
              <Button
                variant="primary"
                size="sm"
                className="hidden md:inline-flex"
              >
                {n.navbar8CtaLabel}
              </Button>
              <Sheet>
                <SheetTrigger
                  aria-label={n.navbar8MenuAria}
                  className="hover:bg-surface-hover inline-flex size-9 shrink-0 items-center justify-center rounded-md md:hidden"
                >
                  <IconMenu2 size={18} aria-hidden="true" />
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="flex flex-col gap-6 overflow-y-auto"
                >
                  <SheetHeader className="text-left">
                    <SheetTitle>{n.navbar8Brand}</SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-1">
                    <Link
                      href="#"
                      className="text-fg hover:bg-surface-hover rounded-md px-2 py-2 text-sm font-medium"
                    >
                      {n.navbar8NavFeatures}
                    </Link>
                    <Link
                      href="#"
                      className="text-fg hover:bg-surface-hover rounded-md px-2 py-2 text-sm font-medium"
                    >
                      {n.navbar8NavPricing}
                    </Link>
                    <Link
                      href="#"
                      className="text-fg hover:bg-surface-hover rounded-md px-2 py-2 text-sm font-medium"
                    >
                      {n.navbar8NavDocs}
                    </Link>
                  </nav>
                  <Button variant="primary" className="w-full">
                    {n.navbar8CtaLabel}
                  </Button>
                </SheetContent>
              </Sheet>
            </div>
          </header>

          <div className="bg-bg flex flex-col items-start gap-4 px-6 py-14 sm:px-10">
            <h2 className="text-fg max-w-lg text-2xl font-semibold tracking-tight sm:text-3xl">
              {n.navbar8HeroHeading}
            </h2>
            <p className="text-muted max-w-md text-sm leading-relaxed">
              {n.navbar8HeroBody}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
