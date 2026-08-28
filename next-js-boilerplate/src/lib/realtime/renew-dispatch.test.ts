import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { dispatchRenew, patchConversationList } from "./renew-dispatch";
import { setActivePeerId } from "./active-peer";

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe("dispatchRenew", () => {
  let qc: QueryClient;

  beforeEach(() => {
    qc = createQueryClient();
    setActivePeerId(null);
  });

  describe("Notifications", () => {
    it("Count: sets query data for notifications count", async () => {
      await dispatchRenew(qc, {
        renew: "Notifications",
        type: "Count",
        value: 5,
      });
      expect(qc.getQueryData(["notifications", "count"])).toBe(5);
    });

    it("DmCount: sets query data for dm count", async () => {
      await dispatchRenew(qc, {
        renew: "Notifications",
        type: "DmCount",
        value: 3,
      });
      expect(qc.getQueryData(["notifications", "dm-count"])).toBe(3);
    });

    it("Item: prepends item to notifications list when cached", async () => {
      qc.setQueryData(["notifications", "list"], {
        pages: [{ items: [{ id: "n1", text: "old" }] }],
      });

      await dispatchRenew(qc, {
        renew: "Notifications",
        type: "Item",
        item: { id: "n2", text: "new" },
      });

      const data = qc.getQueryData(["notifications", "list"]) as {
        pages: { items: { id: string }[] }[];
      };
      expect(data.pages[0].items).toHaveLength(2);
      expect(data.pages[0].items[0].id).toBe("n2");
    });

    it("Item: invalidates when notifications list is not cached", async () => {
      const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

      await dispatchRenew(qc, {
        renew: "Notifications",
        type: "Item",
        item: { id: "n1", text: "new" },
      });

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["notifications", "list"],
      });
    });

    it("Item: deduplicates by id", async () => {
      qc.setQueryData(["notifications", "list"], {
        pages: [{ items: [{ id: "n1", text: "dup" }] }],
      });

      await dispatchRenew(qc, {
        renew: "Notifications",
        type: "Item",
        item: { id: "n1", text: "dup" },
      });

      const data = qc.getQueryData(["notifications", "list"]) as {
        pages: { items: { id: string }[] }[];
      };
      expect(data.pages[0].items).toHaveLength(1);
    });

    it("Read: invalidates all notification queries", async () => {
      const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

      await dispatchRenew(qc, { renew: "Notifications", type: "Read" });

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["notifications"],
      });
    });
  });

  describe("Messages", () => {
    it("Conversation: upserts conversation at correct position sorted by lastTime", async () => {
      qc.setQueryData(
        ["conversations"],
        [
          {
            user: { id: "u1", name: "Alice" },
            lastMessage: "hi",
            lastTime: "2026-07-20T10:00:00Z",
            unread: 1,
          },
        ],
      );

      await dispatchRenew(qc, {
        renew: "Messages",
        type: "Conversation",
        conversation: {
          user: { id: "u2", name: "Bob" },
          lastMessage: "later",
          lastTime: "2026-07-20T11:00:00Z",
          unread: 0,
        },
      });

      const data = qc.getQueryData(["conversations"]) as {
        user: { id: string };
        lastTime: string;
      }[];
      expect(data).toHaveLength(2);
      expect(data[0].user.id).toBe("u2"); // Bob's later message first
    });

    it("Conversation: merges fields on existing conversation", async () => {
      qc.setQueryData(
        ["conversations"],
        [
          {
            user: { id: "u1", name: "Alice" },
            lastMessage: "old",
            lastTime: "2026-07-20T10:00:00Z",
            unread: 3,
          },
        ],
      );

      await dispatchRenew(qc, {
        renew: "Messages",
        type: "Conversation",
        conversation: {
          user: { id: "u1" },
          unread: 0,
        },
      });

      const data = qc.getQueryData(["conversations"]) as {
        user: { id: string };
        unread: number;
        lastMessage: string;
      }[];
      expect(data).toHaveLength(1);
      expect(data[0].unread).toBe(0);
      // A partial push (no lastMessage in the frame, e.g. the unread-reset
      // markConversationRead sends the reader) must not clobber the
      // existing cached preview with "[Decryption failed]".
      expect(data[0].lastMessage).toBe("old");
    });

    it("Conversation: partial update for a peer not yet cached is dropped rather than inserted as a broken stub", async () => {
      qc.setQueryData(["conversations"], []);

      await dispatchRenew(qc, {
        renew: "Messages",
        type: "Conversation",
        conversation: {
          user: { id: "u1", name: "Alice" },
          unread: 0,
        },
      });

      const data = qc.getQueryData(["conversations"]) as unknown[];
      expect(data).toHaveLength(0);
    });

    it("Conversation: clamps unread to 0 for the active thread when the send-time renew races ahead of the mark-read reset", async () => {
      setActivePeerId("u1");
      qc.setQueryData(
        ["conversations"],
        [
          {
            user: { id: "u1", name: "Alice" },
            lastMessage: "old",
            lastTime: "2026-07-20T10:00:00Z",
            unread: 0,
          },
        ],
      );

      await dispatchRenew(qc, {
        renew: "Messages",
        type: "Conversation",
        conversation: {
          user: { id: "u1" },
          lastMessage: "new message",
          lastTime: "2026-07-20T11:00:00Z",
          unread: 1,
        },
      });

      const data = qc.getQueryData(["conversations"]) as {
        unread: number;
        lastMessage: string;
        lastTime: string;
      }[];
      expect(data[0].unread).toBe(0);
      // Only the unread count is clamped — the preview still updates.
      expect(data[0].lastMessage).toBe("new message");
      expect(data[0].lastTime).toBe("2026-07-20T11:00:00Z");
    });

    it("Conversation: applies the renewed unread count for a peer whose thread is not open", async () => {
      setActivePeerId("u1");
      qc.setQueryData(
        ["conversations"],
        [
          {
            user: { id: "u2", name: "Bob" },
            lastMessage: "old",
            lastTime: "2026-07-20T10:00:00Z",
            unread: 0,
          },
        ],
      );

      await dispatchRenew(qc, {
        renew: "Messages",
        type: "Conversation",
        conversation: {
          user: { id: "u2" },
          lastMessage: "new message",
          lastTime: "2026-07-20T11:00:00Z",
          unread: 3,
        },
      });

      const data = qc.getQueryData(["conversations"]) as {
        unread: number;
      }[];
      expect(data[0].unread).toBe(3);
    });

    it("Conversation: inserts a first-ever conversation from the active peer with unread already 0", () => {
      setActivePeerId("u1");
      qc.setQueryData(["conversations"], []);

      patchConversationList(
        qc,
        {
          user: { id: "u1" },
          lastMessage: "hello",
          lastTime: "2026-07-20T11:00:00Z",
          unread: 1,
        },
        { insertIfMissing: true },
      );

      const data = qc.getQueryData(["conversations"]) as {
        unread: number;
      }[];
      expect(data).toHaveLength(1);
      expect(data[0].unread).toBe(0);
    });

    it("ConversationRemoved: drops the peer row entirely (deleted-for-me on every message)", async () => {
      qc.setQueryData(
        ["conversations"],
        [
          { user: { id: "u1", name: "Alice" }, lastMessage: "hi" },
          { user: { id: "u2", name: "Bob" }, lastMessage: "yo" },
        ],
      );

      await dispatchRenew(qc, {
        renew: "Messages",
        type: "ConversationRemoved",
        peerId: "u1",
      });

      const data = qc.getQueryData(["conversations"]) as {
        user: { id: string };
      }[];
      expect(data).toHaveLength(1);
      expect(data[0].user.id).toBe("u2");
    });
  });

  describe("Feed", () => {
    it("New: sets new-flag to true", async () => {
      await dispatchRenew(qc, { renew: "Feed", type: "New" });
      expect(qc.getQueryData(["feed", "new-flag"])).toBe(true);
    });

    it("Post: invalidates posts and feed list queries", async () => {
      const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

      await dispatchRenew(qc, {
        renew: "Feed",
        type: "Post",
        id: "post-1",
      });

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["posts", "post-1"],
        refetchType: "active",
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["feed", "list"],
        refetchType: "active",
      });
    });
  });

  describe("Friends", () => {
    it("PendingList: invalidates friend requests and list", async () => {
      const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

      await dispatchRenew(qc, {
        renew: "Friends",
        type: "PendingList",
      });

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["friends", "requests"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["friends", "list"],
      });
    });
  });

  it("ignores frames without renew field", async () => {
    const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

    await dispatchRenew(qc, { type: "some-frame" });

    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
