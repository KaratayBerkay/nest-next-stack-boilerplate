import type { useQueryClient } from "@tanstack/react-query";

export function dispatchRenew(
  qc: ReturnType<typeof useQueryClient>,
  frame: Record<string, unknown>,
): void {
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
        qc.setQueryData(["conversations"], (old: unknown[] | undefined) => {
          const list = (old ?? []) as Record<string, unknown>[];
          const conv = frame.conversation as Record<string, unknown> & {
            user: { id: string };
          };
          const idx = list.findIndex(
            (c) => (c.user as Record<string, unknown>)?.id === conv.user.id,
          );
          if (idx >= 0) {
            const updated = [...list];
            const merged: Record<string, unknown> = {
              ...(updated[idx] as Record<string, unknown>),
            };
            for (const [k, v] of Object.entries(conv)) {
              if (v !== undefined && v !== null && v !== "") {
                merged[k] = v;
              }
            }
            updated[idx] = merged;
            return updated.sort(
              (a, b) =>
                (new Date((b.lastTime as string) ?? "").getTime() || 0) -
                (new Date((a.lastTime as string) ?? "").getTime() || 0),
            );
          }
          return [conv, ...list];
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
