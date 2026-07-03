"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { CHAT_ROOMS } from "@/constants/chat";
import { useYSwipeGesture } from "@/hooks/useYSwipeGesture";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { LoadEarlierButton } from "@/components/LoadEarlierButton";
import { Avatar } from "@/components/ui/Avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/initials";
import { IconX, IconMenu2 } from "@tabler/icons-react";
import { useRoom } from "@/lib/realtime/useRoom";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";

export default function ChatRoomPage() {
  const t = useMessages("chat-room");
  const { user, loading } = useAuth();
  const [room, setRoom] = useState<string>("general");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState("");
  const realtime = useRealtime();

  const { data: messages = [], isLoading: msgsLoading } = useRoom(room);
  const messagesRef = useYSwipeGesture<HTMLDivElement>();
  const { bottomRef, scrollToBottom } = useAutoScroll(messages);

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
        <span className="text-muted text-xs">
          {t.countOnline.replace("{count}", "0")}
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
                {t.online.replace("{count}", "0")}
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
                </button>
              ))}
            </TabsContent>

            <TabsContent
              value="online"
              className="mt-2 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto"
            >
              <p className="text-muted px-0.5 text-xs">{t.noOneHere}</p>
            </TabsContent>
          </Tabs>
        </div>

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
                {t.countOnline.replace("{count}", "0")}
              </span>
            </button>
            <div className="hidden md:flex md:items-center md:gap-2">
              <span className="text-sm font-semibold"># {room}</span>
              <span className="text-muted text-xs">
                {t.countOnline.replace("{count}", "0")}
              </span>
            </div>
          </div>

          <div
            ref={messagesRef}
            className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3 select-none"
          >
            {msgsLoading && (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-muted text-xs">Loading...</p>
              </div>
            )}
            {!msgsLoading && messages.length === 0 && (
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
                placeholder={t.messagePlaceholder.replace("{room}", room)}
                className="rounded border px-3 py-2 text-sm disabled:opacity-50"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim()}
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
