"use client";

import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useParams } from "next/navigation";
import { IconX } from "@tabler/icons-react";
import { IconButton } from "@/components/ui/button/icon-button";
import { MessagesSidebarTabBar } from "./MessagesSidebarTabBar";
import { MessagesSidebarSearch } from "./MessagesSidebarSearch";
import { MessagesSidebarConversations } from "./MessagesSidebarConversations";
import { MessagesSidebarFriends } from "./MessagesSidebarFriends";
import type { MessagesSidebarProps } from "@/types/messages/MessagesSidebar-types";

export function MessagesSidebar({
  user,
  conversations,
  friends,
  selectedUser,
  tab,
  setTab,
  search,
  setSearch,
  findInput,
  setFindInput,
  findResults,
  sentRequestIds,
  setSentRequestIds,
  openConversation,
  sidebarOpen,
  setSidebarOpen,
  debouncedSearch,
  onlineUsers,
  convsError,
  progress,
  direction,
  isSwiping,
}: MessagesSidebarProps) {
  const t = useMessages("messages");
  const params = useParams<{ lang: string }>();

  return (
    <div
      className={cn(
        sidebarOpen
          ? "fixed inset-y-0 left-0 z-50 w-full md:static md:z-auto md:w-80"
          : "hidden md:flex md:w-80",
        "border-border bg-bg flex max-h-full flex-col rounded-xl border",
      )}
    >
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h2 className="text-fg text-lg font-bold">{t.title}</h2>
        <IconButton
          icon={<IconX size={18} />}
          label="Close sidebar"
          variant="ghost"
          size="icon-sm"
          onClick={() => setSidebarOpen(false)}
          className="md:hidden"
        />
      </div>

      <MessagesSidebarTabBar
        tab={tab}
        setTab={setTab}
        lang={params?.lang ?? ""}
      />

      <MessagesSidebarSearch
        tab={tab}
        search={search}
        setSearch={setSearch}
        findInput={findInput}
        setFindInput={setFindInput}
        findResults={findResults}
        user={user}
        friends={friends}
        sentRequestIds={sentRequestIds}
        setSentRequestIds={setSentRequestIds}
        debouncedSearch={debouncedSearch}
      />

      {isSwiping && (
        <div className="bg-surface-hover mx-5 h-1 shrink-0 overflow-hidden rounded-full">
          <div
            className="bg-brand h-full rounded-full transition-none"
            style={{
              width: `${progress * 100}%`,
              marginLeft:
                direction === "right" ? "0" : `${(1 - progress) * 100}%`,
            }}
          />
        </div>
      )}

      {tab === "conversations" ? (
        <MessagesSidebarConversations
          conversations={conversations}
          selectedUser={selectedUser}
          openConversation={openConversation}
          onlineUsers={onlineUsers}
          convsError={convsError}
        />
      ) : (
        <MessagesSidebarFriends
          search={search}
          friends={friends}
          openConversation={openConversation}
          onlineUsers={onlineUsers}
        />
      )}
    </div>
  );
}
