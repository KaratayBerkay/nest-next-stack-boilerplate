"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useChatRoom, type RoomMember } from "@/hooks/useMessaging";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { CHAT_ROOMS } from "@/constants/chat";
import { useYSwipeGesture } from "@/hooks/useYSwipeGesture";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { OnlineDot } from "@/components/OnlineDot";
import { RateLimitMessage } from "@/components/RateLimitMessage";
import { LoadEarlierButton } from "@/components/LoadEarlierButton";
import { Avatar } from "@/components/ui/Avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/initials";
import { IconX, IconMenu2 } from "@tabler/icons-react";

export default function ChatRoomPage() {
  const t = useMessages("chat-room");
  const { user, token, loading } = useAuth();
  const [room, setRoom] = useState<string>("general");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    connected,
    members,
    messages,
    roomCounts,
    rateLimited,
    hasMore,
    fetchRoomMessages,
    sendMessage,
  } = useChatRoom(token, room, user?.id || null, user?.name || null);
  const [input, setInput] = useState("");
  const messagesRef = useYSwipeGesture<HTMLDivElement>();

  const { bottomRef, scrollToBottom } = useAutoScroll(messages);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput("");
    scrollToBottom();
  }, [input, sendMessage, scrollToBottom]);

  const selectRoom = useCallback((r: string) => {
    setRoom(r);
    setSidebarOpen(false);
  }, []);

  if (loading) return <LoadingAuth />;
  if (!user) return <UnauthenticatedMessage message={t.signInRequired} />;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
      <div className="flex shrink-0 items-center justify-between">
        <h2 className="text-brand text-sm font-semibold">{t.title}</h2>
        <span
          className={`text-xs font-semibold ${connected ? "text-green-600" : "text-red-600"}`}
        >
          {connected ? t.connected : t.connecting}
        </span>
      </div>

      <div className="relative flex min-h-0 flex-1 gap-4">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Room sidebar */}
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
                {t.online.replace("{count}", String(members.length))}
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="rooms"
              className="mt-2 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto"
            >
              {CHAT_ROOMS.map((r) => (
                <button
                  key={r}
                  onClick={() => selectRoom(r)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    room === r
                      ? "bg-brand text-white"
                      : "text-muted hover:bg-surface-hover"
                  }`}
                >
                  <span># {r}</span>
                  {roomCounts[r] > 0 && (
                    <span
                      className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                        room === r
                          ? "bg-white/20 text-white"
                          : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      }`}
                    >
                      {roomCounts[r]}
                    </span>
                  )}
                </button>
              ))}
            </TabsContent>

            <TabsContent
              value="online"
              className="mt-2 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto"
            >
              {members.length === 0 && (
                <p className="text-muted px-0.5 text-xs">{t.noOneHere}</p>
              )}
              {members.map((m: RoomMember, i) => (
                <div
                  key={m.id}
                  className="animate-fade-in-up hover:bg-surface-hover flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors"
                  style={{ animationDelay: `${i * 20}ms` }}
                >
                  <div className="relative">
                    <Avatar
                      fallback={initials(m.name)}
                      className="bg-brand h-7 w-7 text-[9px] text-white"
                    />
                    <OnlineDot className="h-2.5 w-2.5" />
                  </div>
                  <span className="text-fg truncate text-xs font-medium">
                    {m.name}
                  </span>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Chat area */}
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
                {t.countOnline.replace("{count}", String(members.length))}
              </span>
            </button>
            <div className="hidden md:flex md:items-center md:gap-2">
              <span className="text-sm font-semibold"># {room}</span>
              <span className="text-muted text-xs">
                {t.countOnline.replace("{count}", String(members.length))}
              </span>
            </div>
          </div>

          <div
            ref={messagesRef}
            className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3 select-none"
          >
            {hasMore && (
              <LoadEarlierButton
                compact
                onClick={() => {
                  const oldest =
                    messages.length > 0 ? messages[0].createdAt : undefined;
                  fetchRoomMessages(room, oldest);
                }}
              />
            )}
            {messages.length === 0 && (
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
                  connected
                    ? t.messagePlaceholder.replace("{room}", room)
                    : t.connecting
                }
                disabled={!connected || rateLimited}
                className="rounded border px-3 py-2 text-sm disabled:opacity-50"
              />
              {rateLimited && <RateLimitMessage compact />}
            </div>
            <button
              onClick={handleSend}
              disabled={!connected || !input.trim() || rateLimited}
              className="bg-brand rounded-lg px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {t.send}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
