"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  IconArchive,
  IconCheck,
  IconChevronDown,
  IconInbox,
  IconMenu,
  IconPencil,
  IconSearch,
  IconSend,
  IconSettings,
  IconTrash,
} from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { BadgeCount } from "@/components/ui/Badge";
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
import { Switch } from "@/components/ui/Switch";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";

interface FolderDescriptor {
  icon: typeof IconInbox;
  labelKey: string;
  count?: number;
}

interface MailDescriptor {
  senderKey: string;
  subjectKey: string;
  previewKey: string;
  timeKey: string;
  initials: string;
  unread: boolean;
}

interface SidebarContentProps {
  t: Record<string, string>;
  workspace: (typeof WORKS)[number];
  setWorkspace: Dispatch<SetStateAction<(typeof WORKS)[number]>>;
  activeFolder: number;
  setActiveFolder: Dispatch<SetStateAction<number>>;
  pushOn: boolean;
  setPushOn: Dispatch<SetStateAction<boolean>>;
  digestOn: boolean;
  setDigestOn: Dispatch<SetStateAction<boolean>>;
}

const WORKS = ["Acme Inc.", "Nimbus Labs"] as const;

const USER_NAME = "Olivia Martin";
const USER_EMAIL = "olivia@acmeinc.com";

const FOLDERS: FolderDescriptor[] = [
  { icon: IconInbox, labelKey: "s8Inbox", count: 12 },
  { icon: IconPencil, labelKey: "s8Drafts", count: 2 },
  { icon: IconSend, labelKey: "s8Sent" },
  { icon: IconArchive, labelKey: "s8Archive" },
  { icon: IconTrash, labelKey: "s8Trash" },
];

const MAILS: MailDescriptor[] = [
  {
    senderKey: "s8Mail1Sender",
    subjectKey: "s8Mail1Subject",
    previewKey: "s8Mail1Preview",
    timeKey: "s8Mail1Time",
    initials: "OM",
    unread: true,
  },
  {
    senderKey: "s8Mail2Sender",
    subjectKey: "s8Mail2Subject",
    previewKey: "s8Mail2Preview",
    timeKey: "s8Mail2Time",
    initials: "JW",
    unread: true,
  },
  {
    senderKey: "s8Mail3Sender",
    subjectKey: "s8Mail3Subject",
    previewKey: "s8Mail3Preview",
    timeKey: "s8Mail3Time",
    initials: "AR",
    unread: false,
  },
  {
    senderKey: "s8Mail4Sender",
    subjectKey: "s8Mail4Subject",
    previewKey: "s8Mail4Preview",
    timeKey: "s8Mail4Time",
    initials: "SK",
    unread: false,
  },
  {
    senderKey: "s8Mail5Sender",
    subjectKey: "s8Mail5Subject",
    previewKey: "s8Mail5Preview",
    timeKey: "s8Mail5Time",
    initials: "MB",
    unread: false,
  },
];

function handleFolderSelect(
  index: number,
  setActive: Dispatch<SetStateAction<number>>,
) {
  setActive(index);
}

function handleWorkspaceSelect(
  work: (typeof WORKS)[number],
  setWorkspace: Dispatch<SetStateAction<(typeof WORKS)[number]>>,
) {
  setWorkspace(work);
}

function handleTogglePush(setPushOn: Dispatch<SetStateAction<boolean>>) {
  setPushOn((value) => !value);
}

function handleToggleDigest(setDigestOn: Dispatch<SetStateAction<boolean>>) {
  setDigestOn((value) => !value);
}

function MailRow({
  mail,
  t,
}: {
  mail: MailDescriptor;
  t: Record<string, string>;
}) {
  return (
    <button
      type="button"
      className={cn(
        "border-border hover:bg-muted/30 flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors",
        mail.unread && "bg-muted/50",
      )}
    >
      <Avatar size="sm" fallback={mail.initials} className="mt-0.5 shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1.5">
            {mail.unread && <Badge dot className="bg-brand shrink-0" />}
            <span
              className={cn(
                "truncate text-sm",
                mail.unread ? "font-semibold" : "text-muted",
              )}
            >
              {t[mail.senderKey]}
            </span>
          </span>
          <span className="text-muted shrink-0 text-xs">{t[mail.timeKey]}</span>
        </span>
        <span
          className={cn(
            "mt-0.5 block truncate text-sm",
            mail.unread ? "font-medium" : "text-muted",
          )}
        >
          {t[mail.subjectKey]}
        </span>
        <span className="text-muted mt-0.5 block truncate text-xs">
          {t[mail.previewKey]}
        </span>
      </span>
    </button>
  );
}

function SidebarContent({
  t,
  workspace,
  setWorkspace,
  activeFolder,
  setActiveFolder,
  pushOn,
  setPushOn,
  digestOn,
  setDigestOn,
}: SidebarContentProps) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="hover:bg-muted/60 flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors"
          >
            <span className="bg-brand text-brand-fg flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-bold">
              {workspace.slice(0, 1)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">
                {workspace}
              </span>
              <span className="text-muted block truncate text-xs">
                {USER_EMAIL}
              </span>
            </span>
            <IconChevronDown size={16} className="text-muted shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-52">
          <DropdownMenuLabel>{t.s8SwitchWorkspace}</DropdownMenuLabel>
          {WORKS.map((work) => (
            <DropdownMenuItem
              key={work}
              onClick={() => handleWorkspaceSelect(work, setWorkspace)}
            >
              <span className="flex-1">{work}</span>
              {work === workspace && (
                <IconCheck size={16} className="text-brand" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Input
        leftIcon={<IconSearch size={16} className="text-muted" />}
        placeholder={t.s8SearchPlaceholder}
      />

      <nav className="flex flex-col gap-0.5">
        {FOLDERS.map((folder, index) => {
          const FolderIcon = folder.icon;
          const isActive = index === activeFolder;
          return (
            <button
              key={folder.labelKey}
              type="button"
              aria-pressed={isActive}
              onClick={() => handleFolderSelect(index, setActiveFolder)}
              className={cn(
                "flex items-center gap-3 rounded-lg py-2 pr-2 pl-1 text-sm transition-colors",
                isActive
                  ? "bg-muted font-medium"
                  : "text-muted hover:bg-muted/60",
              )}
            >
              {folder.count ? (
                <BadgeCount count={folder.count} rule="string">
                  <FolderIcon size={18} />
                </BadgeCount>
              ) : (
                <FolderIcon size={18} className="shrink-0" />
              )}
              {t[folder.labelKey]}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="hover:bg-muted/60 flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors"
            >
              <Avatar size="sm" fallback="OM" className="shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {USER_NAME}
                </span>
                <span className="text-muted block truncate text-xs">
                  {USER_EMAIL}
                </span>
              </span>
              <IconChevronDown size={16} className="text-muted shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem>
              <IconSettings size={16} />
              {t.s8AccountSettings}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="flex items-center justify-between gap-4 px-2 py-1.5">
              <span className="text-sm">{t.s8PushNotifications}</span>
              <Switch
                switchSize="sm"
                checked={pushOn}
                onChange={() => handleTogglePush(setPushOn)}
              />
            </div>
            <div className="flex items-center justify-between gap-4 px-2 py-1.5">
              <span className="text-sm">{t.s8EmailDigest}</span>
              <Switch
                switchSize="sm"
                checked={digestOn}
                onChange={() => handleToggleDigest(setDigestOn)}
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function WithEmailClient() {
  const t = useMessages("pages").applicationShell;
  const [workspace, setWorkspace] =
    useState<(typeof WORKS)[number]>("Acme Inc.");
  const [activeFolder, setActiveFolder] = useState(0);
  const [pushOn, setPushOn] = useState(true);
  const [digestOn, setDigestOn] = useState(false);
  const active = FOLDERS[activeFolder];
  const ActiveIcon = active.icon;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 lg:px-8">
        <div className="bg-surface border-border flex h-[600px] w-full flex-col overflow-hidden rounded-2xl border">
          <div className="flex min-h-0 flex-1">
            <aside className="border-border hidden w-64 shrink-0 flex-col border-r md:flex">
              <div className="min-h-0 flex-1 p-3">
                <SidebarContent
                  t={t}
                  workspace={workspace}
                  setWorkspace={setWorkspace}
                  activeFolder={activeFolder}
                  setActiveFolder={setActiveFolder}
                  pushOn={pushOn}
                  setPushOn={setPushOn}
                  digestOn={digestOn}
                  setDigestOn={setDigestOn}
                />
              </div>
            </aside>

            <main className="flex min-w-0 flex-1 flex-col">
              <header className="border-border flex h-14 shrink-0 items-center gap-2.5 border-b px-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      aria-label={t.s8OpenMenu}
                    >
                      <IconMenu size={20} />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="flex flex-col">
                    <SheetTitle className="sr-only">{t.s8MenuTitle}</SheetTitle>
                    <div className="min-h-0 flex-1">
                      <SidebarContent
                        t={t}
                        workspace={workspace}
                        setWorkspace={setWorkspace}
                        activeFolder={activeFolder}
                        setActiveFolder={setActiveFolder}
                        pushOn={pushOn}
                        setPushOn={setPushOn}
                        digestOn={digestOn}
                        setDigestOn={setDigestOn}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                {active.count ? (
                  <BadgeCount count={active.count} rule="string">
                    <ActiveIcon size={18} />
                  </BadgeCount>
                ) : (
                  <ActiveIcon size={18} className="text-muted shrink-0" />
                )}
                <Typography variant="h3" className="text-base font-semibold">
                  {t[active.labelKey as keyof typeof t]}
                </Typography>
              </header>

              <ScrollArea className="min-h-0 flex-1">
                {MAILS.map((mail) => (
                  <MailRow key={mail.senderKey} mail={mail} t={t} />
                ))}
              </ScrollArea>
            </main>
          </div>
        </div>
      </div>
    </section>
  );
}
