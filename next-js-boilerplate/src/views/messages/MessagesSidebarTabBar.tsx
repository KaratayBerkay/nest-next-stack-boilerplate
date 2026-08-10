"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FIND_FRIENDS_PATH } from "@/constants/routes";
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
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as "conversations" | "friends")}
        className="flex-1"
      >
        <TabsList className="w-full">
          <TabsTrigger value="conversations" className="flex-1">
            {t.chats}
          </TabsTrigger>
          <TabsTrigger value="friends" className="flex-1">
            {t.friends}
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Button variant="ghost" size="icon-sm" asChild>
        <Link
          href={`/v1/${lang}${FIND_FRIENDS_PATH}`}
          aria-label={t.searchUsers}
        >
          <IconPlus size={20} />
        </Link>
      </Button>
    </div>
  );
}
