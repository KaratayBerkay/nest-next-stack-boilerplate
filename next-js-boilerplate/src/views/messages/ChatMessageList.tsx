"use client";

import { LoadEarlierButton } from "@/components/LoadEarlierButton";
import { ChatMessageBubble } from "@/views/messages/ChatMessageBubble";
import type { ChatMessageListProps } from "@/types/messages/ChatMessageList-types";

export function ChatMessageList({
  messagesRef,
  msgsError,
  hasNextPage,
  onFetchNextPage,
  groupedMessages,
  conversationMessages,
  user,
  selectedUser,
  dateDisplay,
  bottomRef,
  t,
}: ChatMessageListProps) {
  return (
    <div
      ref={messagesRef}
      className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-5 select-text"
    >
      {msgsError && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-error text-sm">{t.failedToLoad}</p>
        </div>
      )}
      {!msgsError && conversationMessages.length === 0 && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted text-sm">{t.noMessages}</p>
        </div>
      )}
      {hasNextPage && <LoadEarlierButton onClick={() => onFetchNextPage()} />}
      {groupedMessages.map((group) => (
        <div key={group.date} className="flex flex-col gap-1">
          <div className="flex justify-center py-2">
            <span className="bg-surface text-muted rounded-full px-3 py-1 text-[10px]">
              {group.date === new Date().toLocaleDateString()
                ? "Today"
                : group.date}
            </span>
          </div>
          {group.messages.map((msg) => (
            <ChatMessageBubble
              key={msg.id}
              msg={msg}
              isMe={msg.senderId === user.id}
              userName={selectedUser.name ?? selectedUser.email ?? "?"}
              userEmail={selectedUser.email ?? "?"}
              dateDisplay={dateDisplay}
            />
          ))}
        </div>
      ))}
      <div ref={bottomRef} className="h-px" />
    </div>
  );
}
