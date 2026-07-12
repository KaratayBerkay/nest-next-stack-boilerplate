"use client";

import { apiFetch } from "@/lib/api-client";
import { useCallback } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { FIND_FRIENDS_PATH } from "@/constants/routes";
import { MESSAGES_FRIENDS_REQUEST_PREFIX } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/initials";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useParams } from "next/navigation";
import {
  IconX,
  IconPlus,
} from "@tabler/icons-react";
import type { Dispatch, SetStateAction } from "react";

type UserInfo = { id: string; name: string; email: string; avatar: string };

interface MessagesSidebarProps {
  user: UserInfo;
  conversations: Array<{ user: UserInfo; lastMessage: string; unread: number }>;
  friends: UserInfo[];
  selectedUser: UserInfo | null;
  tab: "conversations" | "friends";
  setTab: Dispatch<SetStateAction<"conversations" | "friends">>;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  findInput: string;
  setFindInput: Dispatch<SetStateAction<string>>;
  findResults: UserInfo[];
  sentRequestIds: Set<string>;
  setSentRequestIds: Dispatch<SetStateAction<Set<string>>>;
  setFindResults: Dispatch<SetStateAction<UserInfo[]>>;
  openConversation: (u: UserInfo) => void;
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  debouncedSearch: (val: string) => void;
  onlineUsers: Set<string>;
  convsError: boolean;
  progress: number;
  direction: "left" | "right";
  isSwiping: boolean;
}

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
  setFindResults,
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

  const sendFriendRequest = useCallback(async (userId: string) => {
    try {
      const res = await apiFetch(MESSAGES_FRIENDS_REQUEST_PREFIX + userId, {
        method: POST,
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  return (
    <div
      className={cn(
        sidebarOpen
          ? "fixed inset-y-0 left-0 z-50 w-full md:static md:z-auto md:w-80"
          : "hidden md:flex md:w-80",
        "flex max-h-full flex-col gap-5 rounded-xl border border-border bg-bg p-4 md:p-5",
      )}
    >
      <div className="flex items-center justify-between pb-3 md:hidden">
        <span className="text-sm font-semibold">{t.title}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          <IconX size={18} />
        </Button>
      </div>

      <div className="flex shrink-0 gap-1 rounded-lg bg-surface p-1.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTab("conversations")}
          className={cn(
            "flex-1 rounded-md px-4 py-2",
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
            "flex-1 rounded-md px-4 py-2",
            tab === "friends"
              ? "bg-bg text-fg shadow-sm"
              : "text-muted",
          )}
        >
          {t.friends}
        </Button>
        <Link
          href={`/v1/${params?.lang}${FIND_FRIENDS_PATH}`}
          className="flex items-center rounded-md px-2 text-muted transition-colors hover:bg-surface-hover hover:text-fg"
          aria-label={t.searchUsers}
        >
          <IconPlus size={18} />
        </Link>
      </div>

      {tab === "conversations" && (
        <div className="shrink-0">
          <Input
            value={findInput}
            onChange={(e) => {
              const val = e.target.value;
              setFindInput(val);
              debouncedSearch(val);
            }}
            placeholder={t.searchUsers}
            className="mt-2 rounded-lg bg-surface px-4 py-2.5 text-fg focus:border-fg"
          />
          {findResults.length > 0 && (
            <div className="mt-3 flex flex-col gap-1">
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
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-surface-hover"
                  >
                    <Avatar
                      fallback={initials(u.name ?? u.email ?? "?")}
                      className="h-8 w-8 shrink-0 bg-brand text-[10px] text-white"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {u.name || u.email}
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={async () => {
                        setSentRequestIds((prev) =>
                          new Set(prev).add(u.id),
                        );
                        await sendFriendRequest(u.id);
                        setFindResults((prev) =>
                          prev.filter((r) => r.id !== u.id),
                        );
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
      )}

      {tab === "friends" && (
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.searchFriends}
          className="mt-2 shrink-0 rounded-lg bg-surface px-4 py-2.5 focus:border-border focus:bg-surface"
        />
      )}

      {isSwiping && (
        <div className="h-1 shrink-0 overflow-hidden rounded-full bg-surface-hover">
          <div
            className="h-full rounded-full bg-brand transition-none"
            style={{
              width: `${progress * 100}%`,
              marginLeft:
                direction === "right" ? "0" : `${(1 - progress) * 100}%`,
            }}
          />
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        {convsError && (
          <p className="py-16 text-center text-sm text-red-500">
            {t.failedToLoad}
          </p>
        )}
        {tab === "conversations" && !convsError && conversations.length === 0 && (
          <p className="py-16 text-center text-sm text-muted">
            {t.noConversations}
          </p>
        )}
        {tab === "conversations" && (
          <div className="flex flex-col gap-0.5">
            {[...conversations].map((c, i) => (
              <Button
                key={c.user.id}
                variant="ghost"
                size="sm"
                onClick={() => openConversation(c.user)}
                className={cn(
                  "animate-fade-in-up w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-left",
                  selectedUser?.id === c.user.id ? "bg-brand/10" : "",
                )}
                style={{ animationDelay: `${i * 20}ms` }}
              >
                <div className="relative shrink-0">
                  <Avatar
                    fallback={initials(c.user.name ?? c.user.email ?? "?")}
                    className="h-10 w-10 bg-brand text-white"
                  />
                  {onlineUsers.has(c.user.id) && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-bg bg-green-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">
                      {c.user.name || c.user.email}
                    </span>
                    {c.unread > 0 && (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {c.unread > 99 ? "99+" : c.unread}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted">
                    {c.lastMessage}
                  </p>
                </div>
              </Button>
            ))}
          </div>
        )}
        {tab === "friends" && (() => {
          const filtered = search
            ? friends.filter((f) =>
                f.name?.toLowerCase().includes(search.toLowerCase()),
              )
            : friends;
          return filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted">
              {t.noFriends}
            </p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {filtered.map((u, i) => (
                <Button
                  key={u.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => openConversation(u)}
                  className="animate-fade-in-up w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-left"
                  style={{ animationDelay: `${i * 15}ms` }}
                >
                  <div className="relative shrink-0">
                    <Avatar
                      fallback={initials(u.name ?? u.email ?? "?")}
                      className="h-9 w-9 bg-brand text-white"
                    />
                    {onlineUsers.has(u.id) && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-bg bg-green-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="truncate text-sm font-medium">
                      {u.name || u.email}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
