"use client";

import {
  useState,
  useCallback,
  useEffect,
  Suspense,
  useMemo,
  type ChangeEvent,
  type Dispatch,
  type KeyboardEvent,
  type SetStateAction,
} from "react";
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
import { IconX, IconMenu2, IconCrown } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRoom } from "@/lib/realtime/useRoom";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";
import { trackTempId } from "@/lib/realtime/event-dispatch";
import { useConnectionState } from "@/hooks/useConnectionState";
import { ConnectionUnstable } from "@/components/ConnectionUnstable";
import { ScrollToBottomButton } from "@/components/ui/ScrollToBottomButton";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/button/icon-button";
import { SkeletonChatMessage } from "@/components/ui/skeleton-shapes";
import { useRouter } from "next/navigation";
import { PageInfoButton } from "@/components/ui/page-info";
import { chatRoomPageInfo } from "@/constants/page-info";
import { ChatRoomFallback } from "@/fallbacks";
import type { ChatRoomBaseViewProps } from "@/types/chat-room/ChatRoomBaseView-types";

function SidebarCloseButton({
  useNativeControls,
  onClick,
}: {
  useNativeControls: boolean;
  onClick: () => void;
}) {
  if (useNativeControls) {
    return (
      <IconButton
        icon={<IconX size={18} />}
        label="Close rooms sidebar"
        onClick={onClick}
      />
    );
  }
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      aria-label="Close rooms sidebar"
    >
      <IconX size={18} />
    </Button>
  );
}

function RoomButton({
  useNativeControls,
  room,
  isActive,
  count,
  isVip,
  onSelect,
}: {
  useNativeControls: boolean;
  room: string;
  isActive: boolean;
  count: number;
  isVip: boolean;
  onSelect: () => void;
}) {
  if (useNativeControls) {
    return (
      <button
        onClick={onSelect}
        className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
          isActive
            ? "bg-brand text-brand-fg"
            : "text-muted hover:bg-surface-hover"
        }`}
      >
        <span className="flex items-center gap-1">
          {isVip && <IconCrown size={12} stroke={2} className="text-brand" />}#{" "}
          {room}
        </span>
        {count > 0 && <span className="text-[10px] opacity-60">{count}</span>}
      </button>
    );
  }
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onSelect}
      className={cn(
        "w-full justify-between gap-2 rounded-lg px-3 py-2",
        isActive ? "bg-brand hover:bg-brand/90 text-brand-fg" : "text-muted",
      )}
    >
      <span># {room}</span>
      {count > 0 && <span className="text-[10px] opacity-60">{count}</span>}
    </Button>
  );
}

function HamburgerButton({
  useNativeControls,
  onClick,
  ariaLabel,
  room,
  countLabel,
}: {
  useNativeControls: boolean;
  onClick: () => void;
  ariaLabel: string;
  room: string;
  countLabel: string;
}) {
  const content = (
    <>
      <IconMenu2 size={18} className="text-muted shrink-0" />
      <span className="text-sm font-semibold"># {room}</span>
      <span className="text-muted text-xs">{countLabel}</span>
    </>
  );

  if (useNativeControls) {
    return (
      <button
        onClick={onClick}
        className="hover:bg-surface-hover flex w-full items-center gap-2 md:hidden"
        aria-label={ariaLabel}
      >
        {content}
      </button>
    );
  }
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="w-full justify-start gap-2 md:hidden"
      aria-label={ariaLabel}
    >
      {content}
    </Button>
  );
}

function MessageInput({
  useNativeControls,
  value,
  onChange,
  onKeyDown,
  placeholder,
  disabled,
}: {
  useNativeControls: boolean;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  placeholder: string;
  disabled: boolean;
}) {
  if (useNativeControls) {
    return (
      <input
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="rounded border px-3 py-2 text-sm disabled:opacity-50"
      />
    );
  }
  return (
    <Input
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}

function SendButton({
  useNativeControls,
  onClick,
  disabled,
  label,
}: {
  useNativeControls: boolean;
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  if (useNativeControls) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className="bg-brand text-brand-fg rounded-lg px-4 py-2 text-sm disabled:opacity-50"
      >
        {label}
      </button>
    );
  }
  return (
    <Button
      variant="primary"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg px-4 py-2"
    >
      {label}
    </Button>
  );
}

function chatRoomHandleSend(
  input: string,
  realtime: ReturnType<typeof useRealtime> | null,
  room: string,
  queryClient: ReturnType<typeof useQueryClient>,
  user: { id: string; name?: string | null } | null,
  setInput: Dispatch<SetStateAction<string>>,
  scrollToBottom: () => void,
) {
  if (!input.trim() || !realtime) return;
  const tempId = `temp-${nowMs()}`;

  if (user?.id) {
    trackTempId(tempId);
    queryClient.setQueryData(
      ["room", room],
      (old: Record<string, unknown>[] | undefined) => {
        const msgs = old ?? [];
        if (msgs.some((m) => (m as Record<string, unknown>).id === tempId))
          return old;
        return [
          ...msgs,
          {
            id: tempId,
            senderId: user.id,
            senderName: user.name ?? "Unknown",
            body: input.trim(),
            createdAt: new Date().toISOString(),
            pending: true,
          },
        ];
      },
    );
  }

  realtime.send({
    type: "room-message",
    room,
    text: input.trim(),
    tempId,
  });
  setInput("");
  scrollToBottom();
}

function selectChatRoom(
  r: string,
  setRoom: Dispatch<SetStateAction<string>>,
  setRoomMembers: Dispatch<
    SetStateAction<{ id: string; name: string; avatar?: string }[]>
  >,
  setSidebarOpen: Dispatch<SetStateAction<boolean>>,
  router: ReturnType<typeof useRouter>,
) {
  setRoom(r);
  setRoomMembers([]);
  setSidebarOpen(false);
  router.replace(`?room=${r}`, { scroll: false });
}

function ChatRoomContent({
  initialRoom = "general",
  showPageInfo = false,
  vipRooms = [],
  useNativeControls = false,
  showSelfCrown = false,
  className,
}: ChatRoomBaseViewProps) {
  const t = useMessages("chat-room");
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [room, setRoom] = useState<string>(initialRoom);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState("");
  const [roomCounts, setRoomCounts] = useState<Record<string, number>>({});
  const [roomMembers, setRoomMembers] = useState<
    { id: string; name: string; avatar?: string }[]
  >([]);
  const realtime = useRealtime();

  const {
    data: messages = [],
    isLoading: msgsLoading,
    isError: msgsError,
  } = useRoom(room);
  const messagesRef = useYSwipeGesture<HTMLDivElement>();
  const { bottomRef, scrollToBottom, isAtBottom } = useAutoScroll(messages);

  useEffect(() => {
    if (!realtime) return;
    realtime.send({ type: "get-room-counts" });
  }, [realtime]);

  useEffect(() => {
    if (!realtime) return;

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
          setRoomMembers(
            frame.members as { id: string; name: string; avatar?: string }[],
          );
        }
      },
    );

    const unsubLeft = realtime.subscribe(
      "user-left",
      (frame: Record<string, unknown>) => {
        if (frame.room === room) {
          setRoomMembers(
            frame.members as { id: string; name: string; avatar?: string }[],
          );
        }
      },
    );

    return () => {
      unsubCounts();
      unsubJoined();
      unsubLeft();
    };
  }, [realtime, room]);

  const handleSend = useCallback(
    () =>
      chatRoomHandleSend(
        input,
        realtime,
        room,
        queryClient,
        user,
        setInput,
        scrollToBottom,
      ),
    [input, realtime, room, queryClient, user, scrollToBottom],
  );

  const connectionState = useConnectionState();
  const onlineUserIds = useMemo(
    () => new Set(roomMembers.map((m) => m.id)),
    [roomMembers],
  );
  const rooms = useMemo(() => [...CHAT_ROOMS, ...vipRooms], [vipRooms]);

  const selectRoom = useCallback(
    (r: string) =>
      selectChatRoom(r, setRoom, setRoomMembers, setSidebarOpen, router),
    [router],
  );

  if (loading) return <LoadingAuth />;
  if (!user) return <UnauthenticatedMessage message={t.signInRequired} />;
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col gap-6 overflow-hidden",
        className,
      )}
    >
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
              <span className="border-bg bg-success absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2" />
            ) : connectionState === "connecting" ? (
              <span className="border-bg bg-success absolute -right-0.5 -bottom-0.5 h-3 w-3 animate-pulse rounded-full border-2" />
            ) : (
              <span className="border-bg bg-error absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2" />
            )}
          </div>
          <h2 className="text-brand text-lg font-bold">{t.title}</h2>
        </div>
        {showPageInfo && <PageInfoButton content={chatRoomPageInfo} />}
      </div>

      <div className="relative flex min-h-0 flex-1 gap-4">
        {sidebarOpen && (
          // Decorative dismiss backdrop, not a control — the sidebar's own controls remain
          // keyboard-reachable; this scrim only needs a click target.
          <div
            className="bg-overlay/30 fixed inset-0 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <div
          className={cn(
            sidebarOpen
              ? "fixed inset-y-0 left-0 z-50 w-full md:static md:z-auto md:w-56"
              : "hidden md:flex md:w-56",
            "border-border bg-bg flex max-h-full flex-col gap-4 rounded-xl border p-3 md:p-4",
          )}
        >
          <div className="flex items-center justify-between pb-3 md:hidden">
            <p className="text-muted text-xs font-semibold uppercase">Rooms</p>
            <SidebarCloseButton
              useNativeControls={useNativeControls}
              onClick={() => setSidebarOpen(false)}
            />
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
              className="mt-3 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto"
            >
              {rooms.map((r) => {
                const count = roomCounts[r] ?? 0;
                const isVip = vipRooms.includes(r);
                return (
                  <RoomButton
                    key={r}
                    useNativeControls={useNativeControls}
                    room={r}
                    isActive={room === r}
                    count={count}
                    isVip={isVip}
                    onSelect={() => selectRoom(r)}
                  />
                );
              })}
            </TabsContent>

            <TabsContent
              value="online"
              className="mt-3 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto"
            >
              {roomMembers.length === 0 ? (
                <p className="text-muted px-0.5 text-xs">{t.noOneHere}</p>
              ) : (
                roomMembers.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 rounded-lg px-3 py-2"
                  >
                    <div className="relative h-10 w-10 shrink-0">
                      <Avatar
                        fallback={initials(m.name)}
                        className="bg-brand text-brand-fg ring-success ring-offset-bg h-10 w-10 text-[10px] ring-2 ring-offset-2"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-fg truncate text-sm font-medium">
                        {m.name}
                      </span>
                    </div>
                    {showSelfCrown && m.id === user.id && (
                      <IconCrown
                        size={12}
                        stroke={2}
                        className="text-brand shrink-0"
                      />
                    )}
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        {connectionState === "unstable" ? (
          <ConnectionUnstable
            title={t.disconnected}
            description={t.connecting}
          />
        ) : (
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border">
            <div className="flex items-center gap-2 border-b px-4 py-3">
              <HamburgerButton
                useNativeControls={useNativeControls}
                onClick={() => setSidebarOpen(true)}
                ariaLabel={t.openRooms}
                room={room}
                countLabel={t.countOnline.replace(
                  "{count}",
                  String(roomCounts[room] ?? 0),
                )}
              />
              <div className="hidden items-center gap-2 md:flex">
                <span className="text-sm font-semibold"># {room}</span>
                <span className="text-muted text-xs">
                  {t.countOnline.replace(
                    "{count}",
                    String(roomCounts[room] ?? 0),
                  )}
                </span>
              </div>
            </div>

            <div
              ref={messagesRef}
              className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3 select-text"
            >
              {msgsError && (
                <div className="flex flex-1 items-center justify-center">
                  <p className="text-error text-xs">Failed to load messages</p>
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
                      <div className="relative shrink-0">
                        <Avatar
                          fallback={initials(msg.senderName)}
                          className="bg-brand text-brand-fg mt-0.5 h-6 w-6 text-[9px]"
                        />
                        {onlineUserIds.has(msg.senderId) && (
                          <span className="border-bg bg-success absolute right-0 bottom-0 h-2 w-2 rounded-full border-2" />
                        )}
                      </div>
                    )}
                    <div className={`max-w-[70%] ${isMe ? "items-end" : ""}`}>
                      {!isMe && (
                        <p className="text-muted mb-0.5 text-[10px] font-medium">
                          {msg.senderName}
                        </p>
                      )}
                      <span
                        className={`inline-block rounded-xl px-3 py-1.5 text-sm ${
                          isMe ? "bg-brand text-brand-fg" : "bg-surface text-fg"
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
                <MessageInput
                  useNativeControls={useNativeControls}
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
              <SendButton
                useNativeControls={useNativeControls}
                onClick={handleSend}
                disabled={connectionState !== "online" || !input.trim()}
                label={t.send}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ChatRoomBaseView(props: ChatRoomBaseViewProps) {
  return (
    <Suspense fallback={<ChatRoomFallback />}>
      <ChatRoomContent {...props} />
    </Suspense>
  );
}
