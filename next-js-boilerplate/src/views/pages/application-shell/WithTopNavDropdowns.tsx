"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  IconBell,
  IconChevronDown,
  IconMenu2,
  IconSearch,
} from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Input } from "@/components/ui/Input";
import { ScrollArea } from "@/components/ui/ScrollArea";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/Sheet";
import { Skeleton } from "@/components/ui/Skeleton";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";

interface NavGroupDescriptor {
  groupKey: string;
  itemKeys: readonly string[];
}

const NAV_GROUPS: NavGroupDescriptor[] = [
  {
    groupKey: "s13GroupOverview",
    itemKeys: ["s13ItemOverview", "s13ItemActivity"],
  },
  {
    groupKey: "s13GroupProjects",
    itemKeys: ["s13ItemProjects", "s13ItemBoards", "s13ItemArchive"],
  },
  { groupKey: "s13GroupTeam", itemKeys: ["s13ItemMembers", "s13ItemRoles"] },
  {
    groupKey: "s13GroupWorkspace",
    itemKeys: ["s13ItemIntegrations", "s13ItemBilling"],
  },
];

const MOBILE_NAV_GROUPS: NavGroupDescriptor[] = [
  {
    groupKey: "s13GroupOverview",
    itemKeys: ["s13ItemOverview", "s13ItemActivity"],
  },
  {
    groupKey: "s13GroupProjects",
    itemKeys: ["s13ItemProjects", "s13ItemBoards", "s13ItemArchive"],
  },
  { groupKey: "s13GroupTeam", itemKeys: ["s13ItemMembers", "s13ItemRoles"] },
  {
    groupKey: "s13GroupWorkspace",
    itemKeys: ["s13ItemIntegrations", "s13ItemBilling"],
  },
];

const BRAND_NAME = "Northstar";
const USER_NAME = "Jordan Blake";
const USER_EMAIL = "jordan@northstar.io";
const ORG_NAME = "Northstar Labs";

function handleGroupSelect(
  index: number,
  setActive: Dispatch<SetStateAction<number>>,
) {
  setActive(index);
}

function SecondaryNav({
  t,
  active,
  setActive,
}: {
  t: Record<string, string>;
  active: number;
  setActive: Dispatch<SetStateAction<number>>;
}) {
  return (
    <div className="border-border bg-muted/30 flex items-center gap-1 border-b px-4">
      {NAV_GROUPS.map((group, index) => (
        <DropdownMenu key={group.groupKey}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              onClick={() => handleGroupSelect(index, setActive)}
              className={cn(
                "flex items-center gap-1 rounded-lg px-3 py-2 text-sm transition-colors",
                index === active
                  ? "bg-muted font-medium"
                  : "text-muted hover:bg-muted/60",
              )}
            >
              {t[group.groupKey]}
              <IconChevronDown size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {group.itemKeys.map((itemKey) => (
              <DropdownMenuItem key={itemKey}>{t[itemKey]}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </div>
  );
}

function MobileSheetNav({
  t,
  active,
  setActive,
}: {
  t: Record<string, string>;
  active: number;
  setActive: Dispatch<SetStateAction<number>>;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t.s13Menu}
          className="md:hidden"
        >
          <IconMenu2 size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <SheetTitle className="sr-only">{BRAND_NAME}</SheetTitle>
        <div className="flex h-full flex-col p-4">
          <div className="flex items-center gap-2 px-1 pb-4">
            <div className="bg-brand flex size-7 items-center justify-center rounded-lg">
              <span className="text-brand-fg text-xs font-bold">N</span>
            </div>
            <Typography variant="bodyLarge" className="font-semibold">
              {BRAND_NAME}
            </Typography>
          </div>
          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-0.5">
              {MOBILE_NAV_GROUPS.map((group, index) => (
                <div key={group.groupKey} className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => handleGroupSelect(index, setActive)}
                    className={cn(
                      "text-muted hover:bg-muted/60 flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                      index === active && "bg-muted font-medium",
                    )}
                  >
                    {t[group.groupKey]}
                    <IconChevronDown size={14} />
                  </button>
                  {group.itemKeys.map((itemKey) => (
                    <button
                      key={itemKey}
                      type="button"
                      className="text-muted hover:bg-muted/60 rounded-lg py-2 pr-3 pl-7 text-left text-sm transition-colors"
                    >
                      {t[itemKey]}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SkeletonCard({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-5">
        <Typography variant="body" className="font-medium">
          {title}
        </Typography>
        <Skeleton className="h-3 w-full rounded-full" />
        <Skeleton className="h-3 w-2/3 rounded-full" />
        <Skeleton className="h-3 w-1/3 rounded-full" />
        <Typography variant="caption" className="text-muted">
          {body}
        </Typography>
      </CardContent>
    </Card>
  );
}

export function WithTopNavDropdowns() {
  const t = useMessages("pages").applicationShell;
  const [activeGroup, setActiveGroup] = useState(0);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 lg:px-8">
        <div className="bg-surface border-border flex h-[600px] w-full flex-col overflow-hidden rounded-2xl border">
          <header className="border-border shrink-0 border-b">
            <div className="grid h-14 grid-cols-[auto_1fr_auto] items-center gap-3 px-4">
              <div className="flex items-center gap-1">
                <MobileSheetNav
                  t={t}
                  active={activeGroup}
                  setActive={setActiveGroup}
                />
                <button type="button" className="flex items-center gap-2">
                  <div className="bg-brand flex size-7 items-center justify-center rounded-lg">
                    <span className="text-brand-fg text-xs font-bold">N</span>
                  </div>
                  <Typography
                    variant="bodyLarge"
                    className="hidden font-semibold sm:block"
                  >
                    {BRAND_NAME}
                  </Typography>
                </button>
              </div>

              <div className="hidden justify-center md:flex">
                <div className="relative w-full max-w-sm">
                  <Input
                    type="search"
                    placeholder={t.s13SearchPlaceholder}
                    className="h-9 rounded-lg"
                    leftIcon={<IconSearch size={16} />}
                  />
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t.s13Notifications}
                  className="text-muted"
                >
                  <IconBell size={20} />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden items-center gap-2 sm:flex"
                    >
                      <span className="text-muted">{ORG_NAME}</span>
                      <IconChevronDown size={14} className="text-muted" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>{ORG_NAME}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>{t.s13ItemBilling}</DropdownMenuItem>
                    <DropdownMenuItem>{t.s13ItemIntegrations}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="hover:bg-muted/60 flex items-center gap-2 rounded-full p-1 transition-colors"
                    >
                      <Avatar
                        size="sm"
                        src="https://picsum.photos/seed/shell13-user/64/64"
                        alt={USER_NAME}
                        fallback="JB"
                      />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-52">
                    <DropdownMenuLabel>
                      <Typography variant="body" className="font-medium">
                        {USER_NAME}
                      </Typography>
                      <Typography variant="caption" className="text-muted">
                        {USER_EMAIL}
                      </Typography>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>{t.s13Account}</DropdownMenuItem>
                    <DropdownMenuItem>{t.s13Logout}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="px-4 pb-3 md:hidden">
              <div className="relative">
                <Input
                  type="search"
                  placeholder={t.s13SearchPlaceholder}
                  className="h-9 rounded-lg"
                  leftIcon={<IconSearch size={16} />}
                />
              </div>
            </div>

            <div className="hidden md:block">
              <SecondaryNav
                t={t}
                active={activeGroup}
                setActive={setActiveGroup}
              />
            </div>
          </header>

          <main className="min-h-0 flex-1">
            <ScrollArea className="h-full">
              <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-6 py-8">
                <div className="flex flex-col gap-2">
                  <Typography
                    variant="h3"
                    className="text-2xl font-medium tracking-tighter"
                  >
                    {t.s13Heading}
                  </Typography>
                  <Typography variant="body" className="text-muted">
                    {t.s13Paragraph}
                  </Typography>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <SkeletonCard title={t.s13Card1Title} body={t.s13Card1Body} />
                  <SkeletonCard title={t.s13Card2Title} body={t.s13Card2Body} />
                </div>
              </div>
            </ScrollArea>
          </main>
        </div>
      </div>
    </section>
  );
}
