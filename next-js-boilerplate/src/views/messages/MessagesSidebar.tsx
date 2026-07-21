"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { FIND_FRIENDS_PATH } from "@/constants/routes";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/initials";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useParams } from "next/navigation";
import { IconX, IconPlus, IconSearch } from "@tabler/icons-react";
import { IconButton } from "@/components/ui/button/icon-button";
import type { MessagesSidebarProps } from "@/types/messages/MessagesSidebar-types";
import { useFriendActions } from "@/api/client/friends/actions";
import { useQueryClient } from "@tanstack/react-query";
import { useDateDisplayCookie } from "@/hooks/useDateDisplayCookie";
import { formatDateByPreference } from "@/lib/date-time";

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

  const { sendRequest: sendFriendRequest } = useFriendActions();
  const queryClient = useQueryClient();
  const dateDisplay = useDateDisplayCookie();

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
          href={`/v1/${params?.lang}${FIND_FRIENDS_PATH}`}
          className="text-muted hover:bg-surface-hover hover:text-fg flex items-center rounded-lg px-2 transition-colors"
          aria-label={t.searchUsers}
        >
          <IconPlus size={20} />
        </Link>
      </div>

      <div className="px-5 py-3">
        <div className="relative">
          <IconSearch
            size={16}
            className="text-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
          />
          <input
            value={tab === "conversations" ? findInput : search}
            onChange={(e) => {
              const val = e.target.value;
              if (tab === "conversations") {
                setFindInput(val);
                debouncedSearch(val);
              } else {
                setSearch(val);
              }
            }}
            placeholder={t.searchUsers}
            className="bg-surface text-fg placeholder:text-muted focus:ring-brand/30 w-full rounded-lg border-0 py-2.5 pr-4 pl-9 text-sm focus:ring-1 focus:outline-none"
          />
        </div>
        {tab === "conversations" && findResults.length > 0 && (
          <div className="mt-2 flex flex-col gap-0.5">
            {findResults
              .filter(
                (u) =>
                  u.id !== user.id &&
                  !friends.some((f) => f.id === u.id) &&
                  !sentRequestIds.has(u.id),
              )
              .slice(0, 5)
              .map((u) => (
                <div
                  key={u.id}
                  className="hover:bg-surface-hover flex items-center gap-3 rounded-lg px-3 py-2"
                >
                  <Avatar
                    fallback={initials(u.name ?? u.email ?? "?")}
                    className="bg-brand text-brand-fg h-8 w-8 shrink-0 text-[10px]"
                  />
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {u.name || u.email}
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={async () => {
                      setSentRequestIds((prev) => new Set(prev).add(u.id));
                      await sendFriendRequest(u.id);
                      queryClient.invalidateQueries({
                        queryKey: ["users", "search"],
                      });
                    }}
                    className="rounded-lg text-xs"
                  >
                    {t.add}
                  </Button>
                </div>
              ))}
          </div>
        )}
      </div>

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

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {convsError && (
          <p className="text-error py-16 text-center text-sm">
            {t.failedToLoad}
          </p>
        )}
        {tab === "conversations" &&
          !convsError &&
          conversations.length === 0 && (
            <p className="text-muted py-16 text-center text-sm">
              {t.noConversations}
            </p>
          )}
        {tab === "conversations" && (
          <div className="flex flex-col">
            {[...conversations].map((c, i) => (
              <button
                key={c.user.id}
                onClick={() => openConversation(c.user)}
                className={cn(
                  "animate-fade-in-up hover:bg-surface/50 flex w-full items-center gap-3 px-5 py-3 text-left transition-colors",
                  selectedUser?.id === c.user.id
                    ? "bg-brand/10"
                    : "border-border border-b",
                )}
                style={{ animationDelay: `${i * 20}ms` }}
              >
                <div className="relative h-12 w-12 shrink-0">
                  <Avatar
                    fallback={initials(c.user.name ?? c.user.email ?? "?")}
                    className={cn(
                      "bg-brand text-brand-fg h-12 w-12 text-sm",
                      onlineUsers.has(c.user.id) &&
                        "ring-success ring-offset-bg ring-2 ring-offset-2",
                    )}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold">
                      {c.user.name || c.user.email}
                    </span>
                    <span className="text-muted shrink-0 text-[11px]">
                      {formatDateByPreference(c.lastTime, dateDisplay)}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <p className="text-muted min-w-0 truncate text-sm">
                      {c.lastMessage}
                    </p>
                    {c.unread > 0 && (
                      <span className="bg-error flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white">
                        {c.unread > 99 ? "99+" : c.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
        {tab === "friends" &&
          (() => {
            const filtered = search
              ? friends.filter((f) =>
                  f.name?.toLowerCase().includes(search.toLowerCase()),
                )
              : friends;
            return filtered.length === 0 ? (
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
            );
          })()}
      </div>
    </div>
  );
}
