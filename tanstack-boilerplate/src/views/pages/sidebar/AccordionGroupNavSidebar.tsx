"use client";

import { useState } from "react";
import {
  IconCalendar,
  IconChevronDown,
  IconCreditCard,
  IconFileText,
  IconHome,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/Collapsible";
import { Separator } from "@/components/ui/Separator";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSidebarMessages } from "@/types/pages/sidebar/SidebarMessages-types";

interface GroupItem {
  id: string;
  icon: typeof IconHome;
  labelKey: string;
}

interface Group {
  id: string;
  titleKey: string;
  items: GroupItem[];
}

const GROUPS: Group[] = [
  {
    id: "workspace",
    titleKey: "sidebar2GroupWorkspace",
    items: [
      { id: "dashboard", icon: IconHome, labelKey: "sidebar2WorkspaceItem1" },
      {
        id: "documents",
        icon: IconFileText,
        labelKey: "sidebar2WorkspaceItem2",
      },
      {
        id: "calendar",
        icon: IconCalendar,
        labelKey: "sidebar2WorkspaceItem3",
      },
    ],
  },
  {
    id: "analytics",
    titleKey: "sidebar2GroupAnalytics",
    items: [
      {
        id: "traffic",
        icon: IconTrendingUp,
        labelKey: "sidebar2AnalyticsItem1",
      },
      {
        id: "conversions",
        icon: IconTrendingUp,
        labelKey: "sidebar2AnalyticsItem2",
      },
    ],
  },
  {
    id: "admin",
    titleKey: "sidebar2GroupAdmin",
    items: [
      { id: "members", icon: IconUsers, labelKey: "sidebar2AdminItem1" },
      { id: "billing", icon: IconCreditCard, labelKey: "sidebar2AdminItem2" },
    ],
  },
];

function NavGroup({
  group,
  sb,
  open,
  onOpenChange,
  activeId,
  onSelect,
}: {
  group: Group;
  sb: Record<string, string>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger className="text-muted hover:bg-surface-hover flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold tracking-wide uppercase transition-colors">
        <span className="flex-1">{sb[group.titleKey]}</span>
        <Badge variant="soft" size="sm">
          {group.items.length}
        </Badge>
        <IconChevronDown
          size={14}
          className={cn("transition-transform duration-200", open && "rotate-180")}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col gap-0.5 pb-2">
          {group.items.map((item) => {
            const ItemIcon = item.icon;
            const isActive = item.id === activeId;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => onSelect(item.id)}
                className={cn(
                  "flex items-center gap-3 rounded-lg py-2 pr-3 pl-6 text-sm transition-colors",
                  isActive
                    ? "bg-surface-hover text-fg font-medium"
                    : "text-muted hover:bg-surface-hover",
                )}
              >
                <ItemIcon size={16} className="shrink-0" />
                {sb[item.labelKey]}
              </button>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AccordionGroupNavSidebar() {
  const t = useMessages("pages") as unknown as PagesWithSidebarMessages;
  const sb = t.sidebar;
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    workspace: true,
    analytics: false,
    admin: false,
  });
  const [activeId, setActiveId] = useState("dashboard");

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-5xl px-4 lg:px-8">
        <div className="bg-surface border-border flex h-[560px] w-full overflow-hidden rounded-2xl border">
          <aside className="border-border bg-surface flex w-64 shrink-0 flex-col border-r">
            <div className="border-border flex h-14 shrink-0 items-center gap-2 border-b px-3">
              <div className="bg-brand flex size-8 shrink-0 items-center justify-center rounded-lg">
                <span className="text-brand-fg text-sm font-bold">A</span>
              </div>
              <Typography variant="bodyLarge" className="truncate font-semibold">
                {sb.sidebar2BrandName}
              </Typography>
            </div>
            <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
              {GROUPS.map((group) => (
                <NavGroup
                  key={group.id}
                  group={group}
                  sb={sb}
                  open={Boolean(openGroups[group.id])}
                  onOpenChange={(open) =>
                    setOpenGroups((prev) => ({ ...prev, [group.id]: open }))
                  }
                  activeId={activeId}
                  onSelect={setActiveId}
                />
              ))}
            </div>
          </aside>

          <main className="min-w-0 flex-1 overflow-y-auto p-6 lg:p-8">
            <Typography variant="h3" className="text-2xl font-medium tracking-tight">
              {sb.sidebar2Heading}
            </Typography>
            <Typography variant="body" className="text-muted mt-2">
              {sb.sidebar2Paragraph}
            </Typography>
            <div className="mt-8">
              <Separator label={sb.sidebar2SeparatorLabel} />
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}
