"use client";

import { useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import {
  IconAt,
  IconChevronDown,
  IconChevronRight,
  IconHash,
  IconMenu2,
  IconPhone,
  IconPin,
  IconPlus,
  IconSend,
  IconSettings,
  IconUserPlus,
  IconVideo,
} from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

interface ChannelItem {
  name: string;
  unread?: number;
}

interface DirectMessageItem {
  name: string;
  initials: string;
  status: "online" | "away";
}

interface PinnedItem {
  labelKey: string;
}

interface ThreadMessage {
  name: string;
  initials: string;
  seed: string;
  time: string;
  bodyKey: string;
  badge?: boolean;
}

const WORKSPACES = [
  "Acme Workspace",
  "Design Studio",
  "Side Projects",
] as const;

const WORKSPACE_NAME = "Acme Workspace";
const USER_NAME = "Sarah Miller";
const USER_AVATAR = "/img/placeholders/ph-1x1-7.webp";

const CHANNELS: ChannelItem[] = [
  { name: "general", unread: 2 },
  { name: "design" },
  { name: "engineering", unread: 5 },
  { name: "random" },
];

const DIRECT_MESSAGES: DirectMessageItem[] = [
  { name: "Sarah Chen", initials: "SC", status: "online" },
  { name: "Mike Johnson", initials: "MJ", status: "away" },
  { name: "Ana Torres", initials: "AT", status: "online" },
  { name: "Liam Park", initials: "LP", status: "online" },
];

const PINNED_ITEMS: PinnedItem[] = [
  { labelKey: "s7Pinned1" },
  { labelKey: "s7Pinned2" },
];

const MESSAGES: ThreadMessage[] = [
  {
    name: "Sarah Chen",
    initials: "SC",
    seed: "shell7-m1",
    time: "09:41",
    bodyKey: "s7Msg1",
    badge: true,
  },
  {
    name: "Mike Johnson",
    initials: "MJ",
    seed: "shell7-m2",
    time: "09:44",
    bodyKey: "s7Msg2",
  },
  {
    name: "Ana Torres",
    initials: "AT",
    seed: "shell7-m3",
    time: "09:52",
    bodyKey: "s7Msg3",
    badge: true,
  },
  {
    name: "Liam Park",
    initials: "LP",
    seed: "shell7-m4",
    time: "10:03",
    bodyKey: "s7Msg4",
  },
  {
    name: "Sarah Chen",
    initials: "SC",
    seed: "shell7-m5",
    time: "10:18",
    bodyKey: "s7Msg5",
  },
];

function handleWorkspaceSelect(
  workspace: (typeof WORKSPACES)[number],
  setWorkspace: Dispatch<SetStateAction<(typeof WORKSPACES)[number]>>,
) {
  setWorkspace(workspace);
}

function WorkspaceSwitcher({
  t,
  workspace,
  setWorkspace,
}: {
  t: Record<string, string>;
  workspace: (typeof WORKSPACES)[number];
  setWorkspace: Dispatch<SetStateAction<(typeof WORKSPACES)[number]>>;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t.s7WorkspaceSwitcher}
          className="hover:bg-muted/60 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors"
        >
          <span className="flex min-w-0 flex-1 items-center gap-2 text-left">
            <span className="bg-brand flex size-6 shrink-0 items-center justify-center rounded-md">
              <span className="text-brand-fg text-xs font-bold">A</span>
            </span>
            <span className="truncate font-medium">{workspace}</span>
          </span>
          <IconChevronDown size={16} className="text-muted shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {WORKSPACES.map((option) => (
          <DropdownMenuItem
            key={option}
            onClick={() => handleWorkspaceSelect(option, setWorkspace)}
          >
            <span className={cn(option === workspace && "font-medium")}>
              {option}
            </span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <IconPlus size={16} />
          {t.s7NewWorkspace}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ChannelsSection({ t }: { t: Record<string, string> }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-muted px-2 pt-5 pb-1 text-xs font-semibold tracking-wider uppercase">
        {t.s7SectionChannels}
      </p>
      {CHANNELS.map((channel) => (
        <button
          key={channel.name}
          type="button"
          className={cn(
            "text-muted hover:bg-muted/60 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
            channel.name === "general" &&
              "bg-surface-hover text-fg font-medium",
          )}
        >
          <IconHash size={16} className="shrink-0" />
          <span className="flex-1 truncate text-left">{channel.name}</span>
          {channel.unread !== undefined && (
            <Badge size="sm" className="px-1.5 py-0 text-[11px]">
              {channel.unread}
            </Badge>
          )}
        </button>
      ))}
    </div>
  );
}

function DirectMessagesSection({ t }: { t: Record<string, string> }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-muted px-2 pt-5 pb-1 text-xs font-semibold tracking-wider uppercase">
        {t.s7SectionDirectMessages}
      </p>
      {DIRECT_MESSAGES.map((person) => (
        <button
          key={person.name}
          type="button"
          className="text-muted hover:bg-muted/60 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
        >
          <Avatar
            size="sm"
            fallback={person.initials}
            status={person.status}
            className="shrink-0"
          />
          <span className="truncate text-left">{person.name}</span>
        </button>
      ))}
    </div>
  );
}

function PinnedSection({ t }: { t: Record<string, string> }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-muted px-2 pt-5 pb-1 text-xs font-semibold tracking-wider uppercase">
        {t.s7SectionPinned}
      </p>
      {PINNED_ITEMS.map((item) => (
        <button
          key={item.labelKey}
          type="button"
          className="text-muted hover:bg-muted/60 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
        >
          <IconPin size={16} className="shrink-0" />
          <span className="truncate text-left">{t[item.labelKey]}</span>
        </button>
      ))}
    </div>
  );
}

function SidebarContent({
  t,
  workspace,
  setWorkspace,
}: {
  t: Record<string, string>;
  workspace: (typeof WORKSPACES)[number];
  setWorkspace: Dispatch<SetStateAction<(typeof WORKSPACES)[number]>>;
}) {
  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col px-2 pb-4">
        <div className="border-border border-b pt-2 pb-2">
          <WorkspaceSwitcher
            t={t}
            workspace={workspace}
            setWorkspace={setWorkspace}
          />
        </div>
        <ChannelsSection t={t} />
        <DirectMessagesSection t={t} />
        <PinnedSection t={t} />
      </div>
    </ScrollArea>
  );
}

function MobileSheetNav({
  t,
  workspace,
  setWorkspace,
}: {
  t: Record<string, string>;
  workspace: (typeof WORKSPACES)[number];
  setWorkspace: Dispatch<SetStateAction<(typeof WORKSPACES)[number]>>;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t.s7OpenMenu}
          className="md:hidden"
        >
          <IconMenu2 size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <SheetTitle className="sr-only">{WORKSPACE_NAME}</SheetTitle>
        <div className="flex h-full flex-col">
          <div className="border-border flex h-14 shrink-0 items-center gap-3 border-b px-4">
            <div className="bg-brand flex size-6 items-center justify-center rounded-md">
              <span className="text-brand-fg text-xs font-bold">A</span>
            </div>
            <Typography variant="bodyLarge" className="font-semibold">
              {WORKSPACE_NAME}
            </Typography>
          </div>
          <div className="min-h-0 flex-1">
            <SidebarContent
              t={t}
              workspace={workspace}
              setWorkspace={setWorkspace}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function HeaderAction({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Tooltip side="bottom">
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className="text-muted hover:bg-muted/60 flex size-9 items-center justify-center rounded-lg transition-colors"
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function MessageRow({
  message,
  t,
}: {
  message: ThreadMessage;
  t: Record<string, string>;
}) {
  return (
    <div className="flex gap-3">
      <Avatar
        size="sm"
        src={placeholderImage(message.seed, "1x1")}
        alt={message.name}
        fallback={message.initials}
        className="mt-0.5 shrink-0"
      />
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <Typography variant="bodySmall" className="font-semibold">
            {message.name}
          </Typography>
          <Typography variant="caption" className="text-muted">
            {message.time}
          </Typography>
          {message.badge && (
            <Badge
              size="sm"
              variant="soft"
              pill
              className="px-2 py-0 text-[11px]"
            >
              {t.s7BadgeNew}
            </Badge>
          )}
        </div>
        <Typography variant="bodySmall" className="text-muted">
          {t[message.bodyKey]}
        </Typography>
      </div>
    </div>
  );
}

export function WithMessagingApp() {
  const t = useMessages("pages").applicationShell;
  const [workspace, setWorkspace] =
    useState<(typeof WORKSPACES)[number]>("Acme Workspace");

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 lg:px-8">
        <div className="bg-surface border-border flex h-[600px] w-full flex-col overflow-hidden rounded-2xl border">
          <div className="flex min-h-0 flex-1">
            <aside className="border-border hidden w-64 shrink-0 flex-col border-r md:flex">
              <SidebarContent
                t={t}
                workspace={workspace}
                setWorkspace={setWorkspace}
              />
            </aside>

            <main className="flex min-w-0 flex-1 flex-col">
              <div className="border-border flex h-14 shrink-0 items-center gap-3 border-b px-4">
                <MobileSheetNav
                  t={t}
                  workspace={workspace}
                  setWorkspace={setWorkspace}
                />
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="text-muted truncate text-sm">
                    {workspace}
                  </span>
                  <IconChevronRight size={14} className="text-muted shrink-0" />
                  <span className="flex min-w-0 items-center gap-1.5">
                    <IconHash size={14} className="text-muted shrink-0" />
                    <span className="truncate text-sm font-medium">
                      general
                    </span>
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <HeaderAction label={t.s7Phone}>
                    <IconPhone size={18} />
                  </HeaderAction>
                  <HeaderAction label={t.s7Video}>
                    <IconVideo size={18} />
                  </HeaderAction>
                  <HeaderAction label={t.s7Invite}>
                    <IconUserPlus size={18} />
                  </HeaderAction>
                  <HeaderAction label={t.s7Settings}>
                    <IconSettings size={18} />
                  </HeaderAction>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="hover:bg-muted/60 flex items-center gap-2 rounded-full p-1 transition-colors"
                    >
                      <Avatar
                        size="sm"
                        src={USER_AVATAR}
                        alt={USER_NAME}
                        fallback="SM"
                      />
                      <span className="hidden text-sm font-medium lg:block">
                        {USER_NAME}
                      </span>
                      <IconChevronDown
                        size={14}
                        className="text-muted hidden lg:block"
                      />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48">
                    <DropdownMenuItem>
                      <IconAt size={16} />
                      {t.s7Profile}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <IconSettings size={16} />
                      {t.s7Settings}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <ScrollArea className="min-h-0 flex-1">
                <div className="flex flex-col gap-5 p-4 md:p-6">
                  {MESSAGES.map((message) => (
                    <MessageRow key={message.seed} message={message} t={t} />
                  ))}
                </div>
              </ScrollArea>

              <div className="border-border shrink-0 border-t p-3 md:p-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={t.s7ComposerPlaceholder}
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    aria-label={t.s7Send}
                    className="shrink-0"
                  >
                    <IconSend size={20} />
                  </Button>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </section>
  );
}
