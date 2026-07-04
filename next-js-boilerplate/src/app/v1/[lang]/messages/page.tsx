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
import { useYSwipeGesture } from "@/hooks/useYSwipeGesture";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams, useParams } from "next/navigation";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { FIND_FRIENDS_PATH } from "@/constants/routes";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";
import { useConversations } from "@/lib/realtime/useConversations";
import { useConversation } from "@/lib/realtime/useConversation";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { useDeviceType } from "@/hooks/useDeviceType";
import { Avatar } from "@/components/ui/Avatar";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { LoadEarlierButton } from "@/components/LoadEarlierButton";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/initials";
import { sendMessageSchema } from "@/lib/validation/message";
import { MessageTick } from "@/components/MessageTick";
import {
  IconX,
  IconMenu2,
  IconChevronLeft,
  IconPlus,
} from "@tabler/icons-react";

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


export default function MessagesPage() {
  const t = useMessages("messages");
  return (
    <Suspense
      fallback={
        <div className="text-muted flex animate-pulse items-center justify-center py-20 text-sm">
          {t.loading}
        </div>
      }
    >
      <ErrorBoundary>
        <MessagesPageContent />
      </ErrorBoundary>
    </Suspense>
  );
}

function MessagesPageContent() {
  const t = useMessages("messages");
  const { user, loading } = useAuth();
  const realtime = useRealtime();
  const searchParams = useSearchParams();
  const params = useParams<{ lang: string }>();
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const { data: friends = [] } = useQuery<UserInfo[]>({
    queryKey: ["friends", "list"],
    queryFn: () =>
      apiFetch("/api/messages/friends").then((r) => r.json()),
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

  // Cache-backed data (Phase 7 D4)
  const { data: conversationsData, refetch: refetchConversations } =
    useConversations();
  const conversations = useMemo(() => conversationsData ?? [], [conversationsData]);

  const {
    data: conversationData,
    fetchNextPage,
    hasNextPage,
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
        `/api/messages/conversations/${recipientId}/messages`,
        { method: "POST", body: JSON.stringify({ text }) },
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
      await apiFetch("/api/messages/read", {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
      refetchConversations();
    } catch {}
  }, [refetchConversations]);

  const lastParamRef = useRef<string | null>(null);
  useEffect(() => {
    const userId = searchParams?.get("user");
    if (!userId || conversations.length === 0) return;
    if (lastParamRef.current === userId) return;
    lastParamRef.current = userId;
    const match = conversations.find((c) => c.user.id === userId);
    if (match) {
      startTransition(() => {
        setSelectedUser(match.user);
      });
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      markMessagesRead(match.user.id);
    }
  }, [searchParams, conversations, markMessagesRead]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { bottomRef, scrollToBottom } = useAutoScroll(
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
  }, [selectedUser, input, sendMessage]);

  const pointer = useDeviceType();
  const isTouch = pointer === "touch";
  const { progress, direction, isSwiping } = useSwipeGesture({
    threshold: 60,
    onSwipeLeft: useCallback(() => setTab("friends"), []),
    onSwipeRight: useCallback(() => setTab("conversations"), []),
    enabled: isTouch && !!user,
  });

  const connected = realtime?.status === "open";

  const sendFriendRequest = useCallback(async (userId: string) => {
    try {
      const res = await apiFetch(`/api/messages/friends/request/${userId}`, {
        method: "POST",
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  if (loading) return <LoadingAuth />;
  if (!user)
    return <UnauthenticatedMessage message="Sign in to start messaging" />;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-hidden">
      <div className="flex shrink-0 items-center justify-between">
        <h2 className="text-brand text-lg font-bold">{t.title}</h2>
        <span
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            connected
              ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`}
          />
          {connected ? t.connected : t.disconnected}
        </span>
      </div>

      <div className="relative flex min-h-0 flex-1 gap-4">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={cn(
            sidebarOpen
              ? "fixed inset-y-0 left-0 z-50 w-full md:static md:z-auto md:w-80"
              : "hidden md:flex md:w-80",
            "border-border bg-bg max-h-full flex-col gap-5 rounded-xl border p-4 md:p-5",
          )}
        >
          {/* X button — visible on mobile only */}
          <div className="flex items-center justify-between pb-3 md:hidden">
            <span className="text-sm font-semibold">{t.title}</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="hover:bg-surface-hover rounded p-1"
            >
              <IconX size={18} className="text-muted" />
            </button>
          </div>

          <div className="bg-surface flex shrink-0 gap-1 rounded-lg p-1.5">
            <button
              onClick={() => setTab("conversations")}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                tab === "conversations"
                  ? "bg-bg text-fg shadow-sm"
                  : "text-muted hover:text-fg"
              }`}
            >
              {t.chats}
            </button>
            <button
              onClick={() => setTab("friends")}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                tab === "friends"
                  ? "bg-bg text-fg shadow-sm"
                  : "text-muted hover:text-fg"
              }`}
            >
              {t.friends}
            </button>
            <Link
              href={`/v1/${params?.lang}${FIND_FRIENDS_PATH}`}
              className="hover:bg-surface-hover text-muted hover:text-fg flex items-center rounded-md px-2 transition-colors"
              aria-label={t.searchUsers}
            >
              <IconPlus size={18} />
            </Link>
          </div>

          {tab === "conversations" && (
            <div className="shrink-0">
              <input
                value={findInput}
                onChange={async (e) => {
                  const val = e.target.value;
                  setFindInput(val);
                  if (val.length < 1) {
                    setFindResults([]);
                    return;
                  }
                  try {
                    const res = await apiFetch(
                      `/api/users/search?q=${encodeURIComponent(val)}`,
                    );
                    if (res.ok) {
                      const data = await res.json();
                      setFindResults(data.items ?? []);
                    } else setFindResults([]);
                  } catch {
                    setFindResults([]);
                  }
                }}
                placeholder={t.searchUsers}
                className="border-border bg-surface text-fg placeholder:text-muted focus:border-fg mt-2 w-full rounded-lg border px-4 py-2.5 text-sm transition-colors outline-none"
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
                        className="hover:bg-surface-hover flex items-center gap-3 rounded-lg px-3 py-2.5"
                      >
                        <Avatar
                          fallback={initials(u.name)}
                          className="bg-brand h-8 w-8 shrink-0 text-[10px] text-white"
                        />
                        <span className="min-w-0 flex-1 truncate text-sm">
                          {u.name}
                        </span>
                        <button
                          onClick={async () => {
                            setSentRequestIds((prev) =>
                              new Set(prev).add(u.id),
                            );
                            await sendFriendRequest(u.id);
                            setFindResults((prev) =>
                              prev.filter((r) => r.id !== u.id),
                            );
                          }}
                          className="bg-brand rounded-lg px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                        >
                          {t.add}
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {tab === "friends" && (
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchFriends}
              className="border-border bg-surface focus:border-border focus:bg-surface mt-2 w-full shrink-0 rounded-lg px-4 py-2.5 text-sm transition-colors outline-none"
            />
          )}

          {isSwiping && (
            <div className="bg-surface-hover h-1 shrink-0 overflow-hidden rounded-full">
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

          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
            {tab === "conversations" && conversations.length === 0 && (
              <p className="text-muted py-16 text-center text-sm">
                {t.noConversations}
              </p>
            )}
            {tab === "conversations" && (
              <div className="flex flex-col gap-0.5">
                {[...conversations].map((c, i) => (
                  <button
                    key={c.user.id}
                    onClick={() => openConversation(c.user)}
                    className={`animate-fade-in-up hover:bg-surface-hover flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                      selectedUser?.id === c.user.id ? "bg-surface" : ""
                    }`}
                    style={{ animationDelay: `${i * 20}ms` }}
                  >
                    <div className="relative shrink-0">
                      <Avatar
                        fallback={initials(c.user.name)}
                        className="bg-brand h-10 w-10 text-white"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium">
                          {c.user.name}
                        </span>
                        {c.unread > 0 && (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            {c.unread > 99 ? "99+" : c.unread}
                          </span>
                        )}
                      </div>
                      <p className="text-muted mt-0.5 truncate text-sm">
                        {c.lastMessage}
                      </p>
                    </div>
                  </button>
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
                <p className="text-muted py-16 text-center text-sm">
                  {t.noFriends}
                </p>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {filtered.map((u, i) => (
                    <button
                      key={u.id}
                      onClick={() => openConversation(u)}
                      className="animate-fade-in-up hover:bg-surface-hover flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors"
                      style={{ animationDelay: `${i * 15}ms` }}
                    >
                      <div className="relative shrink-0">
                        <Avatar
                          fallback={initials(u.name)}
                          className="bg-brand h-9 w-9 text-white"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="truncate text-sm font-medium">
                          {u.name}
                        </span>
                      </div>
                    </button>
                  ))}
              </div>
            );
          })()}
          </div>
        </div>

        {/* Chat area */}
        <div className="border-border bg-bg flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border">
          {/* Mobile: hamburger when no conversation; Desktop: always visible */}
          <div className="flex items-center gap-3 border-b px-4 py-3">
            {selectedUser ? (
              <>
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setSidebarOpen(true);
                  }}
                  className="hover:bg-surface-hover mr-1 rounded-lg p-1.5 md:hidden"
                >
                  <IconChevronLeft size={18} className="text-muted" />
                </button>
                <Avatar
                  fallback={initials(selectedUser.name)}
                  className="bg-brand h-8 w-8 shrink-0 text-xs text-white"
                />
                <span className="text-sm font-semibold">
                  {selectedUser.name}
                </span>
              </>
            ) : (
              <button
                onClick={() => setSidebarOpen(true)}
                className="hover:bg-surface-hover flex w-full items-center gap-3 md:hidden"
              >
                <IconMenu2 size={18} className="text-muted shrink-0" />
                <span className="text-muted text-sm">
                  {t.selectConversation}
                </span>
              </button>
            )}
          </div>
          {selectedUser && (
            <>
              <div
                ref={messagesRef}
                className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4 select-none"
              >
                {conversationMessages.length === 0 && (
                  <div className="flex flex-1 items-center justify-center">
                    <p className="text-muted text-sm">{t.noMessages}</p>
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
                            fallback={initials(selectedUser.name)}
                            className="bg-brand mb-0.5 h-6 w-6 shrink-0 text-[9px] text-white"
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
                <div ref={bottomRef} />
              </div>
              <div className="flex gap-3 border-t px-4 py-3">
                <div className="flex flex-1 flex-col">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={
                      connected ? t.inputPlaceholder : t.connecting
                    }
                    disabled={!connected}
                    className="border-border bg-surface text-fg placeholder:text-muted focus:border-fg w-full rounded-xl border px-4 py-2.5 text-sm transition-colors outline-none disabled:opacity-50"
                  />
                  {messageError && (
                    <p className="mt-1.5 text-xs text-red-500">
                      {messageError}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleSend}
                  disabled={!connected || !input.trim()}
                  className="bg-brand self-end rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
