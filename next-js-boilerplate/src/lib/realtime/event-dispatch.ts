import type { useQueryClient } from "@tanstack/react-query";

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
    if (!qc.getQueryData(["messages", peerId])) return;
    qc.setQueryData(["messages", peerId], (old: unknown) => {
      const data = old as
        | { pages: { messages: Record<string, unknown>[] }[] }
        | undefined;
      if (!data?.pages?.length) return old;
      const pages = [...data.pages];
      const first = { ...pages[0] };
      if (first.messages.some((m) => m.id === msg.id)) return old;
      first.messages = [...first.messages, msg];
      pages[0] = first;
      return { ...data, pages };
    });
    if (msg.recipientId === ownUserId && sendFrame) {
      sendFrame({ type: "delivered-ack", messageId: msg.id });
    }
  }

  if (t === "message-read" && ownUserId) {
    const peerId = (frame.peerId as string) ?? "";
    if (!qc.getQueryData(["messages", peerId])) return;
    qc.setQueryData(["messages", peerId], (old: unknown) => {
      const data = old as
        | { pages: { messages: Record<string, unknown>[] }[] }
        | undefined;
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
    if (!qc.getQueryData(["messages", peerId])) return;
    qc.setQueryData(["messages", peerId], (old: unknown) => {
      const data = old as
        | { pages: { messages: Record<string, unknown>[] }[] }
        | undefined;
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
    if (!room || !msg) return;
    const existing = qc.getQueryData(["room", room]);
    if (!existing) return;
    qc.setQueryData(
      ["room", room],
      (old: Record<string, unknown>[] | undefined) => {
        const msgs = old ?? [];
        if (msgs.some((m) => m.id === msg.id)) return old;
        return [...msgs, msg];
      },
    );
  }
}
