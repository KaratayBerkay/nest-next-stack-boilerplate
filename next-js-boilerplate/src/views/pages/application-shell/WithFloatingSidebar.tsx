"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  IconBell,
  IconBookmark,
  IconCalendar,
  IconChevronDown,
  IconFolder,
  IconHelpCircle,
  IconHome,
  IconLayoutDashboard,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconLogout,
  IconMenu2,
  IconSearch,
  IconSparkles,
  IconUser,
} from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { BadgeCount } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";

interface NavItemDescriptor {
  icon: typeof IconHome;
  labelKey: string;
}

interface NavGroupDescriptor {
  icon: typeof IconHome;
  groupKey: string;
  items: NavItemDescriptor[];
}

const NAV_GROUPS: NavGroupDescriptor[] = [
  {
    icon: IconSparkles,
    groupKey: "s5GroupGeneral",
    items: [
      { icon: IconHome, labelKey: "s5NavDashboard" },
      { icon: IconFolder, labelKey: "s5NavProjects" },
      { icon: IconCalendar, labelKey: "s5NavCalendar" },
    ],
  },
  {
    icon: IconLayoutDashboard,
    groupKey: "s5GroupResources",
    items: [
      { icon: IconHelpCircle, labelKey: "s5NavHelpCenter" },
      { icon: IconBookmark, labelKey: "s5NavChangelog" },
    ],
  },
];

const USER_NAME = "Sarah Miller";
const USER_EMAIL = "sarah@acme.io";
const USER_AVATAR = "https://picsum.photos/seed/shell5-user/64/64";

function handleCollapseToggle(setCollapsed: Dispatch<SetStateAction<boolean>>) {
  setCollapsed((collapsed) => !collapsed);
}

function handleGroupToggle(
  index: number,
  setOpenGroups: Dispatch<SetStateAction<number[]>>,
) {
  setOpenGroups((groups) =>
    groups.includes(index)
      ? groups.filter((group) => group !== index)
      : [...groups, index],
  );
}

function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-brand flex size-8 shrink-0 items-center justify-center rounded-xl",
        className,
      )}
    >
      <IconLayoutDashboard size={18} className="text-brand-fg" />
    </div>
  );
}

function SidebarGroup({
  t,
  group,
  open,
  collapsed,
  onToggle,
}: {
  t: Record<string, string>;
  group: NavGroupDescriptor;
  open: boolean;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const GroupIcon = group.icon;
  const trigger = (
    <button
      type="button"
      aria-label={collapsed ? t[group.groupKey] : undefined}
      aria-expanded={open}
      onClick={onToggle}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        collapsed && "justify-center px-0",
        open ? "text-fg" : "text-muted hover:bg-muted/60",
      )}
    >
      <GroupIcon size={18} className="shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 text-left font-medium">
            {t[group.groupKey]}
          </span>
          <IconChevronDown
            size={16}
            className={cn(
              "shrink-0 transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </>
      )}
    </button>
  );

  return (
    <div className="flex flex-col">
      {collapsed ? (
        <Tooltip side="right">
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent>{t[group.groupKey]}</TooltipContent>
        </Tooltip>
      ) : (
        trigger
      )}
      {!collapsed && open && (
        <div className="flex flex-col gap-0.5 pb-1">
          {group.items.map((item) => {
            const ItemIcon = item.icon;
            return (
              <button
                key={item.labelKey}
                type="button"
                className="text-muted hover:bg-muted/60 flex items-center gap-3 rounded-lg py-2 pr-3 pl-9 text-sm transition-colors"
              >
                <ItemIcon size={18} className="shrink-0" />
                {t[item.labelKey]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SidebarNav({
  t,
  collapsed,
  openGroups,
  setOpenGroups,
}: {
  t: Record<string, string>;
  collapsed: boolean;
  openGroups: number[];
  setOpenGroups: Dispatch<SetStateAction<number[]>>;
}) {
  return (
    <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
      {NAV_GROUPS.map((group, index) => (
        <SidebarGroup
          key={group.groupKey}
          t={t}
          group={group}
          open={openGroups.includes(index)}
          collapsed={collapsed}
          onToggle={() => handleGroupToggle(index, setOpenGroups)}
        />
      ))}
    </div>
  );
}

function UserMenu({
  t,
  collapsed,
}: {
  t: Record<string, string>;
  collapsed: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "hover:bg-muted/60 flex w-full items-center gap-3 rounded-xl p-2 transition-colors",
            collapsed && "justify-center px-0",
          )}
        >
          <Avatar
            size="sm"
            src={USER_AVATAR}
            alt={USER_NAME}
            fallback="SM"
            className="shrink-0"
          />
          {!collapsed && (
            <>
              <span className="flex min-w-0 flex-1 flex-col text-left">
                <span className="truncate text-sm font-medium">
                  {USER_NAME}
                </span>
                <span className="text-muted truncate text-xs">
                  {USER_EMAIL}
                </span>
              </span>
              <IconChevronDown size={16} className="text-muted shrink-0" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52">
        <DropdownMenuItem>
          <IconUser size={16} />
          {t.s5Account}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <IconLogout size={16} />
          {t.s5Logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Sidebar({
  t,
  collapsed,
  setCollapsed,
  openGroups,
  setOpenGroups,
}: {
  t: Record<string, string>;
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
  openGroups: number[];
  setOpenGroups: Dispatch<SetStateAction<number[]>>;
}) {
  return (
    <aside
      className={cn(
        "bg-surface border-border m-4 flex shrink-0 flex-col overflow-hidden rounded-2xl border shadow-[var(--comp-card-shadow)] transition-[width] duration-200",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div
        className={cn(
          "border-border flex h-14 shrink-0 items-center border-b",
          collapsed ? "justify-center px-2" : "gap-3 px-3",
        )}
      >
        {!collapsed && <LogoMark />}
        {!collapsed && (
          <Typography
            variant="bodyLarge"
            className="flex-1 truncate font-semibold"
          >
            {t.s5BrandName}
          </Typography>
        )}
        <Button
          variant="ghost"
          size="icon"
          aria-label={collapsed ? t.s5ExpandSidebar : t.s5CollapseSidebar}
          onClick={() => handleCollapseToggle(setCollapsed)}
        >
          {collapsed ? (
            <IconLayoutSidebarLeftExpand size={18} />
          ) : (
            <IconLayoutSidebarLeftCollapse size={18} />
          )}
        </Button>
      </div>
      <SidebarNav
        t={t}
        collapsed={collapsed}
        openGroups={openGroups}
        setOpenGroups={setOpenGroups}
      />
      <div className={cn("border-border border-t p-2", collapsed && "p-2")}>
        <UserMenu t={t} collapsed={collapsed} />
      </div>
    </aside>
  );
}

function MobileSheetNav({
  t,
  openGroups,
  setOpenGroups,
}: {
  t: Record<string, string>;
  openGroups: number[];
  setOpenGroups: Dispatch<SetStateAction<number[]>>;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t.s5OpenMenu}
          className="md:hidden"
        >
          <IconMenu2 size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <SheetTitle className="sr-only">{t.s5BrandName}</SheetTitle>
        <div className="flex h-full flex-col">
          <div className="border-border flex h-14 shrink-0 items-center gap-3 border-b px-4">
            <LogoMark />
            <Typography variant="bodyLarge" className="font-semibold">
              {t.s5BrandName}
            </Typography>
          </div>
          <SidebarNav
            t={t}
            collapsed={false}
            openGroups={openGroups}
            setOpenGroups={setOpenGroups}
          />
          <div className="border-border border-t p-2">
            <UserMenu t={t} collapsed={false} />
          </div>
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
        <Skeleton className="h-3 w-5/6 rounded-full" />
        <Skeleton className="h-3 w-2/3 rounded-full" />
        <Typography variant="caption" className="text-muted">
          {body}
        </Typography>
      </CardContent>
    </Card>
  );
}

export function WithFloatingSidebar() {
  const t = useMessages("pages").applicationShell;
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<number[]>([0]);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 lg:px-8">
        <div className="bg-surface border-border flex h-[600px] w-full flex-col overflow-hidden rounded-2xl border">
          <div className="flex min-h-0 flex-1">
            <div className="hidden md:flex">
              <Sidebar
                t={t}
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                openGroups={openGroups}
                setOpenGroups={setOpenGroups}
              />
            </div>

            <main className="flex min-w-0 flex-1 flex-col">
              <div className="border-border flex h-14 shrink-0 items-center gap-3 border-b px-4">
                <MobileSheetNav
                  t={t}
                  openGroups={openGroups}
                  setOpenGroups={setOpenGroups}
                />
                <div className="flex min-w-0 flex-col">
                  <Typography variant="caption" className="text-muted">
                    {t.s5Breadcrumb}
                  </Typography>
                  <Typography
                    variant="h3"
                    className="text-base font-medium tracking-tight"
                  >
                    {t.s5PageTitle}
                  </Typography>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <div className="hidden lg:block">
                    <Input
                      type="search"
                      placeholder={t.s5SearchPlaceholder}
                      className="h-9 w-56 rounded-lg"
                      leftIcon={<IconSearch size={16} />}
                    />
                  </div>
                  <button
                    type="button"
                    aria-label={t.s5Notifications}
                    className="text-muted hover:bg-muted/60 flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors"
                  >
                    <BadgeCount count={3} direction="right-top">
                      <IconBell size={18} />
                    </BadgeCount>
                  </button>
                </div>
              </div>

              <ScrollArea className="min-h-0 flex-1">
                <div className="grid gap-4 p-4 md:p-6 lg:grid-cols-[1fr_300px]">
                  <div className="flex flex-col gap-4">
                    <SkeletonCard title={t.s5Card1Title} body={t.s5Card1Body} />
                    <SkeletonCard title={t.s5Card2Title} body={t.s5Card2Body} />
                    <SkeletonCard title={t.s5Card3Title} body={t.s5Card3Body} />
                  </div>
                  <Card className="lg:h-full">
                    <CardContent className="flex flex-col gap-3 p-5">
                      <Typography variant="body" className="font-medium">
                        {t.s5AsideTitle}
                      </Typography>
                      <Typography variant="bodySmall" className="text-muted">
                        {t.s5AsideParagraph1}
                      </Typography>
                      <Typography variant="bodySmall" className="text-muted">
                        {t.s5AsideParagraph2}
                      </Typography>
                      <Typography variant="bodySmall" className="text-muted">
                        {t.s5AsideParagraph3}
                      </Typography>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </main>
          </div>
        </div>
      </div>
    </section>
  );
}
