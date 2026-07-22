"use client";

import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/initials";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { MessagesSidebarFriendsProps } from "@/types/messages/MessagesSidebarFriends-types";

export function MessagesSidebarFriends({
  search,
  friends,
  openConversation,
  onlineUsers,
}: MessagesSidebarFriendsProps) {
  const t = useMessages("messages");

  const filtered = search
    ? friends.filter((f) =>
        f.name?.toLowerCase().includes(search.toLowerCase()),
      )
    : friends;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      {filtered.length === 0 ? (
        <p className="text-muted py-16 text-center text-sm">
          {t.noFriends}
        </p>
      ) : (
        <div className="flex flex-col">
          {filtered.map((u, i) => (
            <button
              key={u.id}
              onClick={() => openConversation(u)}
              className="animate-fade-in-up hover:bg-surface/50 flex w-full items-center gap-3 px-5 py-3 text-left transition-colors"
              style={{ animationDelay: `${i * 15}ms` }}
            >
              <div className="relative h-12 w-12 shrink-0">
                <Avatar
                  fallback={initials(u.name ?? u.email ?? "?")}
                  className={cn(
                    "bg-brand text-brand-fg h-12 w-12 text-sm",
                    onlineUsers.has(u.id) &&
                      "ring-success ring-offset-bg ring-2 ring-offset-2",
                  )}
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="truncate text-sm font-semibold">
                  {u.name || u.email}
                </span>
                <p className="text-muted mt-0.5 text-sm">
                  {onlineUsers.has(u.id) ? "Online" : "Offline"}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
