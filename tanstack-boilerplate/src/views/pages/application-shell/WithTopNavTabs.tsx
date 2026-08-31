"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  IconBell,
  IconBox,
  IconLogout,
  IconMenu2,
  IconSearch,
  IconUser,
} from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Input } from "@/components/ui/Input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/Sheet";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";

type TabLabelKey =
  "s4TabOverview" | "s4TabProjects" | "s4TabAnalytics" | "s4TabSettings";

interface TabDescriptor {
  labelKey: TabLabelKey;
}

const TABS: TabDescriptor[] = [
  { labelKey: "s4TabOverview" },
  { labelKey: "s4TabProjects" },
  { labelKey: "s4TabAnalytics" },
  { labelKey: "s4TabSettings" },
];

const CARD_ITEMS = [
  { titleKey: "s4Card1Title", bodyKey: "s4Card1Body" },
  { titleKey: "s4Card2Title", bodyKey: "s4Card2Body" },
  { titleKey: "s4Card3Title", bodyKey: "s4Card3Body" },
] as const;

const USER = { name: "Sarah Chen", emailKey: "s4UserEmail" } as const;

function handleTabSelect(
  index: number,
  setActive: Dispatch<SetStateAction<number>>,
) {
  setActive(index);
}

function BrandMark() {
  return (
    <div className="bg-brand flex size-8 shrink-0 items-center justify-center rounded-lg">
      <IconBox size={18} className="text-brand-fg" />
    </div>
  );
}

function TabBar({
  active,
  onSelect,
}: {
  active: number;
  onSelect: (index: number) => void;
}) {
  const t = useMessages("pages").applicationShell;

  return (
    <div className="flex flex-col gap-1 md:flex-row md:items-center">
      {TABS.map((tab, index) => (
        <Button
          key={tab.labelKey}
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onSelect(index)}
          className={cn(
            "justify-start md:justify-center",
            index === active ? "bg-surface-hover text-fg" : "text-muted",
          )}
        >
          {t[tab.labelKey]}
        </Button>
      ))}
    </div>
  );
}

function UserMenu() {
  const t = useMessages("pages").applicationShell;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-3 px-2">
          <Avatar size="md" variant="brand" fallback={USER.name} />
          <span className="hidden flex-col items-start md:flex">
            <span className="text-sm font-medium">{USER.name}</span>
            <span className="text-muted text-xs">{t[USER.emailKey]}</span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-fg text-sm font-medium">{USER.name}</span>
          <span className="text-muted text-xs">{t[USER.emailKey]}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2">
          <IconUser size={16} />
          {t.s4MenuAccount}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2">
          <IconLogout size={16} />
          {t.s4MenuSignOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function WithTopNavTabs() {
  const t = useMessages("pages").applicationShell;
  const [active, setActive] = useState(0);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 lg:px-8">
        <div className="border-border bg-surface flex h-[600px] w-full flex-col overflow-hidden rounded-2xl border">
          <div className="min-h-0 flex-1 overflow-y-auto">
            <header className="bg-surface border-border sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b px-4">
              <div className="flex items-center gap-2">
                <BrandMark />
                <Typography
                  variant="bodyLarge"
                  className="hidden font-semibold sm:block"
                >
                  {t.s4LogoName}
                </Typography>
              </div>

              <div className="hidden items-center gap-1 md:flex">
                <TabBar
                  active={active}
                  onSelect={(index) => handleTabSelect(index, setActive)}
                />
              </div>

              <div className="ml-auto flex items-center gap-2">
                <Input
                  leftIcon={<IconSearch size={16} />}
                  placeholder={t.s4SearchPlaceholder}
                  className="hidden w-56 md:block"
                />

                <Tooltip side="bottom">
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t.s4BellTooltip}
                    >
                      <IconBell size={20} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t.s4BellTooltip}</TooltipContent>
                </Tooltip>

                <div className="hidden md:block">
                  <UserMenu />
                </div>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      aria-label={t.s4SheetTitle}
                    >
                      <IconMenu2 size={20} />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="flex flex-col">
                    <SheetHeader className="text-left">
                      <SheetTitle className="flex items-center gap-2">
                        <BrandMark />
                        <span className="text-base">{t.s4LogoName}</span>
                      </SheetTitle>
                    </SheetHeader>
                    <TabBar
                      active={active}
                      onSelect={(index) => handleTabSelect(index, setActive)}
                    />
                  </SheetContent>
                </Sheet>
              </div>
            </header>

            <main className="flex flex-col gap-6 p-6">
              <div className="flex flex-col gap-1">
                <Typography
                  variant="h2"
                  className="text-2xl font-medium tracking-tight"
                >
                  {t.s4Heading}
                </Typography>
                <Typography variant="body" className="text-muted">
                  {t.s4Description}
                </Typography>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {CARD_ITEMS.map((card) => (
                  <Card key={card.titleKey} className="flex flex-col gap-4 p-5">
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Typography
                      variant="h3"
                      className="text-lg font-medium tracking-tight"
                    >
                      {t[card.titleKey]}
                    </Typography>
                    <Typography variant="body" className="text-muted">
                      {t[card.bodyKey]}
                    </Typography>
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </Card>
                ))}
              </div>
            </main>
          </div>
        </div>
      </div>
    </section>
  );
}
