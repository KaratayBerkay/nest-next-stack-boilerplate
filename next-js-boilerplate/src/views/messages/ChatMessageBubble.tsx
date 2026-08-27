"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { MessageTick } from "@/components/MessageTick";
import { AttachmentPreview } from "@/components/AttachmentPreview";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { IconButton } from "@/components/ui/button/icon-button";
import { IconDotsVertical, IconBan } from "@tabler/icons-react";
import { initials } from "@/lib/initials";
import { formatMessageTime } from "@/views/messages/ChatView-utils";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { DELETE_FOR_EVERYONE_WINDOW_MS } from "@/constants/messages";
import type { ChatMessageBubbleProps } from "@/types/messages/ChatMessageBubble-types";

export function ChatMessageBubble({
  msg,
  isMe,
  userName,
  userEmail,
  userAvatarUrl,
  dateDisplay,
  onDelete,
  onReply,
}: ChatMessageBubbleProps) {
  const t = useMessages("messages");
  // Lazy initializer isolates the impure Date.now() read to component mount
  // instead of every render (react-hooks/purity) — the delete window is a
  // soft UI gate anyway (the server re-checks it), so "current as of when
  // this bubble first appeared" is close enough.
  const [renderedAt] = useState(() => Date.now());
  const isDeleted = !!msg.deletedAt;
  const decryptionFailed =
    !isDeleted &&
    (msg.body == null || msg.body === "") &&
    !msg.attachments?.length;
  const canDeleteForEveryone =
    isMe &&
    renderedAt - new Date(msg.createdAt).getTime() <
      DELETE_FOR_EVERYONE_WINDOW_MS;
  const showActions = !isDeleted && !msg.pending && !msg.failed;
  // A DM only ever has 2 participants, so the current viewer's id is
  // whichever of sender/recipient this message's own `isMe` didn't already
  // resolve to — no separate viewer-id prop needed just for this.
  const currentUserId = isMe ? msg.senderId : msg.recipientId;
  const isReplyToMe = msg.replyTo?.senderId === currentUserId;
  const replySenderLabel = isReplyToMe ? t.you : userName || userEmail;
  const replyPreviewText = !msg.replyTo
    ? null
    : msg.replyTo.deletedAt
      ? t.deletedMessage
      : msg.replyTo.body
        ? msg.replyTo.body
        : msg.replyTo.hasAttachments
          ? t.attachmentPreview
          : t.decryptionFailed;

  return (
    <div
      className={`animate-fade-in-up group flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}
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
        {isDeleted ? (
          <span className="bg-surface text-muted inline-block rounded-2xl px-4 py-2.5 text-sm leading-relaxed">
            <span className="inline-flex items-center gap-1.5 text-xs italic">
              <IconBan size={13} stroke={1.75} />
              <span>{t.deletedMessage}</span>
            </span>
          </span>
        ) : (
          <>
            {msg.replyTo && (
              <div className="bg-surface border-l-brand max-w-full rounded-lg border-l-2 px-2.5 py-1.5">
                <div className="text-brand truncate text-[11px] font-medium">
                  {replySenderLabel}
                </div>
                <div className="text-muted truncate text-xs">
                  {replyPreviewText}
                </div>
              </div>
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
                  <span>{"🔒"}</span>
                  <span>{t.decryptionFailed}</span>
                </span>
              </span>
            ) : null}
          </>
        )}
        <div
          className={`flex items-center gap-1 px-1 ${isMe ? "flex-row-reverse" : ""}`}
        >
          <span className="text-muted text-[10px]">
            {formatMessageTime(msg.createdAt, dateDisplay)}
          </span>
          {isMe && (
            <MessageTick
              status={
                msg.failed
                  ? "failed"
                  : msg.readAt
                    ? "read"
                    : msg.deliveredAt
                      ? "delivered"
                      : "sent"
              }
              failedLabel={t.messageFailedToSend}
            />
          )}
        </div>
      </div>
      {showActions && (
        <ConfirmDialog
          title={t.deleteForEveryoneConfirmTitle}
          description={t.deleteForEveryoneConfirmDescription}
          confirmLabel={t.deleteForEveryone}
          onConfirm={() => onDelete(msg.id, "everyone")}
        >
          {(openDeleteForEveryone) => (
            <div
              className={`self-center opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 ${
                isMe ? "order-first" : "order-last"
              }`}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <IconButton
                    icon={<IconDotsVertical size={16} stroke={1.5} />}
                    label={t.messageActions}
                    size="icon-xs"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onReply(msg)}>
                    {t.reply}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(msg.id, "me")}>
                    {t.deleteForMe}
                  </DropdownMenuItem>
                  {canDeleteForEveryone && (
                    <DropdownMenuItem
                      className="text-error"
                      onClick={openDeleteForEveryone}
                    >
                      {t.deleteForEveryone}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </ConfirmDialog>
      )}
    </div>
  );
}
