import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { dispatchRenew } from "./renew-dispatch";

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe("dispatchRenew", () => {
  let qc: QueryClient;

  beforeEach(() => {
    qc = createQueryClient();
  });

  describe("Notifications", () => {
    it("Count: sets query data for notifications count", () => {
      dispatchRenew(qc, { renew: "Notifications", type: "Count", value: 5 });
      expect(qc.getQueryData(["notifications", "count"])).toBe(5);
    });

    it("DmCount: sets query data for dm count", () => {
      dispatchRenew(qc, {
        renew: "Notifications",
        type: "DmCount",
        value: 3,
      });
      expect(qc.getQueryData(["notifications", "dm-count"])).toBe(3);
    });

    it("Item: prepends item to notifications list when cached", () => {
      qc.setQueryData(["notifications", "list"], {
        items: [{ id: "n1", text: "old" }],
      });

      dispatchRenew(qc, {
        renew: "Notifications",
        type: "Item",
        item: { id: "n2", text: "new" },
      });

      const data = qc.getQueryData(["notifications", "list"]) as {
        items: { id: string }[];
      };
      expect(data.items).toHaveLength(2);
      expect(data.items[0].id).toBe("n2");
    });

    it("Item: invalidates when notifications list is not cached", () => {
      const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

      dispatchRenew(qc, {
        renew: "Notifications",
        type: "Item",
        item: { id: "n1", text: "new" },
      });

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["notifications", "list"],
      });
    });

    it("Item: deduplicates by id", () => {
      qc.setQueryData(["notifications", "list"], {
        items: [{ id: "n1", text: "dup" }],
      });

      dispatchRenew(qc, {
        renew: "Notifications",
        type: "Item",
        item: { id: "n1", text: "dup" },
      });

      const data = qc.getQueryData(["notifications", "list"]) as {
        items: { id: string }[];
      };
      expect(data.items).toHaveLength(1);
    });

    it("Read: invalidates all notification queries", () => {
      const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

      dispatchRenew(qc, { renew: "Notifications", type: "Read" });

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["notifications"],
      });
    });
  });

  describe("Messages", () => {
    it("Conversation: upserts conversation at correct position sorted by lastTime", () => {
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

      dispatchRenew(qc, {
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

    it("Conversation: merges fields on existing conversation", () => {
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

      dispatchRenew(qc, {
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
      }[];
      expect(data).toHaveLength(1);
      expect(data[0].unread).toBe(0);
    });
  });

  describe("Feed", () => {
    it("New: sets new-flag to true", () => {
      dispatchRenew(qc, { renew: "Feed", type: "New" });
      expect(qc.getQueryData(["feed", "new-flag"])).toBe(true);
    });

    it("Post: invalidates posts and feed list queries", () => {
      const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

      dispatchRenew(qc, {
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
    it("PendingList: invalidates friend requests and list", () => {
      const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

      dispatchRenew(qc, {
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

  it("ignores frames without renew field", () => {
    const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

    dispatchRenew(qc, { type: "some-frame" });

    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
