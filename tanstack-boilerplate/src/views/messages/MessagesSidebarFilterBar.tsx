"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { initials } from "@/lib/initials";
import { FIND_FRIENDS_PATH } from "@/constants/routes";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { cn } from "@/lib/cn";
import { IconPlus } from "@tabler/icons-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  usePopover,
} from "@/components/ui/popover";
import type { SidebarFilter } from "@/types/messages/MessagesSidebarFilterBar-types";
import type { MessagesSidebarFilterBarProps } from "@/types/messages/MessagesSidebarFilterBar-types";
import type { UserInfo } from "@/types/messages/ChatView-types";

function NewChatPicker({
  friends,
  lang,
  onSelect,
}: {
  friends: UserInfo[];
  lang: string;
  onSelect: (u: UserInfo) => void;
}) {
  const t = useMessages("messages");
  const { close } = usePopover();

  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-2 py-6 text-center">
        <p className="text-muted text-sm">{t.noFriendsToChat}</p>
        <Link
          href={`/v1/${lang}${FIND_FRIENDS_PATH}`}
          onClick={close}
          className="text-brand text-sm hover:underline"
        >
          {t.searchUsers}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex max-h-80 flex-col gap-0.5 overflow-y-auto">
      {friends.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => {
            onSelect(f);
            close();
          }}
          className="hover:bg-surface-hover flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors"
        >
          <Avatar
            src={f.avatarUrl ?? undefined}
            fallback={initials(f.name || f.email)}
            className="bg-brand text-brand-fg h-8 w-8 shrink-0 text-xs"
          />
          <span className="truncate text-sm font-medium">
            {f.name || f.email}
          </span>
        </button>
      ))}
    </div>
  );
}

export function MessagesSidebarFilterBar({
  filter,
  setFilter,
  lang,
  friends,
  openConversation,
}: MessagesSidebarFilterBarProps) {
  const t = useMessages("messages");

  const filters: { key: SidebarFilter; label: string }[] = [
    { key: "all", label: t.filterAll },
    { key: "unread", label: t.filterUnread },
    { key: "favorites", label: t.filterFavorites },
    { key: "groups", label: t.filterGroups },
  ];

  return (
    <div className="flex shrink-0 items-center gap-1 border-b px-5 py-3">
      <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            aria-pressed={filter === key}
            onClick={() => setFilter(key)}
            className={cn(
              "shrink-0 rounded-full px-2 py-1 text-xs font-medium transition-colors",
              filter === key
                ? "bg-brand text-brand-fg"
                : "bg-surface text-fg hover:bg-surface-hover",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <Popover>
        <PopoverTrigger
          className="text-fg hover:bg-surface-hover size-7 shrink-0 rounded-md"
          aria-label={t.newMessage}
        >
          <IconPlus size={18} />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64 p-1" title={t.newMessage}>
          <div className="text-muted px-2 pt-1 pb-2 text-xs font-semibold uppercase">
            {t.newMessage}
          </div>
          <NewChatPicker
            friends={friends}
            lang={lang}
            onSelect={openConversation}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
