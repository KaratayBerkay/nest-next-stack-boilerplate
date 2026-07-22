"use client";

import { forwardRef } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { SkeletonChatMessage } from "@/components/ui/skeleton-shapes";
import { initials } from "@/lib/initials";

interface ChatRoomMessageListProps {
  messages: { id: string; senderId: string; senderName: string; body: string }[];
  userId: string;
  onlineUserIds: Set<string>;
  msgsLoading: boolean;
  msgsError: boolean;
  t: Record<string, string>;
}

export const ChatRoomMessageList = forwardRef<HTMLDivElement, ChatRoomMessageListProps>(
  function ChatRoomMessageList(
    { messages, userId, onlineUserIds, msgsLoading, msgsError, t },
    ref,
  ) {
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
        {messages.map((msg, i) => {
          const isMe = msg.senderId === userId;
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
                <span
                  className={`inline-block rounded-xl px-3 py-1.5 text-sm ${
                    isMe ? "bg-brand text-brand-fg" : "bg-surface text-fg"
                  }`}
                >
                  {msg.body}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  },
);
