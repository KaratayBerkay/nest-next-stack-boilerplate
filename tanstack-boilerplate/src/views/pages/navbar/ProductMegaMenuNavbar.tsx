"use client";

import Link from "next/link";
import {
  IconChartBar,
  IconMenu2,
  IconPlug,
  IconShieldCheck,
  IconUsersGroup,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/NavigationMenu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/Sheet";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithNavbarMessages } from "@/types/pages/navbar/NavbarMessages-types";

interface FeatureEntry {
  id: string;
  icon: Icon;
  titleKey: string;
  descKey: string;
}

const FEATURES: FeatureEntry[] = [
  {
    id: "analytics",
    icon: IconChartBar,
    titleKey: "navbar3Feature1Title",
    descKey: "navbar3Feature1Desc",
  },
  {
    id: "workflows",
    icon: IconUsersGroup,
    titleKey: "navbar3Feature2Title",
    descKey: "navbar3Feature2Desc",
  },
  {
    id: "integrations",
    icon: IconPlug,
    titleKey: "navbar3Feature3Title",
    descKey: "navbar3Feature3Desc",
  },
  {
    id: "security",
    icon: IconShieldCheck,
    titleKey: "navbar3Feature4Title",
    descKey: "navbar3Feature4Desc",
  },
];

export function ProductMegaMenuNavbar() {
  const t = useMessages("pages") as unknown as PagesWithNavbarMessages;
  const n = t.navbar;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="border-border overflow-visible rounded-2xl border">
          <header className="border-border bg-bg flex items-center justify-between gap-4 rounded-t-2xl border-b px-5 py-3 sm:px-6">
            <Link href="#" className="flex shrink-0 items-center gap-2">
              <span className="bg-brand text-brand-fg flex size-8 items-center justify-center rounded-lg text-sm font-bold">
                {n.navbar3Brand.slice(0, 1)}
              </span>
              <span className="text-fg text-lg font-semibold tracking-tight">
                {n.navbar3Brand}
              </span>
            </Link>

            <div className="hidden md:block">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>
                      {n.navbar3NavProduct}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid w-[min(90vw,560px)] grid-cols-1 gap-1 sm:grid-cols-2">
                        {FEATURES.map((feature) => (
                          <NavigationMenuLink
                            key={feature.id}
                            href="#"
                            className="hover:bg-surface-hover flex items-start gap-3 rounded-lg p-3"
                          >
                            <span className="border-border bg-surface flex size-9 shrink-0 items-center justify-center rounded-lg border">
                              <feature.icon
                                size={18}
                                aria-hidden="true"
                                className="text-fg"
                              />
                            </span>
                            <span className="flex flex-col">
                              <span className="text-fg text-sm font-semibold">
                                {n[feature.titleKey]}
                              </span>
                              <span className="text-muted text-xs">
                                {n[feature.descKey]}
                              </span>
                            </span>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="#"
                      className="hover:bg-surface-hover inline-flex h-9 items-center rounded-md px-3 text-sm font-medium"
                    >
                      {n.navbar3NavPricing}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="#"
                      className="hover:bg-surface-hover inline-flex h-9 items-center rounded-md px-3 text-sm font-medium"
                    >
                      {n.navbar3NavDocs}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="primary"
                size="sm"
                className="hidden md:inline-flex"
              >
                {n.navbar3CtaLabel}
              </Button>
              <Sheet>
                <SheetTrigger
                  aria-label={n.navbar3MenuAria}
                  className="hover:bg-surface-hover inline-flex size-9 shrink-0 items-center justify-center rounded-md md:hidden"
                >
                  <IconMenu2 size={18} aria-hidden="true" />
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="flex flex-col gap-6 overflow-y-auto"
                >
                  <SheetHeader className="text-left">
                    <SheetTitle>{n.navbar3Brand}</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-4">
                    <p className="text-muted text-xs font-medium tracking-wide uppercase">
                      {n.navbar3NavProduct}
                    </p>
                    <div className="flex flex-col gap-1">
                      {FEATURES.map((feature) => (
                        <Link
                          key={feature.id}
                          href="#"
                          className="text-fg hover:bg-surface-hover rounded-md px-2 py-2 text-sm font-medium"
                        >
                          {n[feature.titleKey]}
                        </Link>
                      ))}
                    </div>
                    <Link
                      href="#"
                      className="text-fg hover:bg-surface-hover rounded-md px-2 py-2 text-sm font-medium"
                    >
                      {n.navbar3NavPricing}
                    </Link>
                    <Link
                      href="#"
                      className="text-fg hover:bg-surface-hover rounded-md px-2 py-2 text-sm font-medium"
                    >
                      {n.navbar3NavDocs}
                    </Link>
                  </div>
                  <Button variant="primary" className="w-full">
                    {n.navbar3CtaLabel}
                  </Button>
                </SheetContent>
              </Sheet>
            </div>
          </header>

          <div className="bg-bg flex flex-col items-start gap-4 rounded-b-2xl px-6 py-14 sm:px-10">
            <h2 className="text-fg max-w-lg text-2xl font-semibold tracking-tight sm:text-3xl">
              {n.navbar3HeroHeading}
            </h2>
            <p className="text-muted max-w-md text-sm leading-relaxed">
              {n.navbar3HeroBody}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Button variant="primary">{n.navbar3HeroPrimaryCta}</Button>
              <Button variant="outline">{n.navbar3HeroSecondaryCta}</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
