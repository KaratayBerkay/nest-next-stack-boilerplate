"use client";

import { Avatar } from "@/components/ui/Avatar";
import { MessageTick } from "@/components/MessageTick";
import { AttachmentPreview } from "@/components/AttachmentPreview";
import { initials } from "@/lib/initials";
import { formatMessageTime } from "@/views/messages/ChatView-utils";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { ChatMessageBubbleProps } from "@/types/messages/ChatMessageBubble-types";

export function ChatMessageBubble({
  msg,
  isMe,
  userName,
  userEmail,
  userAvatarUrl,
  dateDisplay,
}: ChatMessageBubbleProps) {
  const t = useMessages("messages");
  const decryptionFailed =
    (msg.body == null || msg.body === "") && !msg.attachments?.length;
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
        {msg.attachments?.length ? (
          <div className="flex flex-col gap-2">
            {msg.attachments.map((att) => (
              <AttachmentPreview
                key={att.url}
                url={att.url}
                type={att.type}
                name={att.name}
                size={att.size}
              />
            ))}
          </div>
        ) : null}
        {msg.body != null && msg.body !== "" ? (
          <span
            className={`inline-block rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              isMe ? "bg-brand text-brand-fg" : "bg-surface text-fg"
            }`}
          >
            {msg.body}
          </span>
        ) : decryptionFailed ? (
          <span
            className={`inline-block rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              isMe
                ? "bg-warning/10 text-warning-foreground"
                : "bg-warning/10 text-warning-foreground"
            }`}
          >
            <span className="inline-flex items-center gap-1.5 text-xs italic">
              <span>{"\uD83D\uDD12"}</span>
              <span>{t.decryptionFailed}</span>
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
