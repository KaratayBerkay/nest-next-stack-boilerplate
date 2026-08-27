import type { useQueryClient } from "@tanstack/react-query";
import { markMessagesReadServer } from "@/api/server/messages/mark-read";
import { patchConversationList } from "@/lib/realtime/renew-dispatch";

const sentTempIds = new Set<string>();
let activePeerId: string | null = null;

export function trackTempId(tempId: string): void {
  sentTempIds.add(tempId);
}

// Optimistic WS sends (direct-message, room-message) previously relied
// entirely on the server echoing the frame back to clear the pending temp
// id — if that echo was ever dropped (WS hiccup, server-side error that
// never reaches the client), the message stayed "pending" forever with no
// way for the user to tell it never actually sent, and the id stayed in
// sentTempIds forever too. Mirrors the bounded-wait pattern already used
// for call-action acks in RtcCallProvider. Callers that have their own
// synchronous success/failure signal (e.g. an awaited REST fallback) don't
// need this — it's specifically for the fire-and-forget `realtime.send`
// path, which otherwise has no failure signal at all.
const DEFAULT_SEND_TIMEOUT_MS = 15_000;

export function scheduleSendTimeout(
  tempId: string,
  onTimeout: () => void,
  timeoutMs: number = DEFAULT_SEND_TIMEOUT_MS,
): void {
  setTimeout(() => {
    if (!sentTempIds.has(tempId)) return;
    sentTempIds.delete(tempId);
    onTimeout();
  }, timeoutMs);
}

export function setActivePeerId(peerId: string | null): void {
  activePeerId = peerId;
}

export async function dispatchEvent(
  qc: ReturnType<typeof useQueryClient>,
  frame: Record<string, unknown>,
  ownUserId?: string,
  sendFrame?: (data: Record<string, unknown>) => void,
): Promise<void> {
  const t = frame.type as string;

  if (t === "direct-message" && ownUserId) {
    const msg = frame.message as Record<string, unknown> & {
      id: string;
      senderId: string;
      recipientId?: string;
    };
    if (!msg?.id || !msg.senderId) return;

    // The recipient is whoever is NOT the sender — the wire payload carries
    // senderId (+ recipientId since the deliverDirectMessage fix), so the
    // recipient side never has to wait for the cache or a recipientId.
    const isMine = msg.senderId === ownUserId;
    const peerId = isMine ? (msg.recipientId ?? activePeerId) : msg.senderId;

    // Recipient-side delivery semantics fire regardless of cache state —
    // the server expects the delivered-ack and the auto mark-read even when
    // the ["messages", peerId] query hasn't been fetched yet.
    if (!isMine && sendFrame) {
      sendFrame({ type: "delivered-ack", messageId: msg.id });
    }
    if (!isMine && msg.senderId === activePeerId) {
      qc.setQueryData(["conversations"], (old: unknown) => {
        const list = (old ?? []) as Record<string, unknown>[];
        return list.map((c) => {
          const u = c.user as Record<string, unknown> | undefined;
          if (u?.id === msg.senderId) {
            return { ...c, unread: 0 };
          }
          return c;
        });
      });
      markMessagesReadServer(msg.senderId).catch(() => {});
    }

    if (!peerId) return;
    if (!qc.getQueryData(["messages", peerId])) {
      qc.invalidateQueries({ queryKey: ["messages", peerId] });
      return;
    }
    qc.setQueryData(["messages", peerId], (old: unknown) => {
      const data = old as
        { pages: { messages: Record<string, unknown>[] }[] } | undefined;
      if (!data?.pages?.length) return old;
      const pages = [...data.pages];
      const first = { ...pages[0] };
      if (first.messages.some((m) => m.id === msg.id)) return old;
      const echoTempId = (msg as Record<string, unknown>)._tempId as
        string | undefined;
      if (echoTempId && sentTempIds.has(echoTempId)) {
        sentTempIds.delete(echoTempId);
        first.messages = first.messages.map((m) =>
          m.id === echoTempId ? { ...msg, pending: false } : m,
        );
      } else {
        first.messages = [...first.messages, msg];
      }
      pages[0] = first;
      return { ...data, pages };
    });
    // Keep the sidebar preview in sync for both sides: the recipient's row
    // is normally updated by the server's Conversation renew, while the
    // sender's row only gets this echo frame (the REST/WS send paths emit
    // no renew to the sender). Never insert — the peer is already in the
    // list whenever a thread is open.
    patchConversationList(
      qc,
      {
        user: { id: peerId },
        lastMessage: typeof msg.body === "string" ? (msg.body as string) : "",
        lastTime: msg.createdAt as string,
      },
      { insertIfMissing: false },
    );
  }

  if (t === "message-read" && ownUserId) {
    const peerId = (frame.peerId as string) ?? "";
    if (!qc.getQueryData(["messages", peerId])) {
      qc.invalidateQueries({ queryKey: ["messages", peerId] });
      return;
    }
    qc.setQueryData(["messages", peerId], (old: unknown) => {
      const data = old as
        { pages: { messages: Record<string, unknown>[] }[] } | undefined;
      if (!data?.pages?.length) return old;
      const pages = data.pages.map((page) => ({
        ...page,
        messages: page.messages.map((m) =>
          m.senderId === ownUserId && !m.readAt
            ? { ...m, readAt: frame.readAt }
            : m,
        ),
      }));
      return { ...data, pages };
    });
  }

  if (t === "message-delivered" && ownUserId) {
    const peerId = (frame.peerId as string) ?? "";
    if (!qc.getQueryData(["messages", peerId])) {
      qc.invalidateQueries({ queryKey: ["messages", peerId] });
      return;
    }
    qc.setQueryData(["messages", peerId], (old: unknown) => {
      const data = old as
        { pages: { messages: Record<string, unknown>[] }[] } | undefined;
      if (!data?.pages?.length) return old;
      const pages = data.pages.map((page) => ({
        ...page,
        messages: page.messages.map((m) =>
          m.id === frame.messageId
            ? { ...m, deliveredAt: frame.deliveredAt }
            : m,
        ),
      }));
      return { ...data, pages };
    });
  }

  if (t === "message-deleted" && ownUserId) {
    const scope = frame.scope as "me" | "everyone";
    // scope "me": peerId rides directly on the frame (it's a sync frame to
    // the actor's own other devices/tabs, not a peer-facing broadcast).
    // scope "everyone": derive it the same way "direct-message" does — the
    // frame carries absolute senderId/recipientId, not a peerId.
    const peerId =
      scope === "me"
        ? (frame.peerId as string)
        : ownUserId === (frame.senderId as string)
          ? (frame.recipientId as string)
          : (frame.senderId as string);
    if (!peerId) return;
    if (!qc.getQueryData(["messages", peerId])) {
      qc.invalidateQueries({ queryKey: ["messages", peerId] });
      return;
    }
    qc.setQueryData(["messages", peerId], (old: unknown) => {
      const data = old as
        { pages: { messages: Record<string, unknown>[] }[] } | undefined;
      if (!data?.pages?.length) return old;
      const pages = data.pages.map((page) => ({
        ...page,
        messages:
          scope === "me"
            ? page.messages.filter((m) => m.id !== frame.messageId)
            : page.messages.map((m) =>
                m.id === frame.messageId
                  ? {
                      ...m,
                      body: null,
                      attachments: [],
                      deletedAt: frame.deletedAt,
                    }
                  : m,
              ),
      }));
      return { ...data, pages };
    });
  }

  if (t === "tier-changed") {
    const tier = frame.tier as string | undefined;
    if (tier) {
      window.dispatchEvent(
        new CustomEvent("tier-changed", { detail: { tier } }),
      );
    }
  }

  if (t === "room-message") {
    const room = frame.room as string;
    const msg = frame.message as Record<string, unknown>;
    const tempId = frame.tempId as string | undefined;
    if (!room || !msg) return;

    if (!qc.getQueryData(["room", room])) {
      qc.invalidateQueries({ queryKey: ["room", room] });
      return;
    }
    // Cache is now an infinite-query page list (see roomMessagesQueryOptions)
    // — mirrors the ["messages", peerId] patch above: only page[0] (the most
    // recently fetched, newest-messages page) ever needs a live append.
    qc.setQueryData(["room", room], (old: unknown) => {
      const data = old as
        { pages: { messages: Record<string, unknown>[] }[] } | undefined;
      if (!data?.pages?.length) return old;
      const pages = [...data.pages];
      const first = { ...pages[0] };
      if (first.messages.some((m) => m.id === msg.id)) return old;
      if (tempId && sentTempIds.has(tempId)) {
        sentTempIds.delete(tempId);
        first.messages = first.messages.map((m) =>
          m.id === tempId ? { ...msg, pending: false } : m,
        );
      } else {
        first.messages = [...first.messages, msg];
      }
      pages[0] = first;
      return { ...data, pages };
    });
  }
}
