"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { computeUserFingerprint } from "@/lib/crypto/fingerprint";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";
import type { QueryClient } from "@tanstack/react-query";

async function resetConversationForPeer(
  ownUserId: string,
  peerUserId: string,
  qc: QueryClient,
) {
  try {
    const { resetConversation } = await import("@/lib/crypto/chat");
    await resetConversation(ownUserId, peerUserId);
    qc.invalidateQueries({ queryKey: ["messages", peerUserId] });
  } catch {
    // Best-effort.
  }
}

async function exportKeysBackup(ownUserId: string) {
  try {
    const { exportE2eeKeys, downloadKeyBackup } =
      await import("@/lib/crypto/key-recovery");
    const backup = await exportE2eeKeys(ownUserId);
    downloadKeyBackup(backup);
  } catch {
    // Best-effort — nothing to export or download failed.
  }
}

async function importKeysBackup(
  ownUserId: string,
  file: File,
  qc: QueryClient,
) {
  try {
    const { parseKeyBackupFile, importE2eeKeys } =
      await import("@/lib/crypto/key-recovery");
    const { getDeviceId } = await import("@/lib/crypto/chat");
    const { ensureIdentity } = await import("@/lib/crypto/identity");
    const { registerBundleServer } =
      await import("@/api/server/e2ee/register-bundle");

    const backup = await parseKeyBackupFile(file);
    await importE2eeKeys(ownUserId, backup);

    // Re-register the restored public bundle so the server matches the
    // imported identity (a fresh identity may have replaced it in the
    // window between the wipe and the import).
    const { identity, bundle, serverPrekeys } = await ensureIdentity(
      ownUserId,
      getDeviceId(ownUserId),
    );
    if (identity) {
      await registerBundleServer({ bundle, oneTimePrekeys: serverPrekeys });
    }

    // Re-run decryption on open conversations using the restored cache.
    qc.invalidateQueries({ queryKey: ["messages"] });
  } catch {
    // Best-effort — invalid backup files fail silently.
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
  } = useConversation(selectedUser?.id ?? null, user?.id);
  const conversationMessages = useMemo(
    () =>
      [...(conversationData?.pages ?? [])]
        .reverse()
        .flatMap((p) => p.messages) ?? [],
    [conversationData],
  );

  // If any message needs re-keying (ratchet session missing/stale), send a
  // single e2ee-rekey request to that peer so their next message triggers
  // a fresh X3DH handshake. One request per peer per conversation open.
  const realtime = useRealtime();
  const rekeySentRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!realtime || realtime.status !== "open") return;
    for (const msg of conversationMessages) {
      if (
        "needsRekey" in msg &&
        (msg as { needsRekey?: boolean }).needsRekey &&
        !rekeySentRef.current.has(msg.senderId)
      ) {
        rekeySentRef.current.add(msg.senderId);
        realtime.send({ type: "e2ee-rekey", peerId: msg.senderId });
      }
    }
  }, [conversationMessages, realtime]);

  // After a fresh X3DH handshake re-keys the conversation, try to re-decrypt
  // any messages that were previously stuck as "Encrypted" / "Re-syncing keys".
  // This watches for messages that are still encrypted and retries decryption
  // using the now-available session + cache.
  const queryClient = useQueryClient();
  const reDecryptAttemptedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!user?.id || conversationMessages.length === 0) return;
    const ownUserId = user.id;
    const peerId = selectedUser?.id;
    if (!peerId) return;

    const stillEncrypted = conversationMessages.filter(
      (m) =>
        m.encrypted &&
        (!m.body || m.body === "") &&
        !reDecryptAttemptedRef.current.has(m.id),
    );
    if (stillEncrypted.length === 0) return;

    let cancelled = false;

    async function tryReDecrypt() {
      try {
        const { tryRedecryptConversation } = await import("@/lib/crypto/chat");
        const results = await tryRedecryptConversation(
          conversationMessages as Array<{
            id: string;
            body?: string | null;
            encrypted?: boolean;
            envelope?: Record<string, unknown> | null;
            senderId: string;
            recipientId?: string;
            createdAt?: string;
          }>,
          ownUserId,
        );

        if (cancelled) return;

        // Check if any messages were successfully re-decrypted
        const anyUpdated = results.some(
          (r, i) =>
            r.body &&
            r.body !== "" &&
            (!conversationMessages[i]?.body ||
              conversationMessages[i]?.body === ""),
        );

        if (anyUpdated) {
          // Patch the query cache with the re-decrypted results
          queryClient.setQueryData(["messages", peerId], (old: unknown) => {
            const data = old as
              | {
                  pages: {
                    messages: Record<string, unknown>[];
                  }[];
                }
              | undefined;
            if (!data?.pages?.length) return old;
            const pages = data.pages.map((page) => ({
              ...page,
              messages: page.messages.map((msg) => {
                const result = results.find((r) => r.id === msg.id);
                if (result?.body && result.body !== "" && !msg.body) {
                  return {
                    ...msg,
                    body: result.body,
                    encrypted: false,
                    needsRekey: false,
                    ...(result.decryptedAttachment
                      ? { decryptedAttachment: result.decryptedAttachment }
                      : {}),
                  };
                }
                return msg;
              }),
            }));
            return { ...data, pages };
          });
        }

        // Mark attempted so we don't retry endlessly
        for (const msg of stillEncrypted) {
          reDecryptAttemptedRef.current.add(msg.id);
        }
      } catch {
        // Best-effort — don't break the UI.
      }
    }

    tryReDecrypt();
    return () => {
      cancelled = true;
    };
  }, [conversationMessages, user?.id, selectedUser?.id, queryClient]);

  const { bottomRef, scrollToBottom, isAtBottom } = useAutoScroll(
    conversationMessages,
    !!selectedUser,
  );

  const { sendMessage } = useMessageActions();
  const { typingUsers, sendTypingStart, sendTypingStop } = useTypingUsers();
  const { uploadAttachment } = useMessageUpload();

  // Safety number fingerprints
  const [ownFingerprint, setOwnFingerprint] = useState<string | null>(null);
  const [peerFingerprint, setPeerFingerprint] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id || !selectedUser?.id) return;
    const ownUserId = user.id;
    let cancelled = false;

    async function load() {
      try {
        const { getIdentity } = await import("@/lib/crypto/store");
        const identity = await getIdentity(ownUserId);
        if (cancelled || !identity) return;

        const own = computeUserFingerprint(
          ownUserId,
          identity.identitySigningKey,
        );
        if (!cancelled) setOwnFingerprint(own);

        // Fetch peer's public identity key from the server
        const { fetchPeerIdentityKey } =
          await import("@/api/server/e2ee/peer-identity");
        const peerKey = await fetchPeerIdentityKey(selectedUser.id);
        if (!cancelled && peerKey) {
          const peer = computeUserFingerprint(selectedUser.id, peerKey);
          setPeerFingerprint(peer);
        }
      } catch {
        // E2EE not available — fingerprints stay null
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id, selectedUser?.id]);

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

  // Detect when ALL messages in the conversation are stuck encrypted
  // (permanently broken — keys were cross-contaminated before the fix).
  const allEncrypted = useMemo(() => {
    if (conversationMessages.length === 0) return false;
    return conversationMessages.every(
      (m) => m.encrypted && (!m.body || m.body === ""),
    );
  }, [conversationMessages]);

  // One-click conversation reset: clears ratchet session + cache so the
  // next message triggers a fresh X3DH handshake.
  const handleResetConversation = () => {
    if (!user?.id || !selectedUser?.id) return;
    resetConversationForPeer(user.id, selectedUser.id, queryClient);
  };

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
        ownUserId={user?.id}
        ownFingerprint={ownFingerprint ?? undefined}
        peerFingerprint={peerFingerprint ?? undefined}
        allEncrypted={allEncrypted}
        onResetConversation={handleResetConversation}
        onExportKeys={user?.id ? () => exportKeysBackup(user.id) : undefined}
        onImportKeys={
          user?.id
            ? (file) => importKeysBackup(user.id, file, queryClient)
            : undefined
        }
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
        t={{ failedToLoad: t.failedToLoad, noMessages: t.noMessages }}
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
