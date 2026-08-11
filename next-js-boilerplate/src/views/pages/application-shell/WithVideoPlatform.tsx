"use client";

import Image from "next/image";
import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  IconChevronDown,
  IconHistory,
  IconHome,
  IconLayoutGrid,
  IconMenu2,
  IconPlayerPlay,
  IconPlaylist,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
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
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { WithVideoPlatformSidebarText } from "@/types/pages/application-shell/WithVideoPlatform-types";

interface ChannelItem {
  name: string;
  initials: string;
  hue: string;
}

interface VideoItem {
  seed: string;
  titleKey:
    | "s11Video1Title"
    | "s11Video2Title"
    | "s11Video3Title"
    | "s11Video4Title"
    | "s11Video5Title"
    | "s11Video6Title";
  channelKey:
    | "s11Channel1"
    | "s11Channel2"
    | "s11Channel3"
    | "s11Channel4"
    | "s11Channel5";
  viewsKey:
    "s11View1" | "s11View2" | "s11View3" | "s11View4" | "s11View5" | "s11View6";
}

const NAV_ITEMS = [
  { key: "s11NavHome", icon: IconHome },
  { key: "s11NavShorts", icon: IconPlayerPlay },
  { key: "s11NavSubscriptions", icon: IconLayoutGrid },
] as const;

const YOU_ITEMS = [
  { key: "s11NavHistory", icon: IconHistory },
  { key: "s11NavPlaylists", icon: IconPlaylist },
] as const;

const CATEGORIES = [
  "s11CategoryAll",
  "s11CategoryMusic",
  "s11CategoryGaming",
  "s11CategoryNews",
  "s11CategoryLive",
  "s11CategorySports",
] as const;

const CHANNELS: ChannelItem[] = [
  { name: "TechNova", initials: "TN", hue: "bg-indigo-500" },
  { name: "DesignLab", initials: "DL", hue: "bg-pink-500" },
  { name: "CodeCraft", initials: "CC", hue: "bg-emerald-500" },
  { name: "PixelDaily", initials: "PD", hue: "bg-amber-500" },
  { name: "ByteCast", initials: "BC", hue: "bg-sky-500" },
];

const VIDEOS: VideoItem[] = [
  {
    seed: "shell11-1",
    titleKey: "s11Video1Title",
    channelKey: "s11Channel1",
    viewsKey: "s11View1",
  },
  {
    seed: "shell11-2",
    titleKey: "s11Video2Title",
    channelKey: "s11Channel2",
    viewsKey: "s11View2",
  },
  {
    seed: "shell11-3",
    titleKey: "s11Video3Title",
    channelKey: "s11Channel3",
    viewsKey: "s11View3",
  },
  {
    seed: "shell11-4",
    titleKey: "s11Video4Title",
    channelKey: "s11Channel4",
    viewsKey: "s11View4",
  },
  {
    seed: "shell11-5",
    titleKey: "s11Video5Title",
    channelKey: "s11Channel5",
    viewsKey: "s11View5",
  },
  {
    seed: "shell11-6",
    titleKey: "s11Video6Title",
    channelKey: "s11Channel1",
    viewsKey: "s11View6",
  },
];

const BRAND_NAME = "Vidly";
const USER_NAME = "Alex Morgan";
const USER_EMAIL = "alex@vidly.app";
const VIDEO_IMAGE_SIZES = "(max-width: 768px) 50vw, 25vw";

function handleCategorySelect(
  index: number,
  setActive: Dispatch<SetStateAction<number>>,
) {
  setActive(index);
}

function handleSubscriptionsToggle(
  open: boolean,
  setOpen: Dispatch<SetStateAction<boolean>>,
) {
  setOpen(!open);
}

function SidebarNav({ t }: { t: WithVideoPlatformSidebarText }) {
  return (
    <nav className="flex flex-col gap-1 p-3">
      {NAV_ITEMS.map((item, index) => {
        const ItemIcon = item.icon;
        return (
          <button
            key={item.key}
            type="button"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              index === 0
                ? "bg-muted font-medium"
                : "text-muted hover:bg-muted/60",
            )}
          >
            <ItemIcon size={20} />
            {t[item.key]}
          </button>
        );
      })}
      <p className="text-muted mt-4 mb-1 px-3 text-xs font-medium tracking-wide uppercase">
        {t.s11SectionYou}
      </p>
      {YOU_ITEMS.map((item) => {
        const ItemIcon = item.icon;
        return (
          <button
            key={item.key}
            type="button"
            className="text-muted hover:bg-muted/60 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
          >
            <ItemIcon size={20} />
            {t[item.key]}
          </button>
        );
      })}
    </nav>
  );
}

function SubscriptionList({
  t,
  open,
  setOpen,
}: {
  t: WithVideoPlatformSidebarText;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div className="border-border border-t px-3 pt-3">
      <button
        type="button"
        onClick={() => handleSubscriptionsToggle(open, setOpen)}
        className="text-muted hover:bg-muted/60 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
      >
        <span className="flex-1 text-left font-medium">
          {t.s11SectionSubscriptions}
        </span>
        <IconChevronDown
          size={16}
          className={cn(
            "transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className="mt-1 flex flex-col gap-0.5 pb-3">
          {CHANNELS.map((channel) => (
            <button
              key={channel.name}
              type="button"
              className="text-muted hover:bg-muted/60 flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm transition-colors"
            >
              <Avatar
                size="xs"
                fallback={channel.initials}
                className={cn("text-white", channel.hue)}
              />
              <span className="truncate">{channel.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarContent({
  t,
  open,
  setOpen,
}: {
  t: WithVideoPlatformSidebarText;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col">
        <SidebarNav t={t} />
        <SubscriptionList t={t} open={open} setOpen={setOpen} />
      </div>
    </ScrollArea>
  );
}

function MobileSheetNav({
  t,
  open,
  setOpen,
}: {
  t: WithVideoPlatformSidebarText;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t.s11Menu}
          className="md:hidden"
        >
          <IconMenu2 size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <SheetTitle className="sr-only">{BRAND_NAME}</SheetTitle>
        <div className="flex h-full flex-col">
          <div className="border-border flex h-14 items-center gap-2 border-b px-4">
            <div className="bg-brand flex size-6 items-center justify-center rounded-md">
              <span className="text-brand-fg text-xs font-bold">V</span>
            </div>
            <Typography variant="bodyLarge" className="font-semibold">
              {BRAND_NAME}
            </Typography>
          </div>
          <div className="min-h-0 flex-1">
            <SidebarContent t={t} open={open} setOpen={setOpen} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function WithVideoPlatform() {
  const t = useMessages("pages").applicationShell;
  const [activeCategory, setActiveCategory] = useState(0);
  const [subsOpen, setSubsOpen] = useState(true);

  const sidebarText: WithVideoPlatformSidebarText = {
    s11NavHome: t.s11NavHome,
    s11NavShorts: t.s11NavShorts,
    s11NavSubscriptions: t.s11NavSubscriptions,
    s11NavHistory: t.s11NavHistory,
    s11NavPlaylists: t.s11NavPlaylists,
    s11Menu: t.s11Menu,
    s11SectionYou: t.s11SectionYou,
    s11SectionSubscriptions: t.s11SectionSubscriptions,
  };

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 lg:px-8">
        <div className="bg-surface border-border flex h-[600px] w-full flex-col overflow-hidden rounded-2xl border">
          <header className="border-border flex h-14 shrink-0 items-center gap-3 border-b px-4">
            <MobileSheetNav
              t={sidebarText}
              open={subsOpen}
              setOpen={setSubsOpen}
            />
            <button type="button" className="flex items-center gap-2">
              <div className="bg-brand flex size-6 items-center justify-center rounded-md">
                <span className="text-brand-fg text-xs font-bold">V</span>
              </div>
              <Typography
                variant="bodyLarge"
                className="hidden font-semibold sm:block"
              >
                {BRAND_NAME}
              </Typography>
            </button>
            <div className="hidden flex-1 justify-center md:flex">
              <div className="relative w-full max-w-md">
                <Input
                  type="search"
                  placeholder={t.s11SearchPlaceholder}
                  className="bg-muted h-9 rounded-full pr-4"
                  leftIcon={<IconSearch size={16} />}
                />
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="hover:bg-muted/60 ml-auto flex items-center gap-2 rounded-full p-1 transition-colors md:ml-0"
                >
                  <Avatar
                    size="sm"
                    src="https://picsum.photos/seed/shell11-user/64/64"
                    alt={USER_NAME}
                    fallback="AM"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>
                  <Typography variant="body" className="font-medium">
                    {USER_NAME}
                  </Typography>
                  <Typography variant="caption" className="text-muted">
                    {USER_EMAIL}
                  </Typography>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span>{t.s11Account}</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <IconSettings size={16} />
                  <span>{t.s11Settings}</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span className="flex flex-1 items-center justify-between">
                    {t.s11GoPremium}
                    <Badge size="sm" pill>
                      Pro
                    </Badge>
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <div className="flex min-h-0 flex-1">
            <aside className="border-border hidden w-56 shrink-0 border-r md:block">
              <SidebarContent
                t={sidebarText}
                open={subsOpen}
                setOpen={setSubsOpen}
              />
            </aside>

            <main className="min-w-0 flex-1">
              <ScrollArea className="h-full">
                <div className="flex flex-col gap-4 p-4">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {CATEGORIES.map((category, index) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() =>
                          handleCategorySelect(index, setActiveCategory)
                        }
                        className={cn(
                          "border-border rounded-full border px-3 py-1 text-xs whitespace-nowrap transition-colors",
                          index === activeCategory
                            ? "bg-fg text-bg"
                            : "bg-surface text-muted hover:bg-muted/60",
                        )}
                      >
                        {t[category]}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {VIDEOS.map((video) => (
                      <div key={video.seed} className="flex flex-col gap-2">
                        <AspectRatio
                          ratio={16 / 9}
                          className="bg-surface-hover relative overflow-hidden rounded-xl"
                        >
                          <Image
                            src={`https://picsum.photos/seed/${video.seed}/320/180`}
                            alt={t.s11ThumbnailAlt}
                            fill
                            sizes={VIDEO_IMAGE_SIZES}
                            className="object-cover"
                          />
                        </AspectRatio>
                        <Typography
                          variant="body"
                          className="line-clamp-2 font-medium"
                        >
                          {t[video.titleKey]}
                        </Typography>
                        <Typography variant="caption" className="text-muted">
                          {t[video.channelKey]} · {t[video.viewsKey]}
                        </Typography>
                      </div>
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
