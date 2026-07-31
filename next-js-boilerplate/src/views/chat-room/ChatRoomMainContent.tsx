"use client";

import { useRef } from "react";
import {
  HamburgerButton,
  MessageInput,
  SendButton,
  AttachButton,
  EmojiButton,
  PendingAttachmentChip,
} from "@/views/chat-room/ChatRoomSubComponents";
import { ChatRoomMessageList } from "@/views/chat-room/ChatRoomMessageList";
import { ScrollToBottomButton } from "@/components/ui/ScrollToBottomButton";
import { ConnectionUnstable } from "@/components/ConnectionUnstable";
import type { ChatRoomMainContentProps } from "@/types/chat-room/ChatRoomMainContent-types";

function insertEmojiAtCursor(
  input: string,
  setInput: (value: string) => void,
  inputRef: React.RefObject<HTMLInputElement | null>,
  emoji: string,
) {
  const el = inputRef.current;
  const start = el?.selectionStart ?? input.length;
  const end = el?.selectionEnd ?? start;
  const next = input.slice(0, start) + emoji + input.slice(end);
  setInput(next);
  requestAnimationFrame(() => {
    const node = inputRef.current;
    if (!node) return;
    const pos = start + emoji.length;
    node.setSelectionRange(pos, pos);
  });
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
  attaching,
  pendingAttachment,
  bottomRef,
  messagesRef,
  isAtBottom,
  t,
  tErr,
  onSetSidebarOpen,
  onSetInput,
  onSend,
  onAttachFile,
  onRemoveAttachment,
}: ChatRoomMainContentProps) {
  const inputRef = useRef<HTMLInputElement>(null);

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
      <ConnectionUnstable title={t.disconnected} description={t.connecting} />
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
            {t.countOnline.replace("{count}", String(roomCounts[room] ?? 0))}
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
        bottomRef={bottomRef}
        t={t}
      />

      {!isAtBottom && messages.length > 0 && (
        <ScrollToBottomButton
          onClick={() =>
            bottomRef.current?.scrollIntoView({ behavior: "smooth" })
          }
        />
      )}

      <div className="flex gap-2 border-t p-2">
        <AttachButton
          useNativeControls={useNativeControls}
          disabled={connectionState !== "online" || attaching}
          onAttachFile={onAttachFile}
          label={t.attachFile}
        />
        <EmojiButton
          useNativeControls={useNativeControls}
          disabled={connectionState !== "online"}
          onEmojiSelect={(emoji) =>
            insertEmojiAtCursor(input, onSetInput, inputRef, emoji)
          }
          label={t.openEmojiPicker}
        />
        <div className="flex flex-1 flex-col">
          {pendingAttachment && (
            <div className="mb-1 flex items-center gap-2">
              <PendingAttachmentChip
                attachment={pendingAttachment}
                onRemove={onRemoveAttachment}
                label={t.removeAttachment}
              />
              {attaching && (
                <span className="text-muted animate-pulse text-xs">
                  {t.uploading}
                </span>
              )}
            </div>
          )}
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
            inputRef={inputRef}
          />
        </div>
        <SendButton
          useNativeControls={useNativeControls}
          onClick={onSend}
          disabled={
            connectionState !== "online" ||
            attaching ||
            (!input.trim() && !pendingAttachment)
          }
          label={t.send}
        />
      </div>
    </div>
  );
}
