import type { useQueryClient } from "@tanstack/react-query";
import { getActivePeerId } from "@/lib/realtime/active-peer";

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

  // A row for the thread the user is looking at is never unread: incoming
  // messages there are auto-marked read on arrival (event-dispatch), but the
  // server's Conversation renew is emitted at send time with the incremented
  // count and can land after the local unread:0 patch — without this clamp
  // the header/sidebar badges flash on until the mark-read round-trip's
  // reset renew catches up.
  if (
    peerId === getActivePeerId() &&
    typeof conversation.unread === "number" &&
    conversation.unread > 0
  ) {
    conversation = { ...conversation, unread: 0 };
  }

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
        // which has no realtime subscription of its own. Cache is an
        // infinite-query page list (see notificationsQueryOptions) — a new
        // notification is always the newest, so it's prepended to page[0]'s
        // items rather than appended (unlike the message caches, where
        // page[0] holds ascending-chronological content).
        if (!qc.getQueryData(["notifications", "list"])) {
          qc.invalidateQueries({ queryKey: ["notifications", "list"] });
        } else {
          qc.setQueryData(["notifications", "list"], (old: unknown) => {
            const data = old as
              { pages: { items: Record<string, unknown>[] }[] } | undefined;
            if (!data?.pages?.length) return old;
            const item = frame.item as Record<string, unknown>;
            if (data.pages[0].items.some((n) => n.id === item.id)) return old;
            const pages = [...data.pages];
            pages[0] = { ...pages[0], items: [item, ...pages[0].items] };
            return { ...data, pages };
          });
        }
        // Friend accept/request also fires its own "Friends"/PendingList renew
        // over the MESSAGE service, but that one is fire-and-forget and gets
        // silently dropped if this client had no live MESSAGE socket at that
        // instant. The notification above rides a reliable channel (push
        // fallback when offline) — piggyback the friends-list refresh on it
        // so a missed PendingList frame doesn't leave a stale friends list.
        {
          const item = frame.item as { payload?: { kind?: string } };
          if (
            item?.payload?.kind === "friend-accepted" ||
            item?.payload?.kind === "friend-request"
          ) {
            qc.invalidateQueries({ queryKey: ["friends", "requests"] });
            qc.invalidateQueries({ queryKey: ["friends", "list"] });
          }
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
      } else if (frame.type === "ConversationRemoved") {
        // Edge case: the user deleted-for-me every message they had with
        // this peer — nothing left to preview, so drop the row entirely.
        const peerId = frame.peerId as string;
        qc.setQueryData(["conversations"], (old: unknown[] | undefined) => {
          const list = (old ?? []) as Record<string, unknown>[];
          return list.filter(
            (c) =>
              (c.user as Record<string, unknown> | undefined)?.id !== peerId,
          );
        });
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
