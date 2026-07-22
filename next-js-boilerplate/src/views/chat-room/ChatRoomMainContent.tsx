"use client";

import { HamburgerButton, MessageInput, SendButton } from "@/views/chat-room/ChatRoomSubComponents";
import { ChatRoomMessageList } from "@/views/chat-room/ChatRoomMessageList";
import { ScrollToBottomButton } from "@/components/ui/ScrollToBottomButton";
import { ConnectionUnstable } from "@/components/ConnectionUnstable";

interface ChatRoomMainContentProps {
  useNativeControls: boolean;
  room: string;
  roomCounts: Record<string, number>;
  connectionState: string;
  messages: { id: string; senderId: string; senderName: string; body: string }[];
  userId: string;
  onlineUserIds: Set<string>;
  msgsLoading: boolean;
  msgsError: boolean;
  input: string;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  messagesRef: React.RefObject<HTMLDivElement | null>;
  isAtBottom: boolean;
  t: Record<string, string>;
  tErr: Record<string, string>;
  onSetSidebarOpen: (open: boolean) => void;
  onSetInput: (value: string) => void;
  onSend: () => void;
}

export function ChatRoomMainContent({
  useNativeControls,
  room,
  roomCounts,
  connectionState,
  messages,
  userId,
  onlineUserIds,
  msgsLoading,
  msgsError,
  input,
  bottomRef,
  messagesRef,
  isAtBottom,
  t,
  tErr,
  onSetSidebarOpen,
  onSetInput,
  onSend,
}: ChatRoomMainContentProps) {
  if (connectionState === "locked") {
    return (
      <ConnectionUnstable
        title={tErr.tabLocked}
        description={tErr.tabLockedDescription}
      />
    );
  }
  if (connectionState === "unstable") {
    return (
      <ConnectionUnstable
        title={t.disconnected}
        description={t.connecting}
      />
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <HamburgerButton
          useNativeControls={useNativeControls}
          onClick={() => onSetSidebarOpen(true)}
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

      <ChatRoomMessageList
        ref={messagesRef}
        messages={messages}
        userId={userId}
        onlineUserIds={onlineUserIds}
        msgsLoading={msgsLoading}
        msgsError={msgsError}
        t={t}
      />
      <div ref={bottomRef} className="h-px" />

      {!isAtBottom && messages.length > 0 && (
        <ScrollToBottomButton onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })} />
      )}

      <div className="flex gap-2 border-t p-2">
        <div className="flex flex-1 flex-col">
          <MessageInput
            useNativeControls={useNativeControls}
            value={input}
            onChange={(e) => onSetInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
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
          onClick={onSend}
          disabled={connectionState !== "online" || !input.trim()}
          label={t.send}
        />
      </div>
    </div>
  );
}
