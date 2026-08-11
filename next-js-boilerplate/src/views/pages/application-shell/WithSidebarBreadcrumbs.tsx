"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  IconBell,
  IconBox,
  IconChartBar,
  IconChevronRight,
  IconFolder,
  IconLayoutDashboard,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconLogout,
  IconMenu2,
  IconSettings,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { BadgeCount } from "@/components/ui/Badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/Breadcrumb";
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
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Separator } from "@/components/ui/Separator";
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

type NavLabelKey =
  | "s1NavOverview"
  | "s1NavProjects"
  | "s1NavAnalytics"
  | "s1NavMembers"
  | "s1NavSettings";

type SubLabelKey = "s1NavGeneral" | "s1NavNotifications" | "s1NavProfile";

interface NavItem {
  icon: typeof IconLayoutDashboard;
  labelKey: NavLabelKey;
  sub?: { labelKey: SubLabelKey }[];
}

interface NavGroup {
  labelKey: "s1GroupOverview" | "s1GroupWorkspace";
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    labelKey: "s1GroupOverview",
    items: [
      { icon: IconLayoutDashboard, labelKey: "s1NavOverview" },
      { icon: IconFolder, labelKey: "s1NavProjects" },
      { icon: IconChartBar, labelKey: "s1NavAnalytics" },
    ],
  },
  {
    labelKey: "s1GroupWorkspace",
    items: [
      { icon: IconUsers, labelKey: "s1NavMembers" },
      {
        icon: IconSettings,
        labelKey: "s1NavSettings",
        sub: [
          { labelKey: "s1NavGeneral" },
          { labelKey: "s1NavNotifications" },
          { labelKey: "s1NavProfile" },
        ],
      },
    ],
  },
];

const CONTENT_CARDS = [
  { titleKey: "s1Card1Title", bodyKey: "s1Card1Body" },
  { titleKey: "s1Card2Title", bodyKey: "s1Card2Body" },
  { titleKey: "s1Card3Title", bodyKey: "s1Card3Body" },
] as const;

const USER = { name: "Sarah Chen", emailKey: "s1UserEmail" } as const;

function handleSubToggle(
  labelKey: string,
  setExpanded: Dispatch<SetStateAction<Set<string>>>,
) {
  setExpanded((prev) => {
    const next = new Set(prev);
    if (next.has(labelKey)) {
      next.delete(labelKey);
    } else {
      next.add(labelKey);
    }
    return next;
  });
}

function handleCollapseToggle(setCollapsed: Dispatch<SetStateAction<boolean>>) {
  setCollapsed((prev) => !prev);
}

function BrandMark() {
  return (
    <div className="bg-brand flex size-8 shrink-0 items-center justify-center rounded-lg">
      <IconBox size={18} className="text-brand-fg" />
    </div>
  );
}

function NavItemButton({
  item,
  collapsed,
  isOpen,
  onToggleSub,
}: {
  item: NavItem;
  collapsed: boolean;
  isOpen: boolean;
  onToggleSub: () => void;
}) {
  const t = useMessages("pages").applicationShell;
  const ItemIcon = item.icon;

  const button = (
    <button
      type="button"
      onClick={item.sub ? onToggleSub : undefined}
      aria-expanded={item.sub ? isOpen : undefined}
      className={cn(
        "text-muted hover:text-fg hover:bg-surface-hover flex h-9 w-full items-center gap-3 rounded-lg px-2 text-sm transition-colors",
        collapsed && "justify-center px-0",
      )}
    >
      <ItemIcon size={18} className="shrink-0" />
      {!collapsed && (
        <span className="min-w-0 flex-1 truncate text-left">
          {t[item.labelKey]}
        </span>
      )}
      {!collapsed && item.sub && (
        <IconChevronRight
          size={16}
          className={cn("shrink-0 transition-transform", isOpen && "rotate-90")}
        />
      )}
    </button>
  );

  if (!collapsed) return button;

  return (
    <Tooltip side="right">
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>{t[item.labelKey]}</TooltipContent>
    </Tooltip>
  );
}

function SidebarNav({ collapsed }: { collapsed: boolean }) {
  const t = useMessages("pages").applicationShell;
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(["s1NavSettings"]),
  );

  return (
    <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
      <div className="flex flex-col gap-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.labelKey} className="flex flex-col gap-1">
            {!collapsed && (
              <Typography variant="overline" className="px-2 pb-1">
                {t[group.labelKey]}
              </Typography>
            )}
            {group.items.map((item) => {
              const isOpen = expanded.has(item.labelKey);
              return (
                <div key={item.labelKey} className="flex flex-col gap-1">
                  <NavItemButton
                    item={item}
                    collapsed={collapsed}
                    isOpen={isOpen}
                    onToggleSub={() =>
                      handleSubToggle(item.labelKey, setExpanded)
                    }
                  />
                  {!collapsed && isOpen && item.sub && (
                    <div className="border-border ml-3 flex flex-col gap-1 border-l pl-3">
                      {item.sub.map((sub) => (
                        <button
                          key={sub.labelKey}
                          type="button"
                          className="text-muted hover:text-fg hover:bg-surface-hover h-8 w-full rounded-lg px-2 text-left text-sm transition-colors"
                        >
                          {t[sub.labelKey]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </nav>
  );
}

function UserMenu({ collapsed }: { collapsed: boolean }) {
  const t = useMessages("pages").applicationShell;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full px-2",
            collapsed ? "justify-center" : "justify-start gap-3",
          )}
        >
          <Avatar size="sm" variant="brand" fallback={USER.name} />
          {!collapsed && (
            <span className="flex min-w-0 flex-1 flex-col items-start">
              <span className="text-sm font-medium">{USER.name}</span>
              <span className="text-muted max-w-full truncate text-xs">
                {t[USER.emailKey]}
              </span>
            </span>
          )}
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
          {t.s1MenuAccount}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2">
          <IconLogout size={16} />
          {t.s1MenuSignOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function WithSidebarBreadcrumbs() {
  const t = useMessages("pages").applicationShell;
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 lg:px-8">
        <div className="border-border bg-surface flex h-[600px] w-full flex-col overflow-hidden rounded-2xl border">
          <div className="flex min-h-0 flex-1">
            <aside
              className={cn(
                "border-border hidden w-64 min-w-0 flex-col border-r transition-[width] duration-200 md:flex",
                collapsed && "w-16",
              )}
            >
              <div
                className={cn(
                  "border-border flex h-14 shrink-0 items-center border-b",
                  collapsed ? "justify-center px-2" : "justify-between px-4",
                )}
              >
                {!collapsed && (
                  <div className="flex min-w-0 items-center gap-2">
                    <BrandMark />
                    <Typography
                      variant="bodyLarge"
                      className="truncate font-semibold"
                    >
                      {t.s1LogoName}
                    </Typography>
                  </div>
                )}
                <Tooltip side="right">
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={
                        collapsed ? t.s1TooltipExpand : t.s1TooltipCollapse
                      }
                      onClick={() => handleCollapseToggle(setCollapsed)}
                    >
                      {collapsed ? (
                        <IconLayoutSidebarLeftExpand size={20} />
                      ) : (
                        <IconLayoutSidebarLeftCollapse size={20} />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {collapsed ? t.s1TooltipExpand : t.s1TooltipCollapse}
                  </TooltipContent>
                </Tooltip>
              </div>

              <SidebarNav collapsed={collapsed} />

              <div className="border-border shrink-0 border-t p-2">
                <UserMenu collapsed={collapsed} />
              </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="border-border flex h-14 shrink-0 items-center gap-2 border-b px-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      aria-label={t.s1SheetTitle}
                    >
                      <IconMenu2 size={20} />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="flex flex-col">
                    <SheetHeader className="text-left">
                      <SheetTitle className="flex items-center gap-2">
                        <BrandMark />
                        <span className="text-base">{t.s1LogoName}</span>
                      </SheetTitle>
                    </SheetHeader>
                    <SidebarNav collapsed={false} />
                  </SheetContent>
                </Sheet>

                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:inline-flex"
                  aria-label={
                    collapsed ? t.s1TooltipExpand : t.s1TooltipCollapse
                  }
                  onClick={() => handleCollapseToggle(setCollapsed)}
                >
                  {collapsed ? (
                    <IconLayoutSidebarLeftExpand size={20} />
                  ) : (
                    <IconLayoutSidebarLeftCollapse size={20} />
                  )}
                </Button>

                <Separator orientation="vertical" />

                <Breadcrumb className="hidden sm:block">
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="#">{t.s1CrumbPages}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink href="#">
                        {t.s1CrumbOverview}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{t.s1CrumbProjects}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>

                <Tooltip side="bottom">
                  <TooltipTrigger asChild>
                    <BadgeCount
                      count={3}
                      rule="negative"
                      className="text-muted ml-auto"
                    >
                      <IconBell size={20} />
                    </BadgeCount>
                  </TooltipTrigger>
                  <TooltipContent>{t.s1BellTooltip}</TooltipContent>
                </Tooltip>
              </div>

              <ScrollArea className="min-h-0 flex-1">
                <div className="flex flex-col gap-6 p-6">
                  <div className="flex flex-col gap-1">
                    <Typography
                      variant="h2"
                      className="text-2xl font-medium tracking-tight"
                    >
                      {t.s1Heading}
                    </Typography>
                    <Typography variant="body" className="text-muted">
                      {t.s1Description}
                    </Typography>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {CONTENT_CARDS.map((card) => (
                      <Card
                        key={card.titleKey}
                        className="flex flex-col gap-4 p-5"
                      >
                        <div className="flex items-center gap-3">
                          <Skeleton className="size-10 rounded-full" />
                          <div className="flex flex-col gap-2">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                        <Typography variant="bodyLarge" className="font-medium">
                          {t[card.titleKey]}
                        </Typography>
                        <Typography variant="body" className="text-muted">
                          {t[card.bodyKey]}
                        </Typography>
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </Card>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
