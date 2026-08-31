"use client";

import { useState } from "react";
import Link from "next/link";
import { IconBolt, IconFileText, IconSearch } from "@tabler/icons-react";
import { Button, IconButton } from "@/components/ui/Button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/Command";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { Kbd } from "@/components/ui/Kbd";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithNavbarMessages } from "@/types/pages/navbar/NavbarMessages-types";

interface PaletteEntry {
  id: string;
  labelKey: string;
}

const PAGES: PaletteEntry[] = [
  { id: "home", labelKey: "navbar5Page1Label" },
  { id: "docs", labelKey: "navbar5Page2Label" },
  { id: "pricing", labelKey: "navbar5Page3Label" },
  { id: "changelog", labelKey: "navbar5Page4Label" },
];

const ACTIONS: PaletteEntry[] = [
  { id: "new-project", labelKey: "navbar5Action1Label" },
  { id: "invite-teammate", labelKey: "navbar5Action2Label" },
  { id: "open-settings", labelKey: "navbar5Action3Label" },
];

export function CommandPaletteNavbar() {
  const t = useMessages("pages") as unknown as PagesWithNavbarMessages;
  const n = t.navbar;
  const [open, setOpen] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="border-border overflow-hidden rounded-2xl border">
          <header className="border-border bg-bg flex items-center gap-3 border-b px-5 py-4 sm:px-6">
            <Link href="#" className="flex shrink-0 items-center gap-2">
              <span className="bg-brand text-brand-fg flex size-8 items-center justify-center rounded-lg text-sm font-bold">
                {n.navbar5Brand.slice(0, 1)}
              </span>
              <span className="text-fg text-lg font-semibold tracking-tight">
                {n.navbar5Brand}
              </span>
            </Link>

            <nav
              className="hidden items-center gap-1 md:flex"
              aria-label={n.navbar5PrimaryNavAria}
            >
              <Link
                href="#"
                className="hover:bg-surface-hover rounded-md px-3 py-2 text-sm font-medium"
              >
                {n.navbar5Link1Label}
              </Link>
              <Link
                href="#"
                className="hover:bg-surface-hover rounded-md px-3 py-2 text-sm font-medium"
              >
                {n.navbar5Link2Label}
              </Link>
            </nav>

            <div className="ml-auto flex items-center gap-2">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger
                  variant="outline"
                  size="sm"
                  className="hidden items-center gap-2 sm:inline-flex"
                >
                  <IconSearch size={14} aria-hidden="true" />
                  <span className="text-muted">
                    {n.navbar5SearchTriggerLabel}
                  </span>
                  <Kbd>⌘K</Kbd>
                </DialogTrigger>
                <IconButton
                  icon={<IconSearch size={18} aria-hidden="true" />}
                  label={n.navbar5MobileSearchAria}
                  variant="ghost"
                  className="sm:hidden"
                  onClick={() => setOpen(true)}
                />
                <DialogContent size="md" closeLabel={n.navbar5CloseAria}>
                  <DialogTitle className="sr-only">
                    {n.navbar5DialogTitle}
                  </DialogTitle>
                  <Command>
                    <CommandInput
                      placeholder={n.navbar5SearchPlaceholder}
                    />
                    <CommandList>
                      <CommandEmpty>{n.navbar5EmptyLabel}</CommandEmpty>
                      <CommandGroup heading={n.navbar5PagesGroupLabel}>
                        {PAGES.map((page) => (
                          <CommandItem
                            key={page.id}
                            value={n[page.labelKey]}
                            onSelect={() => setOpen(false)}
                          >
                            <IconFileText
                              size={16}
                              aria-hidden="true"
                              className="text-muted"
                            />
                            {n[page.labelKey]}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      <CommandGroup heading={n.navbar5ActionsGroupLabel}>
                        {ACTIONS.map((action) => (
                          <CommandItem
                            key={action.id}
                            value={n[action.labelKey]}
                            onSelect={() => setOpen(false)}
                          >
                            <IconBolt
                              size={16}
                              aria-hidden="true"
                              className="text-muted"
                            />
                            {n[action.labelKey]}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </DialogContent>
              </Dialog>
              <Button
                variant="primary"
                size="sm"
                className="hidden md:inline-flex"
              >
                {n.navbar5CtaLabel}
              </Button>
            </div>
          </header>

          <div className="bg-bg flex flex-col items-start gap-4 px-6 py-14 sm:px-10">
            <h2 className="text-fg max-w-lg text-2xl font-semibold tracking-tight sm:text-3xl">
              {n.navbar5HeroHeading}
            </h2>
            <p className="text-muted max-w-md text-sm leading-relaxed">
              {n.navbar5HeroBody}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
