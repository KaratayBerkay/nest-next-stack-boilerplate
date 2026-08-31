"use client";

import { useState } from "react";
import {
  IconCalendar,
  IconChecklist,
  IconChevronDown,
  IconCreditCard,
  IconFiles,
  IconHome,
  IconInbox,
  IconLogout,
  IconUserCircle,
} from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Progress } from "@/components/ui/Progress";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSidebarMessages } from "@/types/pages/sidebar/SidebarMessages-types";

interface NavItem {
  id: string;
  icon: typeof IconHome;
  labelKey: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "home", icon: IconHome, labelKey: "sidebar3NavHome" },
  { id: "inbox", icon: IconInbox, labelKey: "sidebar3NavInbox" },
  { id: "tasks", icon: IconChecklist, labelKey: "sidebar3NavTasks" },
  { id: "calendar", icon: IconCalendar, labelKey: "sidebar3NavCalendar" },
  { id: "files", icon: IconFiles, labelKey: "sidebar3NavFiles" },
];

const WORKSPACE_KEYS = [
  "sidebar3Workspace1",
  "sidebar3Workspace2",
  "sidebar3Workspace3",
] as const;

export function WorkspaceUserFooterSidebar() {
  const t = useMessages("pages") as unknown as PagesWithSidebarMessages;
  const sb = t.sidebar;
  const [workspace, setWorkspace] = useState<(typeof WORKSPACE_KEYS)[number]>(
    WORKSPACE_KEYS[0],
  );
  const [activeId, setActiveId] = useState("home");

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-5xl px-4 lg:px-8">
        <div className="bg-surface border-border flex h-[560px] w-full overflow-hidden rounded-2xl border">
          <aside className="border-border bg-surface flex w-64 shrink-0 flex-col border-r">
            <div className="border-border border-b p-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="hover:bg-surface-hover flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-medium transition-colors"
                  >
                    <span className="bg-brand text-brand-fg flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-bold">
                      {sb[workspace].charAt(0)}
                    </span>
                    <span className="flex-1 truncate">{sb[workspace]}</span>
                    <IconChevronDown size={16} className="text-muted shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-52">
                  {WORKSPACE_KEYS.map((key) => (
                    <DropdownMenuItem key={key} onClick={() => setWorkspace(key)}>
                      <span className={cn(key === workspace && "font-medium")}>
                        {sb[key]}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
              {NAV_ITEMS.map((item) => {
                const ItemIcon = item.icon;
                const isActive = item.id === activeId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setActiveId(item.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-surface-hover text-fg font-medium"
                        : "text-muted hover:bg-surface-hover",
                    )}
                  >
                    <ItemIcon size={18} />
                    {sb[item.labelKey]}
                  </button>
                );
              })}
            </nav>

            <div className="border-border border-t p-3">
              <div className="mb-3 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted text-xs">
                    {sb.sidebar3StorageLabel}
                  </span>
                  <span className="text-muted text-xs">68%</span>
                </div>
                <Progress
                  value={68}
                  size="sm"
                  aria-label={sb.sidebar3StorageAriaTemplate.replace(
                    "{percent}",
                    "68",
                  )}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="hover:bg-surface-hover flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors"
                  >
                    <Avatar
                      size="sm"
                      src="/img/placeholders/ph-1x1-2.webp"
                      alt={sb.sidebar3UserName}
                      fallback="JD"
                      className="shrink-0"
                    />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium">
                        {sb.sidebar3UserName}
                      </span>
                      <span className="text-muted truncate text-xs">
                        {sb.sidebar3UserEmail}
                      </span>
                    </span>
                    <Badge variant="soft" size="sm" className="shrink-0">
                      {sb.sidebar3PlanBadge}
                    </Badge>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuItem>
                    <IconUserCircle size={16} />
                    {sb.sidebar3MenuAccount}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <IconCreditCard size={16} />
                    {sb.sidebar3MenuBilling}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <IconLogout size={16} />
                    {sb.sidebar3MenuLogout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </aside>

          <main className="min-w-0 flex-1 overflow-y-auto p-6 lg:p-8">
            <Typography variant="h3" className="text-2xl font-medium tracking-tight">
              {sb.sidebar3Heading}
            </Typography>
            <Typography variant="body" className="text-muted mt-2">
              {sb.sidebar3Paragraph}
            </Typography>
          </main>
        </div>
      </div>
    </section>
  );
}
