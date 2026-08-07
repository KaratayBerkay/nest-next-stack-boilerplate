"use client";

import { forwardRef } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { SkeletonChatMessage } from "@/components/ui/skeleton-shapes";
import { AttachmentPreview } from "@/components/AttachmentPreview";
import { initials } from "@/lib/initials";
import type { ChatRoomMessageListProps } from "@/types/views/chat-room/ChatRoomMessageList-types";

export const ChatRoomMessageList = forwardRef<
  HTMLDivElement,
  ChatRoomMessageListProps
>(function ChatRoomMessageList(
  { messages, userId, onlineUserIds, msgsLoading, msgsError, bottomRef, t },
  ref,
) {
  const hasDecryptionFailure = messages.some(
    (m) => (m.body == null || m.body === "") && !m.attachments?.length,
  );

  return (
    <div
      ref={ref}
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
      {!msgsLoading && !msgsError && hasDecryptionFailure && (
        <div className="bg-warning/10 border-warning/30 text-warning-foreground rounded-lg border px-3 py-2 text-center text-xs">
          {t.decryptionFailed}
        </div>
      )}
      {messages.map((msg, i) => {
        const isMe = msg.senderId === userId;
        const decryptionFailed =
          (msg.body == null || msg.body === "") && !msg.attachments?.length;
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
              {msg.attachments?.length ? (
                <div className="flex flex-wrap gap-2">
                  {msg.attachments.map((att) => (
                    <AttachmentPreview
                      key={att.url}
                      url={att.url}
                      type={att.type}
                      name={att.name}
                      size={att.size}
                      thumbnailUrl={att.thumbnailUrl}
                    />
                  ))}
                </div>
              ) : null}
              {msg.body != null && msg.body !== "" ? (
                <span
                  className={`inline-block rounded-xl px-3 py-1.5 text-sm ${
                    isMe ? "bg-brand text-brand-fg" : "bg-surface text-fg"
                  }`}
                >
                  {msg.body}
                </span>
              ) : (
                <span
                  className={`inline-block rounded-xl px-3 py-1.5 text-sm ${
                    decryptionFailed
                      ? "bg-warning/10 text-warning-foreground"
                      : isMe
                        ? "bg-brand text-brand-fg"
                        : "bg-surface text-fg"
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5 text-xs italic">
                    <span>{"\uD83D\uDD12"}</span>
                    <span>{decryptionFailed ? t.decryptionFailed : ""}</span>
                  </span>
                </span>
              )}
            </div>
          </div>
        );
      })}
      {/* Sentinel must be the LAST child INSIDE the scrollable container —
            scrollIntoView only works when the sentinel has a scrollable
            ancestor. As a sibling of this div it was a no-op. */}
      <div ref={bottomRef} className="h-px" />
    </div>
  );
});
