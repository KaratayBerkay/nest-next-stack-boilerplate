"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import {
  IconArchive,
  IconChartBar,
  IconInbox,
  IconMenu,
  IconPlus,
  IconSearch,
  IconSend,
  IconShare,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { BadgeCount } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/Command";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog";
import { Kbd } from "@/components/ui/Kbd";
import { ScrollArea } from "@/components/ui/ScrollArea";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/Sheet";
import { Textarea } from "@/components/ui/Textarea";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";

interface CategoryDescriptor {
  icon: typeof IconInbox;
  labelKey: string;
  count?: number;
}

interface MessageDescriptor {
  name: string;
  initials: string;
  fromAgent: boolean;
  timeKey: string;
  bodyKey: string;
}

interface SidebarContentProps {
  t: Record<string, string>;
  activeCategory: number;
  setActiveCategory: Dispatch<SetStateAction<number>>;
  setPaletteOpen: Dispatch<SetStateAction<boolean>>;
}

const AGENT_NAME = "Sofia Reyes";
const CUSTOMER_NAME = "Daniel Kim";
const TICKET_ID = "#4821";

const CATEGORIES: CategoryDescriptor[] = [
  { icon: IconInbox, labelKey: "s10Inbox", count: 6 },
  { icon: IconUser, labelKey: "s10Assigned", count: 3 },
  { icon: IconSend, labelKey: "s10Sent" },
  { icon: IconTrash, labelKey: "s10Trash" },
];

const TICKET_SUBJECT_KEYS = [
  "s10TicketTitle",
  "s10Ticket2Title",
  "s10Ticket3Title",
] as const;

const MESSAGES: MessageDescriptor[] = [
  {
    name: CUSTOMER_NAME,
    initials: "DK",
    fromAgent: false,
    timeKey: "s10Msg1Time",
    bodyKey: "s10Msg1Body",
  },
  {
    name: AGENT_NAME,
    initials: "SR",
    fromAgent: true,
    timeKey: "s10Msg2Time",
    bodyKey: "s10Msg2Body",
  },
  {
    name: CUSTOMER_NAME,
    initials: "DK",
    fromAgent: false,
    timeKey: "s10Msg3Time",
    bodyKey: "s10Msg3Body",
  },
  {
    name: AGENT_NAME,
    initials: "SR",
    fromAgent: true,
    timeKey: "s10Msg4Time",
    bodyKey: "s10Msg4Body",
  },
];

function handleCategorySelect(
  index: number,
  setActive: Dispatch<SetStateAction<number>>,
) {
  setActive(index);
}

function handlePaletteChange(
  open: boolean,
  setOpen: Dispatch<SetStateAction<boolean>>,
) {
  setOpen(open);
}

function handlePaletteClose(setOpen: Dispatch<SetStateAction<boolean>>) {
  setOpen(false);
}

function handleComposerSubmit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();
}

function MessageBubble({
  message,
  t,
}: {
  message: MessageDescriptor;
  t: Record<string, string>;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3",
        message.fromAgent && "flex-row-reverse",
      )}
    >
      <Avatar size="sm" fallback={message.initials} className="shrink-0" />
      <div
        className={cn(
          "flex max-w-[75%] flex-col gap-1",
          message.fromAgent && "items-end",
        )}
      >
        <div
          className={cn(
            "flex items-baseline gap-2",
            message.fromAgent && "flex-row-reverse",
          )}
        >
          <span className="text-sm font-medium">{message.name}</span>
          <span className="text-muted text-xs">{t[message.timeKey]}</span>
        </div>
        <div
          className={cn(
            "rounded-xl px-4 py-2.5 text-sm leading-relaxed",
            message.fromAgent
              ? "bg-surface-hover"
              : "border-border bg-surface border",
          )}
        >
          {t[message.bodyKey]}
        </div>
      </div>
    </div>
  );
}

function SidebarContent({
  t,
  activeCategory,
  setActiveCategory,
  setPaletteOpen,
}: SidebarContentProps) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <Button
        variant="ghost"
        className="w-full justify-start gap-2"
        onClick={() => handlePaletteChange(true, setPaletteOpen)}
      >
        <IconSearch size={16} className="text-muted" />
        {t.s10SearchTickets}
        <Kbd className="ml-auto">⌘K</Kbd>
      </Button>

      <nav className="flex flex-col gap-0.5">
        {CATEGORIES.map((category, index) => {
          const CategoryIcon = category.icon;
          const isActive = index === activeCategory;
          return (
            <button
              key={category.labelKey}
              type="button"
              aria-pressed={isActive}
              onClick={() => handleCategorySelect(index, setActiveCategory)}
              className={cn(
                "flex items-center gap-3 rounded-lg py-2 pr-2 pl-1 text-sm transition-colors",
                isActive
                  ? "bg-surface-hover font-medium"
                  : "text-muted hover:bg-muted/60",
              )}
            >
              {category.count ? (
                <BadgeCount count={category.count} rule="string">
                  <CategoryIcon size={18} />
                </BadgeCount>
              ) : (
                <CategoryIcon size={18} className="shrink-0" />
              )}
              {t[category.labelKey]}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export function WithSupportTicket() {
  const t = useMessages("pages").applicationShell;
  const [activeCategory, setActiveCategory] = useState(0);
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 lg:px-8">
        <div className="bg-surface border-border flex h-[600px] w-full flex-col overflow-hidden rounded-2xl border">
          <div className="flex min-h-0 flex-1">
            <aside className="border-border hidden w-60 shrink-0 flex-col border-r p-3 md:flex">
              <SidebarContent
                t={t}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                setPaletteOpen={setPaletteOpen}
              />
            </aside>

            <main className="flex min-w-0 flex-1 flex-col">
              <header className="border-border flex h-14 shrink-0 items-center gap-2 border-b px-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      aria-label={t.s10OpenMenu}
                    >
                      <IconMenu size={20} />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="flex flex-col">
                    <SheetTitle className="sr-only">
                      {t.s10MenuTitle}
                    </SheetTitle>
                    <div className="min-h-0 flex-1">
                      <SidebarContent
                        t={t}
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                        setPaletteOpen={setPaletteOpen}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <Typography
                      variant="h3"
                      className="truncate text-base font-semibold"
                    >
                      {t.s10TicketTitle}
                    </Typography>
                    <Badge variant="secondary" size="sm">
                      {TICKET_ID}
                    </Badge>
                  </div>
                  <Typography variant="caption" className="text-muted">
                    {t.s10TicketDescription}
                  </Typography>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t.s10Share}
                  >
                    <IconShare size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t.s10Archive}
                  >
                    <IconArchive size={16} />
                  </Button>
                </div>
                <Badge variant="soft">{t.s10Status}</Badge>
              </header>

              <ScrollArea className="min-h-0 flex-1">
                <div className="flex flex-col gap-5 p-4">
                  {MESSAGES.map((message) => (
                    <MessageBubble
                      key={message.bodyKey}
                      message={message}
                      t={t}
                    />
                  ))}
                </div>
              </ScrollArea>

              <form
                onSubmit={handleComposerSubmit}
                className="border-border flex shrink-0 items-end gap-2 border-t p-3"
              >
                <Textarea
                  placeholder={t.s10ReplyPlaceholder}
                  className="flex-1"
                />
                <Button type="submit" className="gap-2">
                  <IconSend size={16} />
                  {t.s10SendReply}
                </Button>
              </form>
            </main>
          </div>

          <Dialog
            open={paletteOpen}
            onOpenChange={(open) => handlePaletteChange(open, setPaletteOpen)}
          >
            <DialogContent size="sm" closeLabel={t.s10Close}>
              <DialogTitle className="sr-only">
                {t.s10SearchTickets}
              </DialogTitle>
              <Command>
                <CommandInput placeholder={t.s10SearchPlaceholder} />
                <CommandList>
                  <CommandEmpty>{t.s10NoResults}</CommandEmpty>
                  <CommandGroup heading={t.s10QuickActions}>
                    <CommandItem
                      value="new-ticket"
                      onSelect={() => handlePaletteClose(setPaletteOpen)}
                    >
                      <IconPlus size={16} />
                      {t.s10NewTicket}
                    </CommandItem>
                    <CommandItem
                      value="view-reports"
                      onSelect={() => handlePaletteClose(setPaletteOpen)}
                    >
                      <IconChartBar size={16} />
                      {t.s10ViewReports}
                    </CommandItem>
                  </CommandGroup>
                  <CommandGroup heading={t.s10TicketsGroup}>
                    {TICKET_SUBJECT_KEYS.map((key) => (
                      <CommandItem
                        key={key}
                        value={t[key]}
                        onSelect={() => handlePaletteClose(setPaletteOpen)}
                      >
                        {t[key]}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
}
