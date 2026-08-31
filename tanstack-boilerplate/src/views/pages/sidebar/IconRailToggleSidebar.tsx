"use client";

import { useState } from "react";
import {
  IconChartBar,
  IconFolder,
  IconHome,
  IconInbox,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSidebarMessages } from "@/types/pages/sidebar/SidebarMessages-types";

interface NavItem {
  id: string;
  icon: typeof IconHome;
  labelKey: string;
  count?: number;
}

const NAV_ITEMS: NavItem[] = [
  { id: "overview", icon: IconHome, labelKey: "sidebar1NavOverview" },
  { id: "inbox", icon: IconInbox, labelKey: "sidebar1NavInbox", count: 4 },
  { id: "projects", icon: IconFolder, labelKey: "sidebar1NavProjects" },
  { id: "team", icon: IconUsers, labelKey: "sidebar1NavTeam" },
  { id: "reports", icon: IconChartBar, labelKey: "sidebar1NavReports" },
  { id: "settings", icon: IconSettings, labelKey: "sidebar1NavSettings" },
];

export function IconRailToggleSidebar() {
  const t = useMessages("pages") as unknown as PagesWithSidebarMessages;
  const sb = t.sidebar;
  const [collapsed, setCollapsed] = useState(false);
  const [activeId, setActiveId] = useState("overview");

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-5xl px-4 lg:px-8">
        <div className="bg-surface border-border flex h-[560px] w-full overflow-hidden rounded-2xl border">
          <aside
            className={cn(
              "border-border bg-surface flex shrink-0 flex-col border-r transition-[width] duration-200",
              collapsed ? "w-16" : "w-60",
            )}
          >
            <div
              className={cn(
                "border-border flex h-14 shrink-0 items-center border-b",
                collapsed ? "justify-center px-2" : "gap-2 px-3",
              )}
            >
              <div className="bg-brand flex size-8 shrink-0 items-center justify-center rounded-lg">
                <span className="text-brand-fg text-sm font-bold">N</span>
              </div>
              {!collapsed && (
                <Typography
                  variant="bodyLarge"
                  className="flex-1 truncate font-semibold"
                >
                  {sb.sidebar1BrandName}
                </Typography>
              )}
            </div>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
              {NAV_ITEMS.map((item) => {
                const ItemIcon = item.icon;
                const isActive = item.id === activeId;
                const button = (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setActiveId(item.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      collapsed && "justify-center px-0",
                      isActive
                        ? "bg-surface-hover text-fg font-medium"
                        : "text-muted hover:bg-surface-hover",
                    )}
                  >
                    <span className="relative flex shrink-0 items-center justify-center">
                      <ItemIcon size={18} />
                      {collapsed && item.count ? (
                        <span className="bg-brand absolute -top-1.5 -right-1.5 size-2 rounded-full" />
                      ) : null}
                    </span>
                    {!collapsed && (
                      <span className="flex-1 text-left">
                        {sb[item.labelKey]}
                      </span>
                    )}
                    {!collapsed && item.count ? (
                      <Badge variant="soft" size="sm">
                        {item.count}
                      </Badge>
                    ) : null}
                  </button>
                );
                return collapsed ? (
                  <Tooltip key={item.id} side="right">
                    <TooltipTrigger asChild>{button}</TooltipTrigger>
                    <TooltipContent>{sb[item.labelKey]}</TooltipContent>
                  </Tooltip>
                ) : (
                  button
                );
              })}
            </nav>
            <div className="border-border border-t p-2">
              <button
                type="button"
                aria-label={
                  collapsed ? sb.sidebar1ExpandLabel : sb.sidebar1CollapseLabel
                }
                onClick={() => setCollapsed((value) => !value)}
                className={cn(
                  "text-muted hover:bg-surface-hover flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  collapsed && "justify-center px-0",
                )}
              >
                {collapsed ? (
                  <IconLayoutSidebarLeftExpand size={18} />
                ) : (
                  <IconLayoutSidebarLeftCollapse size={18} />
                )}
                {!collapsed && <span>{sb.sidebar1CollapseLabel}</span>}
              </button>
            </div>
          </aside>

          <main className="min-w-0 flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="flex flex-col gap-2">
              <Typography
                variant="h3"
                className="text-2xl font-medium tracking-tight"
              >
                {sb.sidebar1Heading}
              </Typography>
              <Typography variant="body" className="text-muted">
                {sb.sidebar1Paragraph}
              </Typography>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                {
                  labelKey: "sidebar1Stat1Label",
                  valueKey: "sidebar1Stat1Value",
                },
                {
                  labelKey: "sidebar1Stat2Label",
                  valueKey: "sidebar1Stat2Value",
                },
                {
                  labelKey: "sidebar1Stat3Label",
                  valueKey: "sidebar1Stat3Value",
                },
              ].map((stat) => (
                <div
                  key={stat.labelKey}
                  className="border-border bg-bg rounded-xl border p-4"
                >
                  <p className="text-muted text-xs">{sb[stat.labelKey]}</p>
                  <p className="text-fg mt-1 text-xl font-semibold">
                    {sb[stat.valueKey]}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-muted mt-6 text-sm italic">
              {sb.sidebar1HintText}
            </p>
          </main>
        </div>
      </div>
    </section>
  );
}
