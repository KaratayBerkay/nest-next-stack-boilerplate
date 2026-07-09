"use client";

import { apiFetch } from "@/lib/api-client";
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  startTransition,
  Suspense,
} from "react";
import {
  MESSAGES_FRIENDS_URL,
  MESSAGES_CONVERSATIONS_PREFIX,
  MESSAGES_READ_URL,
  USERS_SEARCH_PREFIX,
  MESSAGES_FRIENDS_REQUEST_PREFIX,
} from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { useYSwipeGesture } from "@/hooks/useYSwipeGesture";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useAuth } from "@/hooks/useAuth";
import { useParams } from "next/navigation";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { FIND_FRIENDS_PATH } from "@/constants/routes";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";
import { useConversations } from "@/lib/realtime/useConversations";
import { ConnectionUnstable } from "@/components/ConnectionUnstable";
import { ScrollToBottomButton } from "@/components/ui/ScrollToBottomButton";
import { SkeletonConversationSidebar } from "@/components/ui/skeleton-shapes";
import { useConnectionState } from "@/hooks/useConnectionState";
import { usePresence } from "@/hooks/usePresence";
import { useConversation } from "@/lib/realtime/useConversation";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { useDeviceType } from "@/hooks/useDeviceType";
import { Avatar } from "@/components/ui/Avatar";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { LoadEarlierButton } from "@/components/LoadEarlierButton";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/initials";
import { sendMessageSchema } from "@/lib/validation/message";
import { MessageTick } from "@/components/MessageTick";
import { PageInfoButton } from "@/components/ui/page-info";
import { messagesPageInfo } from "@/constants/page-info";
import { MessagesViewFallback } from "@/fallbacks";
import {
  IconX,
  IconMenu2,
  IconChevronLeft,
  IconPlus,
} from "@tabler/icons-react";
import type { MessagesViewProps } from "@/types/messages/MessagesView-types";

type UserInfo = { id: string; name: string; email: string; avatar: string };
type Message = {
  id: string;
  senderId: string;
  recipientId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
  deliveredAt: string | null;
};


export function FreePageView({ initialUser }: MessagesViewProps) {
  const t = useMessages("messages");
  return (
    <Suspense fallback={<MessagesViewFallback />}>
      <ErrorBoundary>
        <MessagesPageContent initialUser={initialUser} />
      </ErrorBoundary>
    </Suspense>
  );
}

function MessagesPageContent({ initialUser }: MessagesViewProps) {
  const t = useMessages("messages");
  const { user, loading } = useAuth();
  const realtime = useRealtime();
  const params = useParams<{ lang: string }>();
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const { data: friends = [] } = useQuery<UserInfo[]>({
    queryKey: ["friends", "list"],
    queryFn: async () => {
      const res = await apiFetch(MESSAGES_FRIENDS_URL);
      if (!res.ok) throw new Error(`Failed to fetch friends: ${res.status}`);
      return res.json();
    },
    enabled: !!user,
  });
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [findInput, setFindInput] = useState("");
  const [findResults, setFindResults] = useState<UserInfo[]>([]);
  const [sentRequestIds, setSentRequestIds] = useState<Set<string>>(
    new Set(),
  );
  const [messageError, setMessageError] = useState<string | null>(null);
  const messagesRef = useYSwipeGesture<HTMLDivElement>();
  const searchAbortRef = useRef<AbortController | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedSearch = useCallback((val: string) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(async () => {
      if (searchAbortRef.current) searchAbortRef.current.abort();
      if (val.length < 1) {
        setFindResults([]);
        return;
      }
      const ac = new AbortController();
      searchAbortRef.current = ac;
      try {
        const res = await apiFetch(
          `${USERS_SEARCH_PREFIX}?q=${encodeURIComponent(val)}`,
          { signal: ac.signal },
        );
        if (res.ok) {
          const data = await res.json();
          if (!ac.signal.aborted) setFindResults(data.items ?? []);
        } else setFindResults([]);
      } catch {
        if (!ac.signal.aborted) setFindResults([]);
      }
    }, 300);
  }, []);

  const { data: conversationsData, refetch: refetchConversations, isError: convsError } =
    useConversations();
  const conversations = useMemo(() => conversationsData ?? [], [conversationsData]);

  const {
    data: conversationData,
    fetchNextPage,
    hasNextPage,
    isError: msgsError,
  } = useConversation(selectedUser?.id ?? null);
  const conversationMessages =
    [...(conversationData?.pages ?? [])].reverse().flatMap((p) => p.messages) ?? [];

  const [tab, setTab] = useState<"conversations" | "friends">(
    () =>
      (typeof window !== "undefined"
        ? (sessionStorage.getItem("msg_tab") as
            | "conversations"
            | "friends")
        : null) || "conversations",
  );
  useEffect(() => {
    sessionStorage.setItem("msg_tab", tab);
  }, [tab]);

  const sendMessage = useCallback(
    async (recipientId: string, text: string) => {
      const res = await apiFetch(
        `${MESSAGES_CONVERSATIONS_PREFIX}${recipientId}/messages`,
        { method: POST, body: JSON.stringify({ text }) },
      );
      if (res.ok) {
        const msg = await res.json().catch(() => null);
        if (msg?.id) {
          queryClient.setQueryData(["messages", recipientId], (old: unknown) => {
            const data = old as
              | { pages: { messages: Record<string, unknown>[] }[] }
              | undefined;
            if (!data?.pages?.length) return old;
            const pages = [...data.pages];
            const first = { ...pages[0] };
            if (first.messages.some((m) => m.id === msg.id)) return old;
            first.messages = [...first.messages, msg];
            pages[0] = first;
            return { ...data, pages };
          });
        }
      }
    },
    [queryClient],
  );

  const markMessagesRead = useCallback(async (userId: string) => {
    try {
      await apiFetch(MESSAGES_READ_URL, {
        method: POST,
        body: JSON.stringify({ userId }),
      });
      refetchConversations();
    } catch {}
  }, [refetchConversations]);

  const lastParamRef = useRef<string | null>(null);
  useEffect(() => {
    const userId = initialUser;
    if (!userId || conversations.length === 0) return;
    if (lastParamRef.current === userId) return;
    lastParamRef.current = userId;
    const match = conversations.find((c) => c.user.id === userId);
    if (match) {
      startTransition(() => {
        setSelectedUser(match.user);
      });
      markMessagesRead(match.user.id);
    }
  }, [initialUser, conversations, markMessagesRead]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!selectedUser) setSidebarOpen(true);
  }, [selectedUser]);

  const { bottomRef, scrollToBottom, isAtBottom } = useAutoScroll(
    conversationMessages,
    !!selectedUser,
  );

  const openConversation = useCallback(
    async (u: UserInfo) => {
      setSelectedUser(u);
      setTab("conversations");
      setSidebarOpen(false);
      markMessagesRead(u.id);
    },
    [markMessagesRead],
  );

  const handleSend = useCallback(async () => {
    if (!selectedUser) return;
    const parsed = sendMessageSchema.safeParse({ text: input });
    if (!parsed.success) {
      setMessageError(parsed.error.issues[0]?.message ?? "Invalid message");
      return;
    }
    setMessageError(null);
    try {
      await sendMessage(selectedUser.id, parsed.data.text);
      setInput("");
      scrollToBottom();
    } catch {
      setMessageError("Failed to send message. Try again.");
    }
  }, [selectedUser, input, sendMessage, scrollToBottom]);

  const pointer = useDeviceType();
  const isTouch = pointer === "touch";
  const { progress, direction, isSwiping } = useSwipeGesture({
    threshold: 60,
    onSwipeLeft: useCallback(() => setTab("friends"), []),
    onSwipeRight: useCallback(() => setTab("conversations"), []),
    enabled: isTouch && !!user,
  });

  const connectionState = useConnectionState();
  const onlineUsers = usePresence();

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

  if (loading) return <LoadingAuth />;
  if (!user)
    return <UnauthenticatedMessage message={t.signInRequired} />;

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-5 overflow-hidden">
      <div className="flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <Avatar
              fallback={initials(user?.name ?? user?.email ?? "?")}
              className="h-8 w-8 text-[10px]"
              title={
                connectionState === "online"
                  ? t.connected
                  : connectionState === "connecting"
                    ? t.connecting
                    : t.disconnected
              }
            />
            {connectionState === "online" ? (
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-bg bg-green-500" />
            ) : connectionState === "connecting" ? (
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-bg bg-green-300 animate-pulse" />
            ) : (
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-bg bg-red-400" />
            )}
          </div>
          <h2 className="text-lg font-bold text-brand">{t.title}</h2>
        </div>
        <PageInfoButton content={messagesPageInfo} />
      </div>

      <div className="relative flex min-h-0 flex-1 gap-4">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

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
                      {(onlineUsers.has(c.user.id) || c.user.online) && (
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

        {selectedUser ? (
          connectionState === "unstable" ? (
            <ConnectionUnstable
              title={t.disconnected}
              description={t.connecting}
            />
          ) : connectionState === "connecting" ? (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border border-border bg-bg">
              <div className="h-8 w-48 animate-pulse rounded-lg border border-border bg-surface" />
              <div className="h-64 w-full max-w-md animate-pulse rounded-xl border border-border bg-surface" />
            </div>
          ) : (
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-bg">
            <div className="flex items-center gap-3 border-b px-4 py-3">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  setSelectedUser(null);
                  setSidebarOpen(true);
                }}
                className="mr-1 rounded-lg md:hidden"
                aria-label="Back to conversations"
              >
                <IconChevronLeft size={18} />
              </Button>
              <div className="relative shrink-0">
                <Avatar
                  fallback={initials(selectedUser.name ?? selectedUser.email ?? "?")}
                  className="h-8 w-8 shrink-0 bg-brand text-xs text-white"
                />
                {onlineUsers.has(selectedUser.id) && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-bg bg-green-500" />
                )}
              </div>
              <span className="text-sm font-semibold">
                {selectedUser.name}
              </span>
            </div>
            <div
              ref={messagesRef}
              className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4 select-none"
            >
              {msgsError && (
                <div className="flex flex-1 items-center justify-center">
                  <p className="text-sm text-red-500">{t.failedToLoad}</p>
                </div>
              )}
              {!msgsError && conversationMessages.length === 0 && (
                <div className="flex flex-1 items-center justify-center">
                  <p className="text-sm text-muted">{t.noMessages}</p>
                </div>
              )}
              {hasNextPage && (
                <LoadEarlierButton
                  onClick={() => fetchNextPage()}
                />
              )}
              {conversationMessages.map((msg: Message, i) => {
                const isMe = msg.senderId === user.id;
                return (
                  <div
                    key={msg.id}
                    className={`animate-fade-in-up flex ${isMe ? "justify-end" : "justify-start"}`}
                    style={{ animationDelay: `${i * 15}ms` }}
                  >
                    <div className="flex max-w-[75%] items-end gap-1.5">
                      {!isMe && (
                        <Avatar
                          fallback={initials(selectedUser.name ?? selectedUser.email ?? "?")}
                          className="mb-0.5 h-6 w-6 shrink-0 bg-brand text-[9px] text-white"
                        />
                      )}
                      <span
                        className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                          isMe ? "bg-brand text-white" : "bg-surface text-fg"
                        }`}
                      >
                        {msg.body}
                      </span>
                      {isMe && (
                        <span className="self-end pb-1">
                          {msg.readAt ? (
                            <MessageTick status="read" />
                          ) : msg.deliveredAt ? (
                            <MessageTick status="delivered" />
                          ) : (
                            <MessageTick status="sent" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} className="h-px" />
            </div>
            {!isAtBottom && !input && conversationMessages.length > 0 && (
              <ScrollToBottomButton onClick={scrollToBottom} />
            )}
            <div className="flex gap-3 border-t px-4 py-3">
              <div className="flex flex-1 flex-col">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={
                    connectionState === "online" ? t.inputPlaceholder : t.connecting
                  }
                  disabled={connectionState !== "online"}
                  className="rounded-xl bg-surface px-4 py-2.5 text-fg focus:border-fg"
                />
                {messageError && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {messageError}
                  </p>
                )}
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={handleSend}
                disabled={connectionState !== "online" || !input.trim()}
                className="self-end rounded-xl px-5 py-2.5"
              >
                Send
              </Button>
            </div>
          </div>
          )
        ) : (
          <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl border border-border bg-bg max-md:hidden">
            <div className="flex flex-col items-center gap-2">
              <IconMenu2 size={32} className="text-muted" />
              <p className="text-sm text-muted">{t.selectConversation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
