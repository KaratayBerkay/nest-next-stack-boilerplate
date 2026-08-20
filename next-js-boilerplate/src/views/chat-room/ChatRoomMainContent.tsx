"use client";

import { useRef } from "react";
import { IconFolder } from "@tabler/icons-react";
import { IconButton } from "@/components/ui/button/icon-button";
import {
  HamburgerButton,
  MessageInput,
  SendButton,
  AttachButton,
  EmojiButton,
} from "@/views/chat-room/ChatRoomSubComponents";
import { ChatRoomMessageList } from "@/views/chat-room/ChatRoomMessageList";
import { ScrollToBottomButton } from "@/components/ui/ScrollToBottomButton";
import { ConnectionUnstable } from "@/components/ConnectionUnstable";
import { AttachmentModal } from "@/components/attachment-modal/AttachmentModal";
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
  room,
  roomCounts,
  connectionState,
  messages,
  userId,
  onlineUserIds,
  msgsLoading,
  msgsError,
  hasNextPage,
  onFetchNextPage,
  input,
  attaching,
  uploadItems,
  bottomRef,
  messagesRef,
  isAtBottom,
  onOpenGallery,
  t,
  tErr,
  onSetSidebarOpen,
  onSetInput,
  onSend,
  onAttachFiles,
  onRemoveUploadItem,
  onCancelUploads,
  onSendAttachments,
}: ChatRoomMainContentProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

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
    <div
      ref={chatWindowRef}
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border"
    >
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <HamburgerButton
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
        {onOpenGallery ? (
          <IconButton
            icon={<IconFolder size={18} />}
            label={t.allUploadsTitle}
            variant="ghost"
            size="icon-sm"
            onClick={onOpenGallery}
            className="ml-auto"
          />
        ) : null}
      </div>

      <ChatRoomMessageList
        ref={messagesRef}
        messages={messages}
        userId={userId}
        onlineUserIds={onlineUserIds}
        msgsLoading={msgsLoading}
        msgsError={msgsError}
        hasNextPage={hasNextPage}
        onFetchNextPage={onFetchNextPage}
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
          disabled={connectionState !== "online" || attaching}
          onAttachFile={onAttachFiles}
          label={t.attachFile}
        />
        <EmojiButton
          disabled={connectionState !== "online"}
          onEmojiSelect={(emoji) =>
            insertEmojiAtCursor(input, onSetInput, inputRef, emoji)
          }
          label={t.openEmojiPicker}
          chatWindowRef={chatWindowRef}
        />
        <div className="flex flex-1 flex-col">
          <MessageInput
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
          onClick={onSend}
          disabled={
            connectionState !== "online" ||
            attaching ||
            uploadItems.length > 0 ||
            !input.trim()
          }
          label={t.send}
        />
      </div>

      <AttachmentModal
        open={uploadItems.length > 0}
        items={uploadItems}
        t={t}
        onSend={onSendAttachments}
        onRemoveItem={onRemoveUploadItem}
        onAddFiles={onAttachFiles}
        onCancel={onCancelUploads}
      />
    </div>
  );
}
