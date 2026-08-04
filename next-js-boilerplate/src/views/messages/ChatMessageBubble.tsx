"use client";

import { Avatar } from "@/components/ui/Avatar";
import { MessageTick } from "@/components/MessageTick";
import { AttachmentPreview } from "@/components/AttachmentPreview";
import { initials } from "@/lib/initials";
import { formatMessageTime } from "@/views/messages/ChatView-utils";
import type { ChatMessageBubbleProps } from "@/types/messages/ChatMessageBubble-types";

export function ChatMessageBubble({
  msg,
  isMe,
  userName,
  userEmail,
  userAvatarUrl,
  dateDisplay,
}: ChatMessageBubbleProps) {
  return (
    <div
      className={`animate-fade-in-up flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}
      style={{ animationDelay: "0ms" }}
    >
      {!isMe && (
        <div className="relative mb-5 shrink-0">
          <Avatar
            src={userAvatarUrl ?? undefined}
            fallback={initials(userName ?? userEmail ?? "?")}
            className="bg-brand text-brand-fg h-7 w-7 text-[9px]"
          />
        </div>
      )}
      <div
        className={`flex max-w-[70%] flex-col gap-0.5 ${isMe ? "items-end" : ""}`}
      >
        {msg.attachmentUrl && (
          <AttachmentPreview
            url={msg.attachmentUrl}
            type={msg.attachmentType}
            name={msg.attachmentName}
          />
        )}
        {msg.body != null && msg.body !== "" ? (
          <span
            className={`inline-block rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              isMe ? "bg-brand text-brand-fg" : "bg-surface text-fg"
            }`}
          >
            {msg.body}
          </span>
        ) : msg.encrypted ? (
          <span
            className={`inline-block rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              isMe ? "bg-brand text-brand-fg" : "bg-surface text-fg"
            }`}
          >
            <span className="text-muted inline-flex items-center gap-1.5 text-xs italic">
              <span>{"\uD83D\uDD12"}</span>
              <span>
                {msg.needsRekey
                  ? "Re-syncing keys\u2026"
                  : "Waiting for key exchange\u2026"}
              </span>
            </span>
          </span>
        ) : null}
        <div
          className={`flex items-center gap-1 px-1 ${isMe ? "flex-row-reverse" : ""}`}
        >
          <span className="text-muted text-[10px]">
            {formatMessageTime(msg.createdAt, dateDisplay)}
          </span>
          {isMe && (
            <MessageTick
              status={
                msg.readAt ? "read" : msg.deliveredAt ? "delivered" : "sent"
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
