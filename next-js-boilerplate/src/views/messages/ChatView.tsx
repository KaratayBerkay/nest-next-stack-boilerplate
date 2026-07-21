"use client";

import {
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useYSwipeGesture } from "@/hooks/useYSwipeGesture";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { useConversation } from "@/lib/realtime/useConversation";
import { sendMessageSchema } from "@/validators/messages/schema";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ScrollToBottomButton } from "@/components/ui/ScrollToBottomButton";
import { LoadEarlierButton } from "@/components/LoadEarlierButton";
import { ConnectionUnstable } from "@/components/ConnectionUnstable";
import { MessageTick } from "@/components/MessageTick";
import { initials } from "@/lib/initials";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { IconChevronLeft } from "@tabler/icons-react";
import { IconButton } from "@/components/ui/button/icon-button";
import type { ChatViewProps, Message } from "@/types/messages/ChatView-types";
import { useMessageActions } from "@/api/client/messages/actions";

async function chatViewHandleSend(
  selectedUser: { id: string } | null,
  input: string,
  sendMessage: (recipientId: string, text: string) => Promise<void>,
  setInput: Dispatch<SetStateAction<string>>,
  setMessageError: Dispatch<SetStateAction<string | null>>,
  scrollToBottom: () => void,
) {
  if (!selectedUser) return;
  const parsed = sendMessageSchema.safeParse({ text: input });
  if (!parsed.success) {
    setMessageError(parsed.error.issues[0]?.message ?? "Invalid message");
    return;
  }
  setMessageError(null);
  try {
    await sendMessage(selectedUser.id, parsed.data.text);
    setInput("");
    scrollToBottom();
  } catch {
    setMessageError("Failed to send message. Try again.");
  }
}

export function ChatView({
  selectedUser,
  user,
  setSelectedUser,
  setSidebarOpen,
  onlineUsers,
  connectionState,
}: ChatViewProps) {
  const t = useMessages("messages");
  const messagesRef = useYSwipeGesture<HTMLDivElement>();
  const [input, setInput] = useState("");
  const [messageError, setMessageError] = useState<string | null>(null);

  const {
    data: conversationData,
    fetchNextPage,
    hasNextPage,
    isError: msgsError,
  } = useConversation(selectedUser?.id ?? null);
  const conversationMessages =
    [...(conversationData?.pages ?? [])].reverse().flatMap((p) => p.messages) ??
    [];

  const { bottomRef, scrollToBottom, isAtBottom } = useAutoScroll(
    conversationMessages,
    !!selectedUser,
  );

  const { sendMessage } = useMessageActions();

  const handleSend = useCallback(
    () =>
      chatViewHandleSend(
        selectedUser,
        input,
        sendMessage,
        setInput,
        setMessageError,
        scrollToBottom,
      ),
    [selectedUser, input, sendMessage, scrollToBottom],
  );

  if (connectionState === "unstable") {
    return (
      <ConnectionUnstable title={t.disconnected} description={t.connecting} />
    );
  }

  if (connectionState === "connecting") {
    return (
      <div className="border-border bg-bg flex min-h-0 flex-1 flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border">
        <div className="border-border bg-surface h-8 w-48 animate-pulse rounded-lg border" />
        <div className="border-border bg-surface h-64 w-full max-w-md animate-pulse rounded-xl border" />
      </div>
    );
  }

  return (
    <div className="border-border bg-bg relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border">
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <IconButton
          icon={<IconChevronLeft size={18} />}
          label="Back to conversations"
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            setSelectedUser(null);
            setSidebarOpen(true);
          }}
          className="mr-1 md:hidden"
        />
        <div className="relative shrink-0">
          <Avatar
            fallback={initials(selectedUser.name ?? selectedUser.email ?? "?")}
            className="bg-brand text-brand-fg h-8 w-8 shrink-0 text-xs"
          />
          {onlineUsers.has(selectedUser.id) && (
            <span className="border-bg bg-success absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2" />
          )}
        </div>
        <span className="text-sm font-semibold">{selectedUser.name}</span>
      </div>
      <div
        ref={messagesRef}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4 select-text"
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
        {hasNextPage && <LoadEarlierButton onClick={() => fetchNextPage()} />}
        {conversationMessages.map((msg: Message, i) => {
          const isMe = msg.senderId === user.id;
          return (
            <div
              key={msg.id}
              className={`animate-fade-in-up flex ${isMe ? "justify-end" : "justify-start"}`}
              style={{ animationDelay: `${i * 15}ms` }}
            >
              <div className="flex max-w-[75%] items-end gap-1.5">
                {!isMe && (
                  <Avatar
                    fallback={initials(
                      selectedUser.name ?? selectedUser.email ?? "?",
                    )}
                    className="bg-brand text-brand-fg mb-0.5 h-6 w-6 shrink-0 text-[9px]"
                  />
                )}
                <span
                  className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    isMe ? "bg-brand text-brand-fg" : "bg-surface text-fg"
                  }`}
                >
                  {msg.body}
                </span>
                {isMe && (
                  <span className="shrink-0 self-end pb-1">
                    {msg.readAt ? (
                      <MessageTick status="read" />
                    ) : msg.deliveredAt ? (
                      <MessageTick status="delivered" />
                    ) : (
                      <MessageTick status="sent" />
                    )}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} className="h-px" />
      </div>
      {!isAtBottom && !input && conversationMessages.length > 0 && (
        <ScrollToBottomButton onClick={scrollToBottom} />
      )}
      <div className="flex gap-3 border-t px-4 py-3">
        <div className="flex flex-1 flex-col">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              connectionState === "online" ? t.inputPlaceholder : t.connecting
            }
            disabled={connectionState !== "online"}
            className="bg-surface text-fg focus:border-fg rounded-xl px-4 py-2.5"
          />
          {messageError && (
            <p className="text-error mt-1.5 text-xs">{messageError}</p>
          )}
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={handleSend}
          disabled={connectionState !== "online" || !input.trim()}
          className="self-end rounded-xl px-5 py-2.5"
        >
          Send
        </Button>
      </div>
    </div>
  );
}
