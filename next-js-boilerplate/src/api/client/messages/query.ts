import { queryOptions } from "@tanstack/react-query";
import { infiniteQueryOptions } from "@tanstack/react-query";
import type { Conversation } from "@/api/server/messages/conversations";
import type { ConversationPage } from "@/api/server/messages/conversation-messages";
import type { ChatRoomMessage } from "@/types/chat-room/ChatRoomMessage-types";

async function fetchConversations(): Promise<Conversation[]> {
  const { fetchConversationsServer } =
    await import("@/api/server/messages/conversations");
  return fetchConversationsServer();
}

async function fetchConversationMessages(
  peerId: string,
  before?: string,
): Promise<ConversationPage> {
  const { fetchConversationMessagesServer } =
    await import("@/api/server/messages/conversation-messages");
  const page = await fetchConversationMessagesServer(peerId, before);

  // Decrypt encrypted messages at the boundary
  const hasEncrypted = page.messages.some((m) => m.encrypted && m.envelope);
  if (hasEncrypted) {
    const { decryptMessages, isE2eeDmEnabled } =
      await import("@/lib/crypto/chat").catch(() => ({
        decryptMessages: async (msgs: typeof page.messages) =>
          msgs.map((m) => ({ ...m, body: m.body ?? "" })),
        isE2eeDmEnabled: () => false,
      }));

    if (isE2eeDmEnabled()) {
      // Get ownUserId from the first message's context or from auth
      // For now, we need to identify which messages are from us vs peer
      // The decrypt function handles this via senderId comparison
      const { decryptMessages: dm } = await import("@/lib/crypto/chat");
      // We need ownUserId — fetch from auth context
      // For the query function, we'll use a module-level approach
      const ownUserId = await getOwnUserId();
      if (ownUserId) {
        const decrypted = await dm(page.messages, ownUserId);
        // Surface decryptedAttachment for each message
        const merged = decrypted.map((d, i) => ({
          ...page.messages[i],
          body: d.body,
          ...(d.decryptedAttachment
            ? { decryptedAttachment: d.decryptedAttachment }
            : {}),
        }));
        return { ...page, messages: merged as typeof page.messages };
      }
    }
  }

  return page;
}

async function fetchRoomMessages(room: string): Promise<ChatRoomMessage[]> {
  const { fetchRoomMessagesServer } =
    await import("@/api/server/messages/room-messages");
  const messages = await fetchRoomMessagesServer(room);

  // Decrypt encrypted room messages at the boundary
  const hasEncrypted = messages.some((m) => m.encrypted && m.envelope);
  if (hasEncrypted) {
    try {
      const { isE2eeDmEnabled } = await import("@/lib/crypto/chat");
      if (isE2eeDmEnabled()) {
        const { decryptRoomMessage } = await import("@/lib/crypto/sender-keys");
        const { getSenderKeyChain } = await import("@/lib/crypto/store");

        const decrypted = await Promise.all(
          messages.map(async (m) => {
            if (!m.encrypted || !m.envelope) return m;
            const envelope = m.envelope as {
              v: 1;
              senderDeviceId: string;
              ciphertext: string;
              nonce: string;
              senderKeyEpoch: number;
              chainIndex: number;
            };

            // Look up the sender's chain key for this room
            const chainKeyKey = `${room}:${m.senderId}`;
            const stored = await getSenderKeyChain(chainKeyKey);
            if (!stored) return { ...m, body: "[Encrypted]" };

            try {
              const plaintext = await decryptRoomMessage(
                envelope,
                stored.chainKey,
                room,
                m.senderId,
              );
              // Room plaintext may be a JSON string containing attachment metadata
              let decryptedAttachment: Record<string, unknown> | undefined;
              let bodyText = plaintext;
              try {
                const parsed = JSON.parse(plaintext);
                if (
                  parsed.attachment &&
                  typeof parsed.attachment === "object"
                ) {
                  decryptedAttachment = parsed.attachment;
                  bodyText = parsed.text ?? "";
                }
              } catch {
                // Not JSON — use as-is
              }
              const out: Record<string, unknown> = { ...m, body: bodyText };
              if (decryptedAttachment) {
                out.decryptedAttachment = decryptedAttachment;
              }
              return out;
            } catch {
              return { ...m, body: "[Encrypted]" };
            }
          }),
        );
        return decrypted as ChatRoomMessage[];
      }
    } catch {
      // crypto module unavailable — leave encrypted messages as-is
    }
  }

  return messages;
}

// Module-level own user ID cache (set by the query hooks)
let _ownUserId: string | null = null;

export function setOwnUserId(id: string | null): void {
  _ownUserId = id;
}

export async function getOwnUserId(): Promise<string | null> {
  return _ownUserId;
}

export function conversationsQueryOptions() {
  return queryOptions({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
    staleTime: 30_000,
  });
}

export function conversationMessagesQueryOptions(
  peerId: string | null,
  ownUserId?: string,
) {
  // Store ownUserId for decrypt use
  if (ownUserId) setOwnUserId(ownUserId);

  return infiniteQueryOptions<ConversationPage>({
    queryKey: ["messages", peerId],
    queryFn: async ({ pageParam }) => {
      return fetchConversationMessages(
        peerId!,
        pageParam as string | undefined,
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.messages[0]?.createdAt : undefined,
    enabled: !!peerId,
    staleTime: Infinity,
  });
}

export function roomMessagesQueryOptions(room: string | null) {
  return queryOptions({
    queryKey: ["room", room],
    queryFn: async () => {
      if (!room) return [];
      return fetchRoomMessages(room);
    },
    enabled: !!room,
    staleTime: 30_000,
  });
}
