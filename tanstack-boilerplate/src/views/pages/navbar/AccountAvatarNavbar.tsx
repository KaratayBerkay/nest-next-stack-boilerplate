"use client";

import { useState } from "react";
import Link from "next/link";
import { IconBell } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button, IconButton } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithNavbarMessages } from "@/types/pages/navbar/NavbarMessages-types";

export function AccountAvatarNavbar() {
  const t = useMessages("pages") as unknown as PagesWithNavbarMessages;
  const n = t.navbar;
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="border-border overflow-hidden rounded-2xl border">
          <header className="border-border bg-bg flex items-center justify-between gap-4 border-b px-5 py-4 sm:px-6">
            <Link href="#" className="flex shrink-0 items-center gap-2">
              <span className="bg-brand text-brand-fg flex size-8 items-center justify-center rounded-lg text-sm font-bold">
                {n.navbar6Brand.slice(0, 1)}
              </span>
              <span className="text-fg text-lg font-semibold tracking-tight">
                {n.navbar6Brand}
              </span>
            </Link>

            <nav
              className="hidden items-center gap-1 md:flex"
              aria-label={n.navbar6PrimaryNavAria}
            >
              <Link
                href="#"
                className="hover:bg-surface-hover rounded-md px-3 py-2 text-sm font-medium"
              >
                {n.navbar6Link1Label}
              </Link>
              <Link
                href="#"
                className="hover:bg-surface-hover rounded-md px-3 py-2 text-sm font-medium"
              >
                {n.navbar6Link2Label}
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              {loggedIn ? (
                <>
                  <div className="relative hidden sm:block">
                    <IconButton
                      icon={<IconBell size={18} aria-hidden="true" />}
                      label={n.navbar6NotificationsAria}
                      variant="ghost"
                    />
                    <span
                      className="bg-error border-bg absolute top-1.5 right-1.5 size-2 rounded-full border-2"
                      aria-hidden="true"
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      aria-label={n.navbar6AccountMenuAria}
                      className="hover:bg-surface-hover rounded-full p-0.5"
                    >
                      <Avatar size="sm" fallback={n.navbar6UserName} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>
                        {n.navbar6UserName}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        {n.navbar6MenuProfile}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        {n.navbar6MenuBilling}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        {n.navbar6MenuSettings}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setLoggedIn(false)}>
                        {n.navbar6MenuSignOut}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLoggedIn(true)}
                  >
                    {n.navbar6SignInLabel}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setLoggedIn(true)}
                  >
                    {n.navbar6CtaLabel}
                  </Button>
                </>
              )}
            </div>
          </header>

          <div className="bg-bg flex flex-col items-start gap-4 px-6 py-14 sm:px-10">
            {loggedIn ? (
              <>
                <h2 className="text-fg max-w-lg text-2xl font-semibold tracking-tight sm:text-3xl">
                  {n.navbar6WelcomeHeading}
                </h2>
                <p className="text-muted max-w-md text-sm leading-relaxed">
                  {n.navbar6WelcomeBody}
                </p>
              </>
            ) : (
              <>
                <h2 className="text-fg max-w-lg text-2xl font-semibold tracking-tight sm:text-3xl">
                  {n.navbar6HeroHeading}
                </h2>
                <p className="text-muted max-w-md text-sm leading-relaxed">
                  {n.navbar6HeroBody}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
