"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FIND_FRIENDS_PATH } from "@/constants/routes";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { IconPlus } from "@tabler/icons-react";
import type { MessagesSidebarTabBarProps } from "@/types/messages/MessagesSidebarTabBar-types";

export function MessagesSidebarTabBar({
  tab,
  setTab,
  lang,
}: MessagesSidebarTabBarProps) {
  const t = useMessages("messages");
  return (
    <div className="flex shrink-0 gap-1 border-b px-5 py-3">
      <div className="bg-surface flex flex-1 gap-1 rounded-lg p-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTab("conversations")}
          className={cn(
            "flex-1 rounded-md px-4 py-1.5 text-sm",
            tab === "conversations"
              ? "bg-bg text-fg shadow-sm"
              : "text-muted",
          )}
        >
          {t.chats}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTab("friends")}
          className={cn(
            "flex-1 rounded-md px-4 py-1.5 text-sm",
            tab === "friends" ? "bg-bg text-fg shadow-sm" : "text-muted",
          )}
        >
          {t.friends}
        </Button>
      </div>
      <Link
        href={`/v1/${lang}${FIND_FRIENDS_PATH}`}
        className="text-muted hover:bg-surface-hover hover:text-fg flex items-center rounded-lg px-2 transition-colors"
        aria-label={t.searchUsers}
      >
        <IconPlus size={20} />
      </Link>
    </div>
  );
}
