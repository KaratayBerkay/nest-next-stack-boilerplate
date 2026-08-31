"use client";

import { useState } from "react";
import {
  IconBellRinging,
  IconHome,
  IconMenu2,
  IconMessageCircle,
  IconSearch,
  IconSettings,
  IconStar,
  IconUserCircle,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/Drawer";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSidebarMessages } from "@/types/pages/sidebar/SidebarMessages-types";

interface TileItem {
  id: string;
  icon: typeof IconHome;
  labelKey: string;
}

const TILES: TileItem[] = [
  { id: "home", icon: IconHome, labelKey: "sidebar7Tile1" },
  { id: "search", icon: IconSearch, labelKey: "sidebar7Tile2" },
  { id: "notifications", icon: IconBellRinging, labelKey: "sidebar7Tile3" },
  { id: "messages", icon: IconMessageCircle, labelKey: "sidebar7Tile4" },
  { id: "favorites", icon: IconStar, labelKey: "sidebar7Tile5" },
  { id: "settings", icon: IconSettings, labelKey: "sidebar7Tile6" },
];

const TABS: { id: string; icon: typeof IconHome; labelKey: string }[] = [
  { id: "home", icon: IconHome, labelKey: "sidebar7TabHome" },
  { id: "search", icon: IconSearch, labelKey: "sidebar7TabSearch" },
  {
    id: "notifications",
    icon: IconBellRinging,
    labelKey: "sidebar7TabNotifications",
  },
  { id: "profile", icon: IconUserCircle, labelKey: "sidebar7TabProfile" },
];

export function MobileDrawerNavSidebar() {
  const t = useMessages("pages") as unknown as PagesWithSidebarMessages;
  const sb = t.sidebar;
  const [activeTab, setActiveTab] = useState("home");
  const [activeTile, setActiveTile] = useState<string | null>(null);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-sm px-4 lg:px-8">
        <div className="bg-surface border-border flex h-[560px] w-full flex-col overflow-hidden rounded-2xl border">
          <div className="border-border flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 rounded-full">
                  <IconMenu2 size={16} />
                  {sb.sidebar7MenuButtonLabel}
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>{sb.sidebar7DrawerTitle}</DrawerTitle>
                </DrawerHeader>
                <div className="grid grid-cols-3 gap-3 py-4">
                  {TILES.map((tile) => {
                    const TileIcon = tile.icon;
                    return (
                      <DrawerClose asChild key={tile.id}>
                        <button
                          type="button"
                          onClick={() => setActiveTile(tile.id)}
                          className="border-border bg-bg hover:bg-surface-hover flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors"
                        >
                          <TileIcon size={20} className="text-fg" />
                          <span className="text-fg text-xs font-medium">
                            {sb[tile.labelKey]}
                          </span>
                        </button>
                      </DrawerClose>
                    );
                  })}
                </div>
                <DrawerClose asChild>
                  <Button type="button" variant="outline" className="mb-2 w-full">
                    {sb.sidebar7CloseLabel}
                  </Button>
                </DrawerClose>
              </DrawerContent>
            </Drawer>
            <Typography variant="bodyLarge" className="font-semibold">
              {sb.sidebar7DrawerTitle}
            </Typography>
          </div>

          <main className="min-w-0 flex-1 overflow-y-auto p-6">
            <Typography variant="h3" className="text-xl font-medium tracking-tight">
              {sb.sidebar7Heading}
            </Typography>
            <Typography variant="body" className="text-muted mt-2">
              {sb.sidebar7Paragraph}
            </Typography>
            {activeTile && (
              <p className="text-brand mt-4 text-sm font-medium">
                {sb[TILES.find((tile) => tile.id === activeTile)!.labelKey]}
              </p>
            )}
          </main>

          <nav className="border-border grid shrink-0 grid-cols-4 border-t">
            {TABS.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  aria-label={sb[tab.labelKey]}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 py-3 transition-colors",
                    isActive ? "text-brand" : "text-muted hover:text-fg",
                  )}
                >
                  <TabIcon size={20} />
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </section>
  );
}
