"use client";

import {
  useState,
  useCallback,
  useMemo,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useYSwipeGesture } from "@/hooks/useYSwipeGesture";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { useConversation } from "@/lib/realtime/useConversation";
import { sendMessageSchema } from "@/validators/messages/schema";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ScrollToBottomButton } from "@/components/ui/ScrollToBottomButton";
import { LoadEarlierButton } from "@/components/LoadEarlierButton";
import { ConnectionUnstable } from "@/components/ConnectionUnstable";
import { MessageTick } from "@/components/MessageTick";
import { initials } from "@/lib/initials";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useDateDisplayCookie } from "@/hooks/useDateDisplayCookie";
import { formatDateByPreference } from "@/lib/date-time";
import { IconChevronLeft, IconPaperclip, IconSend } from "@tabler/icons-react";
import { IconButton } from "@/components/ui/button/icon-button";
import { cn } from "@/lib/cn";
import type { ChatViewProps, Message } from "@/types/messages/ChatView-types";
import type { DateDisplayFormat } from "@/constants/date-display";
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

function formatMessageTime(
  dateStr: string,
  dateDisplay: DateDisplayFormat,
): string {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (isToday) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return formatDateByPreference(dateStr, dateDisplay);
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
  const dateDisplay = useDateDisplayCookie();
  const messagesRef = useYSwipeGesture<HTMLDivElement>();
  const [input, setInput] = useState("");
  const [messageError, setMessageError] = useState<string | null>(null);

  const {
    data: conversationData,
    fetchNextPage,
    hasNextPage,
    isError: msgsError,
  } = useConversation(selectedUser?.id ?? null);
  const conversationMessages = useMemo(
    () =>
      [...(conversationData?.pages ?? [])]
        .reverse()
        .flatMap((p) => p.messages) ?? [],
    [conversationData],
  );

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

  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: Message[] }[] = [];
    for (const msg of conversationMessages) {
      const d = new Date(msg.createdAt);
      const date = isNaN(d.getTime()) ? "Unknown" : d.toLocaleDateString();
      const last = groups[groups.length - 1];
      if (last && last.date === date) {
        last.messages.push(msg);
      } else {
        groups.push({ date, messages: [msg] });
      }
    }
    return groups;
  }, [conversationMessages]);

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
      <div className="flex items-center gap-3 border-b px-5 py-3">
        <IconButton
          icon={<IconChevronLeft size={20} />}
          label="Back to conversations"
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            setSelectedUser(null);
            setSidebarOpen(true);
          }}
          className="mr-1 md:hidden"
        />
        <Avatar
          fallback={initials(selectedUser.name ?? selectedUser.email ?? "?")}
          className={cn(
            "bg-brand text-brand-fg h-10 w-10 shrink-0 text-xs",
            onlineUsers.has(selectedUser.id) &&
              "ring-success ring-offset-bg ring-2 ring-offset-2",
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold">
              {selectedUser.name}
            </span>
            {onlineUsers.has(selectedUser.id) && (
              <span className="bg-success h-2 w-2 shrink-0 rounded-full" />
            )}
          </div>
          <p className="text-muted text-xs">
            {onlineUsers.has(selectedUser.id) ? "Active Now" : "Offline"}
          </p>
        </div>
      </div>

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
        {hasNextPage && <LoadEarlierButton onClick={() => fetchNextPage()} />}
        {groupedMessages.map((group) => (
          <div key={group.date} className="flex flex-col gap-1">
            <div className="flex justify-center py-2">
              <span className="bg-surface text-muted rounded-full px-3 py-1 text-[10px]">
                {group.date === new Date().toLocaleDateString()
                  ? "Today"
                  : group.date}
              </span>
            </div>
            {group.messages.map((msg: Message) => {
              const isMe = msg.senderId === user.id;
              return (
                <div
                  key={msg.id}
                  className={`animate-fade-in-up flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}
                  style={{ animationDelay: "0ms" }}
                >
                  {!isMe && (
                    <div className="relative mb-5 shrink-0">
                      <Avatar
                        fallback={initials(
                          selectedUser.name ?? selectedUser.email ?? "?",
                        )}
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
            })}
          </div>
        ))}
        <div ref={bottomRef} className="h-px" />
      </div>

      {!isAtBottom && !input && conversationMessages.length > 0 && (
        <ScrollToBottomButton onClick={scrollToBottom} />
      )}

      <div className="flex items-end gap-3 border-t px-5 py-4">
        <IconButton
          icon={<IconPaperclip size={20} />}
          label="Attach file"
          variant="ghost"
          size="icon-sm"
          disabled
          className="text-muted shrink-0"
        />
        <div className="flex flex-1 flex-col">
          <input
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
            className="bg-surface text-fg placeholder:text-muted focus:ring-brand/30 w-full rounded-lg border-0 px-4 py-3 text-sm focus:ring-1 focus:outline-none"
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
          className="flex shrink-0 items-center gap-2 rounded-lg px-4 py-3"
        >
          <span className="hidden sm:inline">Send</span>
          <IconSend size={16} />
        </Button>
      </div>
    </div>
  );
}
