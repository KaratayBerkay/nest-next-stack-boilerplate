"use client";

import { useState, useCallback, useMemo } from "react";
import { useYSwipeGesture } from "@/hooks/useYSwipeGesture";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { useConversation } from "@/lib/realtime/useConversation";
import { ScrollToBottomButton } from "@/components/ui/ScrollToBottomButton";
import { ConnectionUnstable } from "@/components/ConnectionUnstable";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useDateDisplayCookie } from "@/hooks/useDateDisplayCookie";
import type { ChatViewProps } from "@/types/messages/ChatView-types";
import {
  useMessageActions,
  useMessageUpload,
} from "@/api/client/messages/actions";
import { useTypingUsers } from "@/hooks/useTypingUsers";
import {
  chatViewHandleSend,
  groupMessagesByDate,
} from "@/views/messages/ChatView-utils";
import { ChatViewHeader } from "@/views/messages/ChatViewHeader";
import { ChatInputBar } from "@/views/messages/ChatInputBar";
import { ChatMessageList } from "@/views/messages/ChatMessageList";
import type { MessageAttachment } from "@/types/messages/MessageAttachment-types";

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
  const [pendingAttachment, setPendingAttachment] =
    useState<MessageAttachment | null>(null);
  const [attaching, setAttaching] = useState(false);

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
  const { typingUsers, sendTypingStart, sendTypingStop } = useTypingUsers();
  const { uploadAttachment } = useMessageUpload();

  const handleSend = useCallback(
    () =>
      chatViewHandleSend(
        selectedUser,
        input,
        sendMessage,
        setInput,
        setMessageError,
        scrollToBottom,
        setPendingAttachment,
        pendingAttachment ?? undefined,
      ),
    [selectedUser, input, sendMessage, scrollToBottom, pendingAttachment],
  );

  const handleAttachFile = useCallback(
    async (file: File) => {
      if (!selectedUser) return;
      setAttaching(true);
      try {
        const attachment = await uploadAttachment(file);
        setPendingAttachment(attachment);
      } catch {
        setMessageError("Upload failed. Try again.");
      } finally {
        setAttaching(false);
      }
    },
    [selectedUser, uploadAttachment],
  );

  const handleRemoveAttachment = useCallback(() => {
    setPendingAttachment(null);
  }, []);

  const groupedMessages = useMemo(
    () => groupMessagesByDate(conversationMessages),
    [conversationMessages],
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
      <ChatViewHeader
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        setSidebarOpen={setSidebarOpen}
        onlineUsers={onlineUsers}
        isTyping={typingUsers.has(selectedUser.id)}
      />

      <ChatMessageList
        messagesRef={messagesRef}
        msgsError={msgsError}
        hasNextPage={hasNextPage}
        onFetchNextPage={fetchNextPage}
        groupedMessages={groupedMessages}
        conversationMessages={conversationMessages}
        user={user}
        selectedUser={selectedUser}
        dateDisplay={dateDisplay}
        bottomRef={bottomRef}
        t={{
          failedToLoad: t.failedToLoad,
          noMessages: t.noMessages,
          decryptionFailed: t.decryptionFailed,
        }}
      />

      {!isAtBottom && !input && conversationMessages.length > 0 && (
        <ScrollToBottomButton onClick={scrollToBottom} />
      )}

      <ChatInputBar
        input={input}
        setInput={setInput}
        messageError={messageError}
        handleSend={handleSend}
        connectionState={connectionState}
        inputPlaceholder={t.inputPlaceholder}
        connectingLabel={t.connecting}
        recipientId={selectedUser.id}
        onTypingStart={sendTypingStart}
        onTypingStop={sendTypingStop}
        attaching={attaching}
        pendingAttachment={pendingAttachment}
        onAttachFile={handleAttachFile}
        onRemoveAttachment={handleRemoveAttachment}
      />
    </div>
  );
}
