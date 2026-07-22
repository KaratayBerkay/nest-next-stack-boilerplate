"use client";

import { useState, useCallback, Suspense, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { CHAT_ROOMS } from "@/constants/chat";
import { useYSwipeGesture } from "@/hooks/useYSwipeGesture";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { cn } from "@/lib/cn";
import { useQueryClient } from "@tanstack/react-query";
import { useRoom } from "@/lib/realtime/useRoom";
import { useConnectionState } from "@/hooks/useConnectionState";
import { useRouter } from "next/navigation";
import { ChatRoomFallback } from "@/fallbacks";
import { chatRoomHandleSend, selectChatRoom } from "@/views/chat-room/ChatRoomHandlers";
import { useChatRoomRealtime } from "@/views/chat-room/useChatRoomRealtime";
import { ChatRoomHeader } from "@/views/chat-room/ChatRoomHeader";
import { ChatRoomSidebar } from "@/views/chat-room/ChatRoomSidebar";
import { ChatRoomMainContent } from "@/views/chat-room/ChatRoomMainContent";
import type { ChatRoomBaseViewProps } from "@/types/chat-room/ChatRoomBaseView-types";

function ChatRoomContent({
  initialRoom = "general",
  showPageInfo = false,
  vipRooms = [],
  useNativeControls = false,
  showSelfCrown = false,
  className,
}: ChatRoomBaseViewProps) {
  const t = useMessages("chat-room");
  const tErr = useMessages("error");
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

  const realtime = useChatRoomRealtime(room, setRoomCounts, setRoomMembers);
  const {
    data: messages = [],
    isLoading: msgsLoading,
    isError: msgsError,
  } = useRoom(room);
  const messagesRef = useYSwipeGesture<HTMLDivElement>();
  const { bottomRef, scrollToBottom, isAtBottom } = useAutoScroll(messages);

  const handleSend = useCallback(
    () =>
      chatRoomHandleSend(
        input, realtime, room, queryClient, user, setInput, scrollToBottom,
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
    <div className={cn("flex min-h-0 w-full flex-1 flex-col gap-6 overflow-hidden", className)}>
      <ChatRoomHeader user={user} connectionState={connectionState} showPageInfo={showPageInfo} t={t} />

      <div className="relative flex min-h-0 flex-1 gap-4">
        {sidebarOpen && (
          <div
            className="bg-overlay/30 fixed inset-0 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <ChatRoomSidebar
          useNativeControls={useNativeControls}
          sidebarOpen={sidebarOpen}
          rooms={rooms}
          room={room}
          roomCounts={roomCounts}
          vipRooms={vipRooms}
          roomMembers={roomMembers}
          user={user}
          showSelfCrown={showSelfCrown}
          t={t}
          onSetSidebarOpen={setSidebarOpen}
          onSelectRoom={selectRoom}
        />

        <ChatRoomMainContent
          useNativeControls={useNativeControls}
          room={room}
          roomCounts={roomCounts}
          connectionState={connectionState}
          messages={messages}
          userId={user.id}
          onlineUserIds={onlineUserIds}
          msgsLoading={msgsLoading}
          msgsError={msgsError}
          input={input}
          bottomRef={bottomRef}
          messagesRef={messagesRef as unknown as React.RefObject<HTMLDivElement | null>}
          isAtBottom={isAtBottom}
          t={t}
          tErr={tErr}
          onSetSidebarOpen={setSidebarOpen}
          onSetInput={setInput}
          onSend={handleSend}
        />
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
