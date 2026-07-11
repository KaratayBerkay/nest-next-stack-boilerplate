"use client";

import { useState, useCallback, useEffect, Suspense, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { CHAT_ROOMS } from "@/constants/chat";
import { useYSwipeGesture } from "@/hooks/useYSwipeGesture";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { nowMs } from "@/lib/date-time";
import { Avatar } from "@/components/ui/Avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/initials";
import { IconX, IconMenu2 } from "@tabler/icons-react";
import { useRoom } from "@/lib/realtime/useRoom";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";
import { useConnectionState } from "@/hooks/useConnectionState";
import { ConnectionUnstable } from "@/components/ConnectionUnstable";
import { ScrollToBottomButton } from "@/components/ui/ScrollToBottomButton";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SkeletonChatMessage } from "@/components/ui/skeleton-shapes";
import { useRouter } from "next/navigation";
import { PageInfoButton } from "@/components/ui/page-info";
import { chatRoomPageInfo } from "@/constants/page-info";
import { ChatRoomFallback } from "@/fallbacks";
import type { ChatRoomViewProps } from "@/types/chat-room/ChatRoomView-types";

function ChatRoomContent({ initialRoom = "general" }: ChatRoomViewProps) {
  const t = useMessages("chat-room");
  const { user, loading } = useAuth();
  const router = useRouter();
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

  useEffect(() => {
    if (!realtime) return;

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
    const tempId = `temp-${nowMs()}`;
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
  const onlineUserIds = useMemo(() => new Set(roomMembers.map(m => m.id)), [roomMembers]);

  const selectRoom = useCallback((r: string) => {
    setRoom(r);
    setRoomMembers([]);
    setSidebarOpen(false);
    router.replace(`?room=${r}`, { scroll: false });
  }, [router]);

  if (loading) return <LoadingAuth />;
  if (!user) return <UnauthenticatedMessage message={t.signInRequired} />;
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-4 overflow-hidden">
      <div className="flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <Avatar
              fallback={initials(user?.name ?? user?.email ?? "?")}
              className="h-8 w-8 text-[10px]"
              title={
                connectionState === "online" ? t.connected
                : connectionState === "connecting" ? t.connecting
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
        <PageInfoButton content={chatRoomPageInfo} />
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
            "flex max-h-full flex-col gap-4 rounded-xl border border-border bg-bg p-3 md:p-4",
          )}
        >
          <div className="flex items-center justify-between pb-3 md:hidden">
            <p className="text-xs font-semibold uppercase text-muted">Rooms</p>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close rooms sidebar"
            >
              <IconX size={18} />
            </Button>
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
                  <Button
                    key={r}
                    variant="ghost"
                    size="sm"
                    onClick={() => selectRoom(r)}
                    className={cn(
                      "w-full justify-between gap-2 rounded-lg px-3 py-2",
                      room === r
                        ? "bg-brand text-white hover:bg-brand/90"
                        : "text-muted",
                    )}
                  >
                    <span># {r}</span>
                    {count > 0 && (
                      <span className="text-[10px] opacity-60">{count}</span>
                    )}
                  </Button>
                );
              })}
            </TabsContent>

            <TabsContent
              value="online"
              className="mt-2 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto"
            >
              {roomMembers.length === 0 ? (
                <p className="px-0.5 text-xs text-muted">{t.noOneHere}</p>
              ) : (
                roomMembers.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2 rounded-lg px-3 py-2"
                  >
                    <div className="relative shrink-0">
                      <Avatar
                        fallback={initials(m.name)}
                        className="h-7 w-7 bg-brand text-[9px] text-white"
                      />
                      <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-bg bg-green-500" />
                    </div>
                    <span className="text-sm text-fg">{m.name}</span>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        {connectionState === "unstable" ? (
          <ConnectionUnstable title={t.disconnected} description={t.connecting} />
        ) : (
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="w-full justify-start gap-2 md:hidden"
              aria-label={t.openRooms}
            >
              <IconMenu2 size={18} className="shrink-0 text-muted" />
              <span className="text-sm font-semibold"># {room}</span>
              <span className="text-xs text-muted">
                {t.countOnline.replace("{count}", String(roomCounts[room] ?? 0))}
              </span>
            </Button>
            <div className="hidden items-center gap-2 md:flex">
              <span className="text-sm font-semibold"># {room}</span>
              <span className="text-xs text-muted">
                {t.countOnline.replace("{count}", String(roomCounts[room] ?? 0))}
              </span>
            </div>
          </div>

          <div
            ref={messagesRef}
            className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3 select-none"
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
                <p className="text-xs text-muted">{t.noMessages}</p>
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
                    <div className="relative shrink-0">
                      <Avatar
                        fallback={initials(msg.senderName)}
                        className="mt-0.5 h-6 w-6 bg-brand text-[9px] text-white"
                      />
                      {onlineUserIds.has(msg.senderId) && (
                        <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-bg bg-green-500" />
                      )}
                    </div>
                  )}
                  <div className={`max-w-[70%] ${isMe ? "items-end" : ""}`}>
                    {!isMe && (
                      <p className="mb-0.5 text-[10px] font-medium text-muted">
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
            <div ref={bottomRef} className="h-px" />
          </div>

          {!isAtBottom && messages.length > 0 && (
            <ScrollToBottomButton onClick={scrollToBottom} />
          )}

          <div className="flex gap-2 border-t p-2">
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
                  connectionState === "online"
                    ? t.messagePlaceholder.replace("{room}", room)
                    : connectionState === "connecting"
                      ? t.connecting
                      : t.disconnected
                }
                disabled={connectionState !== "online"}
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSend}
              disabled={connectionState !== "online" || !input.trim()}
              className="rounded-lg px-4 py-2"
            >
              {t.send}
            </Button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

export function FreePageView() {
  return (
    <Suspense fallback={<ChatRoomFallback />}>
      <ChatRoomContent />
    </Suspense>
  );
}
