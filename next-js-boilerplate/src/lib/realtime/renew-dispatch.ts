import type { useQueryClient } from "@tanstack/react-query";

type ConversationPatch = Record<string, unknown> & {
  user?: { id?: string };
};

export function patchConversationList(
  qc: ReturnType<typeof useQueryClient>,
  conversation: ConversationPatch,
  opts?: { insertIfMissing?: boolean },
): void {
  const peerId = (conversation.user as { id?: string } | undefined)?.id;
  if (!peerId) return;

  // Never decrypt previews here — the server delivers plaintext
  // bodies in the conversation list. Encrypted envelopes stay as
  // objects; the sidebar renders them as "🔒 Encrypted".
  const rawLastMessage = conversation.lastMessage;

  qc.setQueryData(["conversations"], (old: unknown[] | undefined) => {
    const list = (old ?? []) as Record<string, unknown>[];
    const idx = list.findIndex(
      (c) => (c.user as Record<string, unknown>)?.id === peerId,
    );
    if (idx >= 0) {
      const updated = [...list];
      const merged: Record<string, unknown> = {
        ...(updated[idx] as Record<string, unknown>),
      };
      for (const [k, v] of Object.entries(conversation)) {
        if (v !== undefined && v !== null) {
          merged[k] =
            k === "user" && typeof v === "object"
              ? { ...(merged.user as object), ...(v as object) }
              : v;
        }
      }
      updated[idx] = merged;
      return updated.sort(
        (a, b) =>
          (new Date((b.lastTime as string) ?? "").getTime() || 0) -
          (new Date((a.lastTime as string) ?? "").getTime() || 0),
      );
    }
    // A partial update for a peer not yet in the cached list (e.g.
    // the unread-reset push above, which has no lastMessage/lastTime)
    // isn't enough to render a real conversation row — drop it rather
    // than inserting a broken stub.
    if (opts?.insertIfMissing === false || rawLastMessage === undefined)
      return list;
    return [conversation, ...list];
  });
}

export async function dispatchRenew(
  qc: ReturnType<typeof useQueryClient>,
  frame: Record<string, unknown>,
): Promise<void> {
  if (!frame.renew) return;
  switch (frame.renew as string) {
    case "Notifications": {
      if (frame.type === "Count") {
        qc.setQueryData(["notifications", "count"], frame.value);
      } else if (frame.type === "DmCount") {
        qc.setQueryData(["notifications", "dm-count"], frame.value);
      } else if (frame.type === "Item") {
        // Notification list kept live here; companion to FreePageView.tsx
        // which has no realtime subscription of its own.
        if (!qc.getQueryData(["notifications", "list"])) {
          qc.invalidateQueries({ queryKey: ["notifications", "list"] });
        } else {
          qc.setQueryData(
            ["notifications", "list"],
            (old: { items: Record<string, unknown>[] } | undefined) => {
              const list = (old?.items ?? []) as Record<string, unknown>[];
              const item = frame.item as Record<string, unknown>;
              if (list.some((n) => n.id === item.id)) return old;
              return { ...old, items: [item, ...list] };
            },
          );
        }
      } else if (frame.type === "Read") {
        qc.invalidateQueries({ queryKey: ["notifications"] });
      }
      break;
    }
    case "Messages": {
      // Sidebar conversation-list updates (lastMessage, lastTime, unread).
      // Companion to event-dispatch.ts's direct-message handler which patches
      // the open thread's cache and auto-marks-read for the active conversation.
      if (frame.type === "Conversation") {
        const conv = frame.conversation as ConversationPatch & {
          user: { id: string };
          lastMessage?: string | Record<string, unknown>;
        };
        patchConversationList(qc, conv, { insertIfMissing: true });
      }
      break;
    }
    case "Feed": {
      if (frame.type === "New") {
        qc.setQueryData(["feed", "new-flag"], true);
      } else if (frame.type === "Post" && frame.id) {
        qc.invalidateQueries({
          queryKey: ["posts", frame.id as string],
          refetchType: "active",
        });
        qc.invalidateQueries({
          queryKey: ["feed", "list"],
          refetchType: "active",
        });
      }
      break;
    }
    case "Friends": {
      if (frame.type === "PendingList") {
        qc.invalidateQueries({ queryKey: ["friends", "requests"] });
        qc.invalidateQueries({ queryKey: ["friends", "list"] });
      }
      break;
    }
  }
}
