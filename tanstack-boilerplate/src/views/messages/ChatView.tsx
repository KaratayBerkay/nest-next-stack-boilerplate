"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useYSwipeGesture } from "@/hooks/useYSwipeGesture";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { useConversation } from "@/lib/realtime/useConversation";
import { ScrollToBottomButton } from "@/components/ui/ScrollToBottomButton";
import { ConnectionUnstable } from "@/components/ConnectionUnstable";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useDateDisplayCookie } from "@/hooks/useDateDisplayCookie";
import { messageUsageQueryOptions } from "@/api/client/usage/query";
import type {
  ChatViewProps,
  Message,
  ReplyPreview,
} from "@/types/messages/ChatView-types";
import { useMessageActions } from "@/api/client/messages/actions";
import {
  MAX_UPLOADS,
  useAttachmentUploads,
} from "@/hooks/messages/useAttachmentUploads";
import { useTypingUsers } from "@/hooks/useTypingUsers";
import {
  chatViewHandleSend,
  chatViewHandleDelete,
  groupMessagesByDate,
  toReplyPreview,
} from "@/views/messages/ChatView-utils";
import { ChatViewHeader } from "@/views/messages/ChatViewHeader";
import { ChatInputBar } from "@/views/messages/ChatInputBar";
import { ChatMessageList } from "@/views/messages/ChatMessageList";
import { ReplyBanner } from "@/views/messages/ReplyBanner";
import { StorageLimitNotice } from "@/views/messages/StorageLimitNotice";
import { AttachmentModal } from "@/components/attachment-modal/AttachmentModal";
import { AttachmentGallerySheet } from "@/views/messages/AttachmentGallerySheet";
import { useToast } from "@/components/ui/Toast";

export function ChatView({
  selectedUser,
  user,
  setSelectedUser,
  setSidebarOpen,
  onlineUsers,
  connectionState,
}: ChatViewProps) {
  const t = useMessages("messages");
  const { toast } = useToast();
  const dateDisplay = useDateDisplayCookie();
  const messagesRef = useYSwipeGesture<HTMLDivElement>();
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [messageError, setMessageError] = useState<string | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  // FreePageView keys <ChatView> by selectedUser.id, so switching peers
  // remounts this whole component and every piece of state below —
  // including replyTarget, input, and the upload state further down —
  // starts fresh rather than leaking into the new conversation.
  const [replyTarget, setReplyTarget] = useState<ReplyPreview | null>(null);
  const {
    items: uploadItems,
    startUploads,
    removeItem: removeUploadItem,
    cancelAll: cancelUploads,
    clear: clearUploads,
    doneAttachments,
    anyUploading,
  } = useAttachmentUploads();
  const { data: messageUsage } = useQuery(messageUsageQueryOptions());
  const storageLimitReached =
    !!messageUsage && messageUsage.bytes >= messageUsage.limitBytes;

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

  const { sendMessage, deleteMessage } = useMessageActions();
  const { typingUsers, sendTypingStart, sendTypingStop } = useTypingUsers();

  const handleReply = useCallback((msg: Message) => {
    setReplyTarget(toReplyPreview(msg));
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyTarget(null);
  }, []);

  const handleSend = useCallback(
    () =>
      chatViewHandleSend(
        selectedUser,
        input,
        sendMessage,
        setInput,
        setMessageError,
        scrollToBottom,
        t.messageTooLong,
        t.messageEmpty,
        t.sendMessageFailed,
        undefined,
        replyTarget,
        handleCancelReply,
      ),
    [
      selectedUser,
      input,
      sendMessage,
      scrollToBottom,
      t.messageTooLong,
      t.messageEmpty,
      t.sendMessageFailed,
      replyTarget,
      handleCancelReply,
    ],
  );

  const handleSendAttachments = useCallback(() => {
    void chatViewHandleSend(
      selectedUser,
      input,
      sendMessage,
      setInput,
      setMessageError,
      scrollToBottom,
      t.messageTooLong,
      t.messageEmpty,
      t.sendMessageFailed,
      doneAttachments(),
      replyTarget,
      handleCancelReply,
    );
    clearUploads();
  }, [
    selectedUser,
    input,
    sendMessage,
    scrollToBottom,
    t.messageTooLong,
    t.messageEmpty,
    t.sendMessageFailed,
    doneAttachments,
    clearUploads,
    replyTarget,
    handleCancelReply,
  ]);

  const handleAttachFiles = useCallback(
    (files: File[]) => {
      if (!selectedUser) return;
      const { duplicates, overflow } = startUploads(files, {
        kind: "messages",
        id: selectedUser.id,
      });
      for (const name of duplicates) {
        toast({
          title: t.duplicateAttachment.replace("{name}", name),
          variant: "warning",
        });
      }
      if (overflow > 0) {
        toast({
          title: t.attachmentLimitReached.replace(
            "{count}",
            String(MAX_UPLOADS),
          ),
          variant: "warning",
        });
      }
    },
    [selectedUser, startUploads, toast, t],
  );

  const groupedMessages = useMemo(
    () => groupMessagesByDate(conversationMessages),
    [conversationMessages],
  );

  const handleDeleteMessage = useCallback(
    (messageId: string, scope: "me" | "everyone") => {
      if (!selectedUser) return;
      void chatViewHandleDelete(
        deleteMessage,
        selectedUser.id,
        messageId,
        scope,
        setMessageError,
        t.deleteMessageFailed,
      );
    },
    [selectedUser, deleteMessage, t.deleteMessageFailed],
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
    <div
      ref={chatWindowRef}
      className="border-border bg-bg relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border"
    >
      <ChatViewHeader
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        setSidebarOpen={setSidebarOpen}
        onlineUsers={onlineUsers}
        isTyping={typingUsers.has(selectedUser.id)}
        onOpenGallery={() => setGalleryOpen(true)}
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
        onDelete={handleDeleteMessage}
        onReply={handleReply}
        t={{
          failedToLoad: t.failedToLoad,
          noMessages: t.noMessages,
          decryptionFailed: t.decryptionFailed,
          today: t.today,
        }}
      />

      {!isAtBottom && !input && conversationMessages.length > 0 && (
        <ScrollToBottomButton onClick={scrollToBottom} />
      )}

      {storageLimitReached ? (
        <StorageLimitNotice />
      ) : (
        <>
          {replyTarget && (
            <ReplyBanner
              replyTarget={replyTarget}
              isReplyToMe={replyTarget.senderId === user.id}
              peerName={selectedUser.name ?? selectedUser.email ?? "?"}
              onCancel={handleCancelReply}
            />
          )}
          <ChatInputBar
            input={input}
            setInput={setInput}
            messageError={messageError}
            handleSend={handleSend}
            connectionState={connectionState}
            inputPlaceholder={t.inputPlaceholder}
            connectingLabel={t.connecting}
            attachFileLabel={t.attachFile}
            insertEmojiLabel={t.openEmojiPicker}
            sendLabel={t.send}
            recipientId={selectedUser.id}
            onTypingStart={sendTypingStart}
            onTypingStop={sendTypingStop}
            attaching={anyUploading}
            uploadItems={uploadItems}
            onAttachFiles={handleAttachFiles}
            chatWindowRef={chatWindowRef}
          />
        </>
      )}

      <AttachmentModal
        open={uploadItems.length > 0}
        items={uploadItems}
        t={t}
        onSend={handleSendAttachments}
        onRemoveItem={removeUploadItem}
        onAddFiles={handleAttachFiles}
        onCancel={cancelUploads}
      />

      <AttachmentGallerySheet
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        peerId={selectedUser.id}
      />
    </div>
  );
}
