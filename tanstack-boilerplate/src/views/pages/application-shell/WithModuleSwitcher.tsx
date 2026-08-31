"use client";

import { Fragment, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  IconChartBar,
  IconChevronDown,
  IconClipboardList,
  IconCreditCard,
  IconFolderOpen,
  IconHome,
  IconLayoutDashboard,
  IconMenu2,
  IconMessageCircle,
  IconPackage,
  IconReceipt,
  IconReport,
  IconShoppingCart,
  IconTarget,
  IconTools,
  IconTruck,
  IconUsers,
  IconWallet,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Separator } from "@/components/ui/Separator";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/Sheet";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";

interface NavItemDescriptor {
  icon: typeof IconHome;
  labelKey: string;
  badge?: number;
}

interface ModuleDescriptor {
  icon: typeof IconLayoutDashboard;
  labelKey: string;
  groups: NavItemDescriptor[][];
}

interface StatDescriptor {
  value: string;
  labelKey: string;
}

interface ModuleContentDescriptor {
  headingKey: string;
  stats: StatDescriptor[];
}

const MODULES: ModuleDescriptor[] = [
  {
    icon: IconLayoutDashboard,
    labelKey: "s6ModuleOverview",
    groups: [
      [
        { icon: IconHome, labelKey: "s6m1Item1Label" },
        { icon: IconChartBar, labelKey: "s6m1Item2Label" },
      ],
      [{ icon: IconTarget, labelKey: "s6m1Item3Label" }],
    ],
  },
  {
    icon: IconChartBar,
    labelKey: "s6ModuleSales",
    groups: [
      [
        { icon: IconUsers, labelKey: "s6m2Item1Label", badge: 12 },
        { icon: IconShoppingCart, labelKey: "s6m2Item2Label" },
      ],
      [{ icon: IconReceipt, labelKey: "s6m2Item3Label" }],
    ],
  },
  {
    icon: IconTools,
    labelKey: "s6ModuleProduction",
    groups: [
      [
        { icon: IconClipboardList, labelKey: "s6m3Item1Label", badge: 3 },
        { icon: IconTools, labelKey: "s6m3Item2Label" },
      ],
      [{ icon: IconTruck, labelKey: "s6m3Item3Label" }],
    ],
  },
  {
    icon: IconPackage,
    labelKey: "s6ModuleDeliverables",
    groups: [
      [
        { icon: IconFolderOpen, labelKey: "s6m4Item1Label" },
        { icon: IconPackage, labelKey: "s6m4Item2Label" },
      ],
      [{ icon: IconMessageCircle, labelKey: "s6m4Item3Label" }],
    ],
  },
  {
    icon: IconWallet,
    labelKey: "s6ModuleFinance",
    groups: [
      [
        { icon: IconWallet, labelKey: "s6m5Item1Label" },
        { icon: IconCreditCard, labelKey: "s6m5Item2Label" },
      ],
      [{ icon: IconReport, labelKey: "s6m5Item3Label" }],
    ],
  },
];

const MODULE_CONTENT: ModuleContentDescriptor[] = [
  {
    headingKey: "s6m1Heading",
    stats: [
      { value: "128", labelKey: "s6m1Stat1Label" },
      { value: "42", labelKey: "s6m1Stat2Label" },
      { value: "3,240", labelKey: "s6m1Stat3Label" },
    ],
  },
  {
    headingKey: "s6m2Heading",
    stats: [
      { value: "$48.2K", labelKey: "s6m2Stat1Label" },
      { value: "132", labelKey: "s6m2Stat2Label" },
      { value: "24%", labelKey: "s6m2Stat3Label" },
    ],
  },
  {
    headingKey: "s6m3Heading",
    stats: [
      { value: "1,860", labelKey: "s6m3Stat1Label" },
      { value: "17", labelKey: "s6m3Stat2Label" },
      { value: "98%", labelKey: "s6m3Stat3Label" },
    ],
  },
  {
    headingKey: "s6m4Heading",
    stats: [
      { value: "23", labelKey: "s6m4Stat1Label" },
      { value: "9", labelKey: "s6m4Stat2Label" },
      { value: "61", labelKey: "s6m4Stat3Label" },
    ],
  },
  {
    headingKey: "s6m5Heading",
    stats: [
      { value: "$210K", labelKey: "s6m5Stat1Label" },
      { value: "$32K", labelKey: "s6m5Stat2Label" },
      { value: "$8.7K", labelKey: "s6m5Stat3Label" },
    ],
  },
];

const BRAND_NAME = "Acme Inc.";

function handleModuleSelect(
  index: number,
  setActiveModule: Dispatch<SetStateAction<number>>,
) {
  setActiveModule(index);
}

function ModuleSwitcher({
  t,
  activeModule,
  setActiveModule,
}: {
  t: Record<string, string>;
  activeModule: number;
  setActiveModule: Dispatch<SetStateAction<number>>;
}) {
  const active = MODULES[activeModule];
  const ModuleIcon = active.icon;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t.s6SwitchModule}
          className="hover:bg-muted/60 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors"
        >
          <ModuleIcon size={18} className="text-brand shrink-0" />
          <span className="flex-1 truncate text-left font-medium">
            {t[active.labelKey]}
          </span>
          <IconChevronDown size={16} className="text-muted shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {MODULES.map((option, index) => {
          const OptionIcon = option.icon;
          return (
            <DropdownMenuItem
              key={option.labelKey}
              onClick={() => handleModuleSelect(index, setActiveModule)}
            >
              <OptionIcon
                size={18}
                className={cn(index === activeModule && "text-brand")}
              />
              <span className={cn(index === activeModule && "font-medium")}>
                {t[option.labelKey]}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ModuleNav({
  t,
  activeModule,
}: {
  t: Record<string, string>;
  activeModule: number;
}) {
  const current = MODULES[activeModule];
  return (
    <div className="flex flex-col gap-1 transition-all duration-300">
      {current.groups.map((group, groupIndex) => (
        <Fragment key={groupIndex}>
          {groupIndex > 0 && <Separator className="my-2" />}
          {group.map((item) => {
            const ItemIcon = item.icon;
            const isActive = groupIndex === 0 && item === group[0];
            return (
              <button
                key={item.labelKey}
                type="button"
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-surface-hover font-medium"
                    : "text-muted hover:bg-muted/60",
                )}
              >
                <ItemIcon size={18} className="shrink-0" />
                <span className="flex-1 truncate text-left">
                  {t[item.labelKey]}
                </span>
                {item.badge !== undefined && (
                  <Badge size="sm" className="px-2 py-0.5 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </Fragment>
      ))}
    </div>
  );
}

function SidebarNav({
  t,
  activeModule,
  setActiveModule,
}: {
  t: Record<string, string>;
  activeModule: number;
  setActiveModule: Dispatch<SetStateAction<number>>;
}) {
  return (
    <div className="flex flex-col">
      <div className="border-border border-b px-3 py-3">
        <ModuleSwitcher
          t={t}
          activeModule={activeModule}
          setActiveModule={setActiveModule}
        />
      </div>
      <div className="px-3 py-4">
        <ModuleNav t={t} activeModule={activeModule} />
      </div>
    </div>
  );
}

function MobileSheetNav({
  t,
  activeModule,
  setActiveModule,
}: {
  t: Record<string, string>;
  activeModule: number;
  setActiveModule: Dispatch<SetStateAction<number>>;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t.s6OpenMenu}
          className="md:hidden"
        >
          <IconMenu2 size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <SheetTitle className="sr-only">{BRAND_NAME}</SheetTitle>
        <div className="flex h-full flex-col">
          <div className="border-border flex h-14 shrink-0 items-center gap-3 border-b px-4">
            <div className="bg-brand flex size-6 items-center justify-center rounded-md">
              <span className="text-brand-fg text-xs font-bold">A</span>
            </div>
            <Typography variant="bodyLarge" className="font-semibold">
              {BRAND_NAME}
            </Typography>
          </div>
          <div className="min-h-0 flex-1">
            <SidebarNav
              t={t}
              activeModule={activeModule}
              setActiveModule={setActiveModule}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 p-5">
        <Typography
          variant="h2"
          className="text-3xl font-medium tracking-tighter"
        >
          {value}
        </Typography>
        <Typography variant="body" className="text-muted">
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}

export function WithModuleSwitcher() {
  const t = useMessages("pages").applicationShell;
  const [activeModule, setActiveModule] = useState(0);
  const content = MODULE_CONTENT[activeModule];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 lg:px-8">
        <div className="bg-surface border-border flex h-[600px] w-full flex-col overflow-hidden rounded-2xl border">
          <div className="flex min-h-0 flex-1">
            <aside className="border-border hidden w-64 shrink-0 flex-col border-r md:flex">
              <SidebarNav
                t={t}
                activeModule={activeModule}
                setActiveModule={setActiveModule}
              />
            </aside>

            <main className="flex min-w-0 flex-1 flex-col">
              <div className="border-border flex h-14 shrink-0 items-center gap-3 border-b px-4">
                <MobileSheetNav
                  t={t}
                  activeModule={activeModule}
                  setActiveModule={setActiveModule}
                />
                <Typography
                  variant="h3"
                  className="truncate text-lg font-medium tracking-tight"
                >
                  {t[content.headingKey as keyof typeof t]}
                </Typography>
              </div>

              <ScrollArea className="min-h-0 flex-1">
                <div className="flex flex-col gap-6 p-6">
                  <div className="flex flex-col gap-1">
                    <Typography variant="overline">
                      {t.s6SectionLabel}
                    </Typography>
                    <Typography
                      variant="h2"
                      className="text-2xl font-medium tracking-tighter"
                    >
                      {t[content.headingKey as keyof typeof t]}
                    </Typography>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    {content.stats.map((stat) => (
                      <StatCard
                        key={stat.labelKey}
                        value={stat.value}
                        label={t[stat.labelKey as keyof typeof t]}
                      />
                    ))}
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
