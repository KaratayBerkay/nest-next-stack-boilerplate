"use client";

import { forwardRef, useState } from "react";
import { IconBan, IconDotsVertical } from "@tabler/icons-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { IconButton } from "@/components/ui/button/icon-button";
import { DELETE_FOR_EVERYONE_WINDOW_MS } from "@/constants/messages";
import { Avatar } from "@/components/ui/Avatar";
import { SkeletonChatMessage } from "@/components/ui/skeleton-shapes";
import { AttachmentPreview } from "@/components/AttachmentPreview";
import { ChatLinkCard } from "@/components/ChatLinkCard";
import { extractLinks } from "@/lib/chat/link-preview";
import { LoadEarlierButton } from "@/components/LoadEarlierButton";
import { initials } from "@/lib/initials";
import type { ChatRoomMessageListProps } from "@/types/views/chat-room/ChatRoomMessageList-types";

export const ChatRoomMessageList = forwardRef<
  HTMLDivElement,
  ChatRoomMessageListProps
>(function ChatRoomMessageList(
  {
    messages,
    userId,
    onlineUserIds,
    msgsLoading,
    msgsError,
    hasNextPage,
    onFetchNextPage,
    bottomRef,
    t,
    onReply,
    onDelete,
  },
  ref,
) {
  // Delete-for-everyone window is a soft UI gate (the server re-checks it) —
  // "as of when this list mounted" is close enough, same as the DM bubble.
  const [renderedAt] = useState(() => Date.now());
  const hasDecryptionFailure = messages.some(
    (m) =>
      !m.deletedAt &&
      (m.body == null || m.body === "") &&
      !m.attachments?.length,
  );
  const replyPreviewText = (msg: (typeof messages)[number]) =>
    !msg.replyTo
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
      ref={ref}
      className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3 select-text"
    >
      {msgsError && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-error text-xs">{t.failedToLoad}</p>
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
        <div className="bg-warning/10 border-warning/30 text-warning rounded-lg border px-3 py-2 text-center text-xs">
          {t.decryptionFailed}
        </div>
      )}
      {hasNextPage && <LoadEarlierButton onClick={() => onFetchNextPage()} />}
      {messages.map((msg, i) => {
        const isMe = msg.senderId === userId;
        const isDeleted = !!msg.deletedAt;
        const decryptionFailed =
          !isDeleted &&
          (msg.body == null || msg.body === "") &&
          !msg.attachments?.length;
        const showActions =
          !!onDelete && !!onReply && !isDeleted && !msg.pending && !msg.failed;
        const canDeleteForEveryone =
          isMe &&
          renderedAt - new Date(msg.createdAt).getTime() <
            DELETE_FOR_EVERYONE_WINDOW_MS;
        return (
          <div
            key={msg.id}
            className={`animate-fade-in-up group flex items-start gap-2 ${isMe ? "flex-row-reverse" : ""}`}
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
              {isDeleted ? (
                <span
                  className={`inline-block rounded-xl px-3 py-1.5 text-sm ${
                    isMe ? "bg-brand/60 text-brand-fg" : "bg-surface text-muted"
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5 text-xs italic">
                    <IconBan size={13} stroke={1.75} />
                    <span>{t.deletedMessage}</span>
                  </span>
                </span>
              ) : null}
              {!isDeleted && msg.replyTo ? (
                <div className="bg-surface border-l-brand mb-1 max-w-full rounded-lg border-l-2 px-2.5 py-1.5">
                  <div className="text-brand truncate text-[11px] font-medium">
                    {msg.replyTo.senderId === userId
                      ? t.you
                      : (msg.replyTo.senderName ?? "")}
                  </div>
                  <div className="text-muted truncate text-xs">
                    {replyPreviewText(msg)}
                  </div>
                </div>
              ) : null}
              {!isDeleted && msg.attachments?.length ? (
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
              {!isDeleted && msg.body != null && msg.body !== "" ? (
                <>
                  <span
                    className={`inline-block rounded-xl px-3 py-1.5 text-sm ${
                      isMe ? "bg-brand text-brand-fg" : "bg-surface text-fg"
                    }`}
                  >
                    {msg.body}
                  </span>
                  {extractLinks(msg.body).map((link) => (
                    <div key={link.url} className="mt-1">
                      <ChatLinkCard url={link.url} clickable={link.clickable} />
                    </div>
                  ))}
                </>
              ) : decryptionFailed ? (
                <span className="bg-warning/10 text-warning inline-block rounded-xl px-3 py-1.5 text-sm">
                  <span className="inline-flex items-center gap-1.5 text-xs italic">
                    <span>{"\uD83D\uDD12"}</span>
                    <span>{t.decryptionFailed}</span>
                  </span>
                </span>
              ) : null}
              {msg.failed && (
                <p className="text-error mt-0.5 text-[10px]">
                  {t.messageFailedToSend}
                </p>
              )}
            </div>
            {showActions && (
              <ConfirmDialog
                title={t.deleteForEveryoneConfirmTitle}
                description={t.deleteForEveryoneConfirmDescription}
                confirmLabel={t.deleteForEveryone}
                onConfirm={() => onDelete(msg.id, "everyone")}
              >
                {(openDeleteForEveryone) => (
                  <div className="self-center opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
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
                        <DropdownMenuItem
                          onClick={() => onDelete(msg.id, "me")}
                        >
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
      })}
      {/* Sentinel must be the LAST child INSIDE the scrollable container —
            scrollIntoView only works when the sentinel has a scrollable
            ancestor. As a sibling of this div it was a no-op. */}
      <div ref={bottomRef} className="h-px" />
    </div>
  );
});
