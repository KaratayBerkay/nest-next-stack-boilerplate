"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useParams } from "next/navigation";
import { IconX } from "@tabler/icons-react";
import { IconButton } from "@/components/ui/button/icon-button";
import { roomsQueryOptions } from "@/api/client/messages/rooms";
import { MessagesSidebarFilterBar } from "./MessagesSidebarFilterBar";
import { MessagesSidebarSearch } from "./MessagesSidebarSearch";
import { MessagesSidebarConversations } from "./MessagesSidebarConversations";
import { MessagesSidebarRooms } from "./MessagesSidebarRooms";
import type { MessagesSidebarProps } from "@/types/messages/MessagesSidebar-types";

export function MessagesSidebar({
  conversations,
  selectedUser,
  friends,
  filter,
  setFilter,
  search,
  setSearch,
  openConversation,
  onToggleFavorite,
  sidebarOpen,
  setSidebarOpen,
  onlineUsers,
  convsError,
  convsLoading,
}: MessagesSidebarProps) {
  const t = useMessages("messages");
  const params = useParams<{ lang: string }>();
  const lang = params?.lang ?? "";

  const { data: rooms, isPending: roomsLoading } = useQuery({
    ...roomsQueryOptions(),
    enabled: filter === "groups",
  });

  // Friends with no message history have no row in `conversations` at all
  // (that list only has threads with at least one real message) — synthesize
  // a placeholder row per such friend so "All" reads as "everyone you can
  // message", not just "active threads". Real conversations first (existing
  // recency order untouched), unstarted friends appended after, alphabetical.
  const friendsWithoutConvo = useMemo(() => {
    const convoIds = new Set(conversations.map((c) => c.user.id));
    return friends
      .filter((f) => !convoIds.has(f.id))
      .sort((a, b) => (a.name || a.email).localeCompare(b.name || b.email))
      .map((f) => ({
        user: f,
        lastMessage: "",
        lastTime: "",
        unread: 0,
        favorite: false,
        noHistory: true,
      }));
  }, [friends, conversations]);

  const filteredConversations = useMemo(() => {
    let list: Array<(typeof conversations)[number] & { noHistory?: boolean }> =
      conversations;
    if (filter === "all") list = [...list, ...friendsWithoutConvo];
    if (filter === "unread") list = list.filter((c) => c.unread > 0);
    if (filter === "favorites") list = list.filter((c) => c.favorite);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) =>
        (c.user.name || c.user.email).toLowerCase().includes(q),
      );
    }
    return list;
  }, [conversations, friendsWithoutConvo, filter, search]);

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

      <MessagesSidebarFilterBar
        filter={filter}
        setFilter={setFilter}
        lang={lang}
        friends={friends}
        openConversation={openConversation}
      />

      <MessagesSidebarSearch search={search} setSearch={setSearch} />

      {filter === "groups" ? (
        <MessagesSidebarRooms
          rooms={rooms ?? []}
          roomsLoading={roomsLoading}
          lang={lang}
        />
      ) : (
        <MessagesSidebarConversations
          conversations={filteredConversations}
          selectedUser={selectedUser}
          openConversation={openConversation}
          onlineUsers={onlineUsers}
          convsError={convsError}
          convsLoading={convsLoading}
          onToggleFavorite={onToggleFavorite}
          emptyMessage={filter === "unread" ? t.noUnread : undefined}
        />
      )}
    </div>
  );
}
