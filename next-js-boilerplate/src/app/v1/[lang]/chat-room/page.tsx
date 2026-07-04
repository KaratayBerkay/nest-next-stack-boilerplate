"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { CHAT_ROOMS } from "@/constants/chat";
import { useYSwipeGesture } from "@/hooks/useYSwipeGesture";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { Avatar } from "@/components/ui/Avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/initials";
import { IconX, IconMenu2 } from "@tabler/icons-react";
import { useRoom } from "@/lib/realtime/useRoom";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";
import { useConnectionState } from "@/hooks/useConnectionState";
import { ConnectionUnstable } from "@/components/ConnectionUnstable";
import { ScrollToBottomButton } from "@/components/ScrollToBottomButton";
import { SkeletonChatMessage } from "@/components/ui/skeleton-shapes";
import { useSearchParams, useRouter } from "next/navigation";

function ChatRoomContent() {
  const t = useMessages("chat-room");
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRoom = searchParams?.get("room") || "general";
  const [room, setRoom] = useState<string>(initialRoom);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState("");
  const [roomCounts, setRoomCounts] = useState<Record<string, number>>({});
  const [roomMembers, setRoomMembers] = useState<
    { id: string; name: string; avatar?: string }[]
  >([]);
  const realtime = useRealtime();

  const { data: messages = [], isLoading: msgsLoading, isError: msgsError } = useRoom(room);
  const messagesRef = useYSwipeGesture<HTMLDivElement>();
  const { bottomRef, scrollToBottom, isAtBottom } = useAutoScroll(messages);

  // Room presence: subscribe to room-counts, user-joined, user-left (T7).
  useEffect(() => {
    if (!realtime) return;

    // Request initial counts.
    realtime.send({ type: "get-room-counts" });

    const unsubCounts = realtime.subscribe(
      "room-counts",
      (frame: Record<string, unknown>) => {
        setRoomCounts(frame.rooms as Record<string, number>);
      },
    );

    const unsubJoined = realtime.subscribe(
      "user-joined",
      (frame: Record<string, unknown>) => {
        if (frame.room === room) {
          setRoomMembers(frame.members as { id: string; name: string; avatar?: string }[]);
        }
      },
    );

    const unsubLeft = realtime.subscribe(
      "user-left",
      (frame: Record<string, unknown>) => {
        if (frame.room === room) {
          setRoomMembers(frame.members as { id: string; name: string; avatar?: string }[]);
        }
      },
    );

    return () => {
      unsubCounts();
      unsubJoined();
      unsubLeft();
    };
  }, [realtime, room]);

  const handleSend = useCallback(() => {
    if (!input.trim() || !realtime) return;
    const tempId = `temp-${Date.now()}`;
    realtime.send({
      type: "room-message",
      room,
      text: input.trim(),
      tempId,
    });
    setInput("");
    scrollToBottom();
  }, [input, scrollToBottom, realtime, room]);

  const connectionState = useConnectionState();

  const selectRoom = useCallback((r: string) => {
    setRoom(r);
    setRoomMembers([]);
    setSidebarOpen(false);
    router.replace(`?room=${r}`, { scroll: false });
  }, [router]);

  if (loading) return <LoadingAuth />;
  if (!user) return <UnauthenticatedMessage message={t.signInRequired} />;
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
      <div className="flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar
            fallback={initials(user?.name ?? user?.email ?? "?")}
            className={`h-8 w-8 text-[10px] ring-2 ${
              connectionState === "online"
                ? "bg-green-500 text-white ring-green-500"
                : connectionState === "connecting"
                  ? "bg-green-300 text-white ring-green-300 animate-pulse"
                  : "bg-red-400 text-white ring-red-400"
            }`}
            title={
              connectionState === "online" ? "Connected"
              : connectionState === "connecting" ? "Connecting…"
              : "Disconnected"
            }
          />
          <h2 className="text-brand text-sm font-semibold">{t.title}</h2>
        </div>
        <span className="text-muted text-xs">
          {t.countOnline.replace("{count}", String(roomCounts[room] ?? 0))}
        </span>
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
              ? "fixed inset-y-0 left-0 z-50 w-full md:static md:z-auto md:w-56"
              : "hidden md:flex md:w-56",
            "border-border bg-bg max-h-full flex-col gap-4 rounded-xl border p-3 md:p-4",
          )}
        >
          <div className="flex items-center justify-between pb-3 md:hidden">
            <p className="text-muted text-xs font-semibold uppercase">Rooms</p>
            <button
              onClick={() => setSidebarOpen(false)}
              className="hover:bg-surface-hover rounded p-1"
            >
              <IconX size={18} className="text-muted" />
            </button>
          </div>

          <Tabs defaultValue="rooms" className="flex flex-1 flex-col">
            <TabsList className="w-full">
              <TabsTrigger value="rooms" className="flex-1">
                Rooms
              </TabsTrigger>
              <TabsTrigger value="online" className="flex-1">
                {t.online.replace("{count}", String(roomCounts[room] ?? 0))}
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="rooms"
              className="mt-2 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto"
            >
              {CHAT_ROOMS.map((r) => {
                const count = roomCounts[r] ?? 0;
                return (
                  <button
                    key={r}
                    onClick={() => selectRoom(r)}
                    className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      room === r
                        ? "bg-brand text-white"
                        : "text-muted hover:bg-surface-hover"
                    }`}
                  >
                    <span># {r}</span>
                    {count > 0 && (
                      <span className="text-[10px] opacity-60">{count}</span>
                    )}
                  </button>
                );
              })}
            </TabsContent>

            <TabsContent
              value="online"
              className="mt-2 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto"
            >
              {roomMembers.length === 0 ? (
                <p className="text-muted px-0.5 text-xs">{t.noOneHere}</p>
              ) : (
                roomMembers.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2 rounded-lg px-3 py-2"
                  >
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-fg text-sm">{m.name}</span>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        {connectionState === "unstable" ? (
          <ConnectionUnstable title={t.disconnected} description={t.connecting} />
        ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="hover:bg-surface-hover flex w-full items-center gap-2 md:hidden"
              aria-label={t.openRooms}
            >
              <IconMenu2 size={18} className="text-muted shrink-0" />
              <span className="text-sm font-semibold"># {room}</span>
              <span className="text-muted text-xs">
                {t.countOnline.replace("{count}", String(roomCounts[room] ?? 0))}
              </span>
            </button>
            <div className="hidden md:flex md:items-center md:gap-2">
              <span className="text-sm font-semibold"># {room}</span>
              <span className="text-muted text-xs">
                {t.countOnline.replace("{count}", String(roomCounts[room] ?? 0))}
              </span>
            </div>
          </div>

          <div
            ref={messagesRef}
            className="relative flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3 select-none"
          >
            {msgsError && (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-xs text-red-500">Failed to load messages</p>
              </div>
            )}
            {msgsLoading && !msgsError && (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4">
                <SkeletonChatMessage />
                <SkeletonChatMessage isMe />
                <SkeletonChatMessage />
                <SkeletonChatMessage isMe />
              </div>
            )}
            {!msgsLoading && !msgsError && messages.length === 0 && (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-muted text-xs">{t.noMessages}</p>
              </div>
            )}
            {messages.map((msg, i) => {
              const isMe = msg.senderId === user.id;
              return (
                <div
                  key={msg.id}
                  className={`animate-fade-in-up flex items-start gap-2 ${isMe ? "flex-row-reverse" : ""}`}
                  style={{ animationDelay: `${i * 15}ms` }}
                >
                  {!isMe && (
                    <Avatar
                      fallback={initials(msg.senderName)}
                      className="bg-brand mt-0.5 h-6 w-6 shrink-0 text-[9px] text-white"
                    />
                  )}
                  <div className={`max-w-[70%] ${isMe ? "items-end" : ""}`}>
                    {!isMe && (
                      <p className="text-muted mb-0.5 text-[10px] font-medium">
                        {msg.senderName}
                      </p>
                    )}
                    <span
                      className={`inline-block rounded-xl px-3 py-1.5 text-sm ${
                        isMe ? "bg-brand text-white" : "bg-surface text-fg"
                      }`}
                    >
                      {msg.body}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
            {!isAtBottom && messages.length > 0 && (
              <ScrollToBottomButton onClick={scrollToBottom} />
            )}
          </div>

          <div className="flex gap-2 border-t p-2">
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
                  connectionState === "online"
                    ? t.messagePlaceholder.replace("{room}", room)
                    : connectionState === "connecting"
                      ? t.connecting
                      : t.disconnected
                }
                disabled={connectionState !== "online"}
                className="rounded border px-3 py-2 text-sm disabled:opacity-50"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={connectionState !== "online" || !input.trim()}
              className="bg-brand rounded-lg px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {t.send}
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

export default function ChatRoomPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-surface-hover h-8 w-8 animate-pulse rounded-full" />
            <div className="bg-surface-hover h-4 w-24 animate-pulse rounded" />
          </div>
          <div className="relative flex min-h-0 flex-1 gap-4">
            <div className="border-border bg-bg hidden w-56 flex-col gap-4 rounded-xl border p-4 md:flex">
              <div className="bg-surface-hover h-8 animate-pulse rounded-md" />
              <div className="flex flex-col gap-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-surface-hover h-8 animate-pulse rounded-lg" />
                ))}
              </div>
            </div>
            <div className="border-border bg-bg flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border">
              <div className="border-border flex items-center gap-2 border-b px-4 py-3">
                <div className="bg-surface-hover h-4 w-20 animate-pulse rounded" />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <SkeletonChatMessage />
                <SkeletonChatMessage isMe />
                <SkeletonChatMessage />
              </div>
              <div className="border-t p-2">
                <div className="bg-surface-hover h-10 animate-pulse rounded" />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <ChatRoomContent />
    </Suspense>
  );
}
