"use client";

import { Avatar } from "@/components/ui/Avatar";
import { MessageTick } from "@/components/MessageTick";
import { initials } from "@/lib/initials";
import { formatMessageTime } from "@/views/messages/ChatView-utils";
import type { ChatMessageBubbleProps } from "@/types/messages/ChatMessageBubble-types";

export function ChatMessageBubble({
  msg,
  isMe,
  userName,
  userEmail,
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
            fallback={initials(userName ?? userEmail ?? "?")}
            className="bg-brand text-brand-fg h-7 w-7 text-[9px]"
          />
        </div>
      )}
      <div
        className={`flex max-w-[70%] flex-col gap-0.5 ${isMe ? "items-end" : ""}`}
      >
        <span
          className={`inline-block rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isMe ? "bg-brand text-brand-fg" : "bg-surface text-fg"
          }`}
        >
          {msg.body}
        </span>
        <div
          className={`flex items-center gap-1 px-1 ${isMe ? "flex-row-reverse" : ""}`}
        >
          <span className="text-muted text-[10px]">
            {formatMessageTime(msg.createdAt, dateDisplay)}
          </span>
          {isMe && (
            <MessageTick
              status={
                msg.readAt
                  ? "read"
                  : msg.deliveredAt
                    ? "delivered"
                    : "sent"
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
