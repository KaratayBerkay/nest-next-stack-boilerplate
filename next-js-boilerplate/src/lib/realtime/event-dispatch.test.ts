import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { dispatchEvent, trackTempId } from "./event-dispatch";

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe("dispatchEvent", () => {
  let qc: QueryClient;

  beforeEach(() => {
    qc = createQueryClient();
  });

  describe("direct-message", () => {
    it("appends message to pages[0] when conversation is cached", () => {
      qc.setQueryData(["messages", "peer-1"], {
        pages: [{ messages: [{ id: "m1", text: "hello" }] }],
        pageParams: [undefined],
      });

      dispatchEvent(
        qc,
        {
          type: "direct-message",
          message: { id: "m2", senderId: "user-1", recipientId: "peer-1" },
        },
        "user-1",
      );

      const data = qc.getQueryData(["messages", "peer-1"]) as {
        pages: { messages: { id: string }[] }[];
      };
      expect(data.pages[0].messages).toHaveLength(2);
      expect(data.pages[0].messages[1].id).toBe("m2");
    });

    it("sends delivered-ack when current user is the recipient", () => {
      qc.setQueryData(["messages", "sender-1"], {
        pages: [{ messages: [] }],
        pageParams: [undefined],
      });

      const sendFrame = vi.fn();
      dispatchEvent(
        qc,
        {
          type: "direct-message",
          message: { id: "m1", senderId: "sender-1", recipientId: "user-1" },
        },
        "user-1",
        sendFrame,
      );

      expect(sendFrame).toHaveBeenCalledWith({
        type: "delivered-ack",
        messageId: "m1",
      });
    });

    it("deduplicates by message id", () => {
      qc.setQueryData(["messages", "peer-1"], {
        pages: [{ messages: [{ id: "m1", text: "hello" }] }],
        pageParams: [undefined],
      });

      dispatchEvent(
        qc,
        {
          type: "direct-message",
          message: { id: "m1", senderId: "peer-1", recipientId: "user-1" },
        },
        "user-1",
      );

      const data = qc.getQueryData(["messages", "peer-1"]) as {
        pages: { messages: { id: string }[] }[];
      };
      expect(data.pages[0].messages).toHaveLength(1);
    });

    it("invalidates query when conversation is not cached", () => {
      const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

      dispatchEvent(
        qc,
        {
          type: "direct-message",
          message: { id: "m1", senderId: "peer-1", recipientId: "user-1" },
        },
        "user-1",
      );

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["messages", "peer-1"],
      });
    });

    it("does nothing when ownUserId is not provided", () => {
      qc.setQueryData(["messages", "peer-1"], {
        pages: [{ messages: [{ id: "m1" }] }],
        pageParams: [undefined],
      });

      dispatchEvent(qc, {
        type: "direct-message",
        message: { id: "m2", senderId: "peer-1", recipientId: "user-1" },
      });

      const data = qc.getQueryData(["messages", "peer-1"]) as {
        pages: { messages: { id: string }[] }[];
      };
      expect(data.pages[0].messages).toHaveLength(1);
    });

    it("computes peerId correctly when current user is the sender", () => {
      qc.setQueryData(["messages", "recip-1"], {
        pages: [{ messages: [{ id: "m1" }] }],
        pageParams: [undefined],
      });

      dispatchEvent(
        qc,
        {
          type: "direct-message",
          message: { id: "m2", senderId: "user-1", recipientId: "recip-1" },
        },
        "user-1",
      );

      const data = qc.getQueryData(["messages", "recip-1"]);
      expect(data).toBeDefined();
    });
  });

  describe("message-read", () => {
    it("updates readAt on matching messages", () => {
      qc.setQueryData(["messages", "peer-1"], {
        pages: [
          {
            messages: [
              { id: "m1", senderId: "user-1", readAt: null },
              { id: "m2", senderId: "peer-1", readAt: null },
            ],
          },
        ],
        pageParams: [undefined],
      });

      dispatchEvent(
        qc,
        {
          type: "message-read",
          peerId: "peer-1",
          readAt: "2026-07-20T00:00:00Z",
        },
        "user-1",
      );

      const data = qc.getQueryData(["messages", "peer-1"]) as {
        pages: { messages: { id: string; readAt: string | null }[] }[];
      };
      expect(data.pages[0].messages[0].readAt).toBe("2026-07-20T00:00:00Z");
      expect(data.pages[0].messages[1].readAt).toBeNull();
    });

    it("invalidates when conversation is not cached", () => {
      const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

      dispatchEvent(
        qc,
        {
          type: "message-read",
          peerId: "peer-1",
          readAt: "2026-07-20T00:00:00Z",
        },
        "user-1",
      );

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["messages", "peer-1"],
      });
    });
  });

  describe("message-delivered", () => {
    it("updates deliveredAt on matching message", () => {
      qc.setQueryData(["messages", "peer-1"], {
        pages: [
          {
            messages: [
              { id: "m1", deliveredAt: null },
              { id: "m2", deliveredAt: null },
            ],
          },
        ],
        pageParams: [undefined],
      });

      dispatchEvent(
        qc,
        {
          type: "message-delivered",
          peerId: "peer-1",
          messageId: "m1",
          deliveredAt: "2026-07-20T00:00:00Z",
        },
        "user-1",
      );

      const data = qc.getQueryData(["messages", "peer-1"]) as {
        pages: { messages: { id: string; deliveredAt: string | null }[] }[];
      };
      expect(data.pages[0].messages[0].deliveredAt).toBe(
        "2026-07-20T00:00:00Z",
      );
      expect(data.pages[0].messages[1].deliveredAt).toBeNull();
    });

    it("invalidates when conversation is not cached", () => {
      const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

      dispatchEvent(
        qc,
        {
          type: "message-delivered",
          peerId: "peer-1",
          messageId: "m1",
          deliveredAt: "2026-07-20T00:00:00Z",
        },
        "user-1",
      );

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["messages", "peer-1"],
      });
    });
  });

  describe("room-message", () => {
    it("appends message to cached room messages", () => {
      qc.setQueryData(["room", "general"], [{ id: "m1", body: "hello" }]);

      dispatchEvent(qc, {
        type: "room-message",
        room: "general",
        message: { id: "m2", body: "world" },
      });

      const data = qc.getQueryData(["room", "general"]) as { id: string }[];
      expect(data).toHaveLength(2);
      expect(data[1].id).toBe("m2");
    });

    it("deduplicates by message id", () => {
      qc.setQueryData(["room", "general"], [{ id: "m1", body: "hello" }]);

      dispatchEvent(qc, {
        type: "room-message",
        room: "general",
        message: { id: "m1", body: "hello" },
      });

      const data = qc.getQueryData(["room", "general"]) as { id: string }[];
      expect(data).toHaveLength(1);
    });

    it("invalidates when room is not cached", () => {
      const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

      dispatchEvent(qc, {
        type: "room-message",
        room: "general",
        message: { id: "m1", body: "hello" },
      });

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["room", "general"],
      });
    });

    it("reconciles tempId by replacing pending entry", () => {
      trackTempId("temp-123");
      qc.setQueryData(
        ["room", "general"],
        [{ id: "temp-123", body: "hello", pending: true }],
      );

      dispatchEvent(qc, {
        type: "room-message",
        room: "general",
        tempId: "temp-123",
        message: { id: "real-uuid", body: "hello", pending: false },
      });

      const data = qc.getQueryData(["room", "general"]) as Record<
        string,
        unknown
      >[];
      expect(data).toHaveLength(1);
      expect(data[0].id).toBe("real-uuid");
      expect(data[0].pending).toBe(false);
    });

    it("does nothing when room or message is missing", () => {
      const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

      dispatchEvent(qc, { type: "room-message" });

      expect(invalidateSpy).not.toHaveBeenCalled();
    });
  });

  it("ignores unknown frame types", () => {
    const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

    dispatchEvent(qc, { type: "unknown-type" }, "user-1");

    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it("ignores direct-message without message id", () => {
    const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

    dispatchEvent(
      qc,
      {
        type: "direct-message",
        message: { senderId: "peer-1" },
      },
      "user-1",
    );

    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
