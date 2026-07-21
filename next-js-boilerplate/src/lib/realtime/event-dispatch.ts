import type { useQueryClient } from "@tanstack/react-query";
import { markMessagesReadServer } from "@/api/server/messages/mark-read";

const sentTempIds = new Set<string>();
let activePeerId: string | null = null;

export function trackTempId(tempId: string): void {
  sentTempIds.add(tempId);
}

export function setActivePeerId(peerId: string | null): void {
  activePeerId = peerId;
}

export function dispatchEvent(
  qc: ReturnType<typeof useQueryClient>,
  frame: Record<string, unknown>,
  ownUserId?: string,
  sendFrame?: (data: Record<string, unknown>) => void,
): void {
  const t = frame.type as string;

  if (t === "direct-message" && ownUserId) {
    const msg = frame.message as Record<string, unknown> & {
      id: string;
      senderId: string;
      recipientId: string;
    };
    if (!msg?.id) return;
    const peerId = msg.senderId === ownUserId ? msg.recipientId : msg.senderId;
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
      // Replace temp entry if this is the server's echo of our own send
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
    if (msg.recipientId === ownUserId && sendFrame) {
      sendFrame({ type: "delivered-ack", messageId: msg.id });
    }
    // Auto-zero unread + mark read only when actively viewing the sender's conversation
    if (
      msg.recipientId === ownUserId &&
      msg.senderId &&
      msg.senderId === activePeerId
    ) {
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

  if (t === "room-message") {
    const room = frame.room as string;
    const msg = frame.message as Record<string, unknown>;
    const tempId = frame.tempId as string | undefined;
    if (!room || !msg) return;
    if (!qc.getQueryData(["room", room])) {
      qc.invalidateQueries({ queryKey: ["room", room] });
      return;
    }
    qc.setQueryData(
      ["room", room],
      (old: Record<string, unknown>[] | undefined) => {
        const msgs = old ?? [];
        if (msgs.some((m) => m.id === msg.id)) return old;
        // Replace temp entry if this is the server's response to our send
        if (tempId && sentTempIds.has(tempId)) {
          sentTempIds.delete(tempId);
          return msgs.map((m) =>
            m.id === tempId ? { ...msg, pending: false } : m,
          );
        }
        return [...msgs, msg];
      },
    );
  }
}
