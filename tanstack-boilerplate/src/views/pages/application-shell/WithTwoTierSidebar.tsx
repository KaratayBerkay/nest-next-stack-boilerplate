"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  IconBell,
  IconCalendar,
  IconChartBar,
  IconChevronDown,
  IconFolder,
  IconHelpCircle,
  IconHome,
  IconKey,
  IconLayoutDashboard,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconMessage,
  IconMessages,
  IconPlus,
  IconSettings,
  IconUsers,
  IconWebhook,
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
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Skeleton } from "@/components/ui/Skeleton";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";

interface NavItemDescriptor {
  icon: typeof IconHome;
  labelKey: string;
}

interface NavSectionDescriptor {
  titleKey: string;
  items: NavItemDescriptor[];
}

interface ModuleDescriptor {
  icon: typeof IconLayoutDashboard;
  labelKey: string;
}

const ORGS = ["Acme Inc.", "Nimbus Labs", "Orbit Works"] as const;

const MODULES: ModuleDescriptor[] = [
  { icon: IconLayoutDashboard, labelKey: "s12ModuleDashboard" },
  { icon: IconMessages, labelKey: "s12ModuleMessages" },
  { icon: IconCalendar, labelKey: "s12ModuleCalendar" },
  { icon: IconChartBar, labelKey: "s12ModuleAnalytics" },
];

const MAIN_SECTION: NavSectionDescriptor = {
  titleKey: "s12SectionMain",
  items: [
    { icon: IconHome, labelKey: "s12Dashboard" },
    { icon: IconFolder, labelKey: "s12Projects" },
    { icon: IconChartBar, labelKey: "s12Reports" },
  ],
};

const UTILITIES_SECTION: NavSectionDescriptor = {
  titleKey: "s12SectionUtilities",
  items: [
    { icon: IconHelpCircle, labelKey: "s12Help" },
    { icon: IconMessage, labelKey: "s12Feedback" },
  ],
};

const CONFIG_ITEMS: NavItemDescriptor[] = [
  { icon: IconKey, labelKey: "s12ApiKeys" },
  { icon: IconWebhook, labelKey: "s12Webhooks" },
];

const USER_NAME = "Acme Inc.";
const USER_EMAIL = "admin@acmeinc.com";

function handleModuleSelect(
  index: number,
  setActive: Dispatch<SetStateAction<number>>,
) {
  setActive(index);
}

function handlePanelToggle(setOpen: Dispatch<SetStateAction<boolean>>) {
  setOpen((open) => !open);
}

function handleConfigToggle(setOpen: Dispatch<SetStateAction<boolean>>) {
  setOpen((open) => !open);
}

function handleOrgSelect(
  org: (typeof ORGS)[number],
  setOrg: Dispatch<SetStateAction<(typeof ORGS)[number]>>,
) {
  setOrg(org);
}

function RailNav({
  t,
  active,
  setActive,
}: {
  t: Record<string, string>;
  active: number;
  setActive: Dispatch<SetStateAction<number>>;
}) {
  return (
    <aside className="border-border hidden w-16 shrink-0 flex-col items-center gap-1 border-r py-3 md:flex">
      <div className="bg-brand mb-2 flex size-8 items-center justify-center rounded-xl">
        <span className="text-brand-fg text-sm font-bold">A</span>
      </div>
      {MODULES.map((module, index) => {
        const ModuleIcon = module.icon;
        const isActive = index === active;
        return (
          <button
            key={module.labelKey}
            type="button"
            aria-label={t[module.labelKey]}
            aria-pressed={isActive}
            onClick={() => handleModuleSelect(index, setActive)}
            className={cn(
              "flex size-10 items-center justify-center rounded-lg transition-colors",
              isActive
                ? "bg-surface border-border text-fg border"
                : "text-muted hover:bg-muted/60",
            )}
          >
            <ModuleIcon size={20} />
          </button>
        );
      })}
      <Avatar
        size="sm"
        src="/img/placeholders/ph-1x1-4.webp"
        alt={USER_NAME}
        fallback="AC"
        className="mt-auto"
      />
    </aside>
  );
}

function NavSection({
  title,
  t,
}: {
  title: string;
  t: Record<string, string>;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-muted px-3 pt-4 pb-1 text-xs font-medium tracking-wide uppercase">
        {title}
      </p>
      {MAIN_SECTION.items.map((item) => {
        const ItemIcon = item.icon;
        const isActive = item.labelKey === "s12Dashboard";
        return (
          <button
            key={item.labelKey}
            type="button"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-surface-hover font-medium"
                : "text-muted hover:bg-muted/60",
            )}
          >
            <ItemIcon size={18} />
            {t[item.labelKey]}
          </button>
        );
      })}
    </div>
  );
}

function ConfigurationSection({
  t,
  open,
  setOpen,
}: {
  t: Record<string, string>;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        onClick={() => handleConfigToggle(setOpen)}
        className="text-muted hover:bg-muted/60 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
      >
        <IconSettings size={18} />
        <span className="flex-1 text-left">{t.s12Configuration}</span>
        <IconChevronDown
          size={16}
          className={cn(
            "transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className="flex flex-col gap-0.5">
          {CONFIG_ITEMS.map((item) => {
            const ItemIcon = item.icon;
            return (
              <button
                key={item.labelKey}
                type="button"
                className="text-muted hover:bg-muted/60 flex items-center gap-3 rounded-lg py-2 pr-3 pl-9 text-sm transition-colors"
              >
                <ItemIcon size={18} />
                {t[item.labelKey]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PanelNav({
  t,
  configOpen,
  setConfigOpen,
}: {
  t: Record<string, string>;
  configOpen: boolean;
  setConfigOpen: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col px-2 pb-4">
        <NavSection title={t.s12SectionMain} t={t} />
        <p className="text-muted px-3 pt-4 pb-1 text-xs font-medium tracking-wide uppercase">
          {t.s12SectionWorkspace}
        </p>
        <button
          type="button"
          className="text-muted hover:bg-muted/60 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
        >
          <IconUsers size={18} />
          {t.s12Members}
        </button>
        <ConfigurationSection t={t} open={configOpen} setOpen={setConfigOpen} />
        <div className="flex flex-col gap-0.5">
          {UTILITIES_SECTION.items.map((item) => {
            const ItemIcon = item.icon;
            return (
              <button
                key={item.labelKey}
                type="button"
                className="text-muted hover:bg-muted/60 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
              >
                <ItemIcon size={18} />
                {t[item.labelKey]}
              </button>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}

function StatsCard({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <Typography variant="body" className="font-medium">
            {title}
          </Typography>
          <Skeleton className="size-9 rounded-lg" />
        </div>
        <Skeleton className="h-3 w-3/4 rounded-full" />
        <Skeleton className="h-3 w-1/2 rounded-full" />
        <Typography variant="caption" className="text-muted">
          {body}
        </Typography>
      </CardContent>
    </Card>
  );
}

export function WithTwoTierSidebar() {
  const t = useMessages("pages").applicationShell;
  const [activeModule, setActiveModule] = useState(0);
  const [panelOpen, setPanelOpen] = useState(true);
  const [configOpen, setConfigOpen] = useState(false);
  const [org, setOrg] = useState<(typeof ORGS)[number]>("Acme Inc.");

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 lg:px-8">
        <div className="bg-surface border-border flex h-[600px] w-full flex-col overflow-hidden rounded-2xl border">
          <div className="flex min-h-0 flex-1">
            <RailNav t={t} active={activeModule} setActive={setActiveModule} />

            <div
              className={cn(
                "border-border bg-surface hidden w-60 shrink-0 flex-col border-r transition-[width] duration-200 md:flex",
                !panelOpen && "w-0 overflow-hidden border-r-0",
              )}
            >
              <div className="border-border flex h-14 shrink-0 items-center gap-2 border-b px-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="hover:bg-muted/60 flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors"
                    >
                      <span className="truncate">{org}</span>
                      <IconChevronDown
                        size={16}
                        className="text-muted shrink-0"
                      />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-44">
                    {ORGS.map((option) => (
                      <DropdownMenuItem
                        key={option}
                        onClick={() => handleOrgSelect(option, setOrg)}
                      >
                        <span className={cn(option === org && "font-medium")}>
                          {option}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <button
                  type="button"
                  aria-label={t.s12Notifications}
                  className="text-muted hover:bg-muted/60 relative flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors"
                >
                  <BadgeCount count={3} direction="right-top">
                    <IconBell size={18} />
                  </BadgeCount>
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 gap-1 px-2"
                >
                  <IconPlus size={16} />
                  {t.s12NewButton}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t.s12TogglePanel}
                  onClick={() => handlePanelToggle(setPanelOpen)}
                  className="shrink-0"
                >
                  {panelOpen ? (
                    <IconLayoutSidebarLeftCollapse size={18} />
                  ) : (
                    <IconLayoutSidebarLeftExpand size={18} />
                  )}
                </Button>
              </div>

              <div className="min-h-0 flex-1">
                <PanelNav
                  t={t}
                  configOpen={configOpen}
                  setConfigOpen={setConfigOpen}
                />
              </div>
            </div>

            <main
              className={cn(
                "bg-muted/30 min-w-0 flex-1 transition-[border-radius] duration-200",
                panelOpen && "md:rounded-tl-2xl",
              )}
            >
              <ScrollArea className="h-full">
                <div className="flex flex-col gap-5 p-6">
                  <div className="flex flex-col gap-1">
                    <Typography
                      variant="h3"
                      className="text-2xl font-medium tracking-tighter"
                    >
                      {t.s12Heading}
                    </Typography>
                    <Typography variant="body" className="text-muted">
                      {t.s12Paragraph}
                    </Typography>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <StatsCard title={t.s12Card1Title} body={t.s12Card1Body} />
                    <StatsCard title={t.s12Card2Title} body={t.s12Card2Body} />
                    <StatsCard title={t.s12Card3Title} body={t.s12Card3Body} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-40 rounded-full" />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          {USER_EMAIL}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>{t.s12Account}</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>{t.s12Logout}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </ScrollArea>
            </main>
          </div>
        </div>
      </div>
    </section>
  );
}
