import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import {
  dispatchEvent,
  trackTempId,
  scheduleSendTimeout,
} from "./event-dispatch";
import { setActivePeerId } from "./active-peer";

vi.mock("@/api/server/messages/mark-read", () => ({
  markMessagesReadServer: vi.fn().mockResolvedValue({}),
}));

import { markMessagesReadServer } from "@/api/server/messages/mark-read";

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe("dispatchEvent", () => {
  let qc: QueryClient;

  beforeEach(() => {
    qc = createQueryClient();
    setActivePeerId(null);
    vi.clearAllMocks();
  });

  describe("direct-message", () => {
    it("appends message to pages[0] when conversation is cached", async () => {
      qc.setQueryData(["messages", "peer-1"], {
        pages: [{ messages: [{ id: "m1", text: "hello" }] }],
        pageParams: [undefined],
      });

      await dispatchEvent(
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

    it("sends delivered-ack when current user is the recipient", async () => {
      qc.setQueryData(["messages", "sender-1"], {
        pages: [{ messages: [] }],
        pageParams: [undefined],
      });

      const sendFrame = vi.fn();
      await dispatchEvent(
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

    it("deduplicates by message id", async () => {
      qc.setQueryData(["messages", "peer-1"], {
        pages: [{ messages: [{ id: "m1", text: "hello" }] }],
        pageParams: [undefined],
      });

      await dispatchEvent(
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

    it("invalidates query when conversation is not cached", async () => {
      const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

      await dispatchEvent(
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

    it("sends delivered-ack when the wire message omits recipientId", async () => {
      qc.setQueryData(["messages", "sender-1"], {
        pages: [{ messages: [] }],
        pageParams: [undefined],
      });

      const sendFrame = vi.fn();
      await dispatchEvent(
        qc,
        {
          type: "direct-message",
          message: { id: "m1", senderId: "sender-1", body: "hello" },
        },
        "user-1",
        sendFrame,
      );

      expect(sendFrame).toHaveBeenCalledWith({
        type: "delivered-ack",
        messageId: "m1",
      });
    });

    it("auto-marks-read without recipientId when the thread is open", async () => {
      setActivePeerId("sender-1");
      qc.setQueryData(["messages", "sender-1"], {
        pages: [{ messages: [] }],
        pageParams: [undefined],
      });
      qc.setQueryData(
        ["conversations"],
        [{ user: { id: "sender-1" }, unread: 1 }],
      );

      await dispatchEvent(
        qc,
        {
          type: "direct-message",
          message: { id: "m1", senderId: "sender-1", body: "hello" },
        },
        "user-1",
      );

      expect(markMessagesReadServer).toHaveBeenCalledWith("sender-1");
      const conversations = qc.getQueryData(["conversations"]) as {
        user: { id: string };
        unread: number;
      }[];
      expect(conversations[0].unread).toBe(0);
    });

    it("does not auto-mark-read when a different conversation is open", async () => {
      setActivePeerId("other-peer");
      qc.setQueryData(
        ["conversations"],
        [{ user: { id: "sender-1" }, unread: 1 }],
      );

      await dispatchEvent(
        qc,
        {
          type: "direct-message",
          message: { id: "m1", senderId: "sender-1", body: "hello" },
        },
        "user-1",
      );

      expect(markMessagesReadServer).not.toHaveBeenCalled();
      const conversations = qc.getQueryData(["conversations"]) as {
        user: { id: string };
        unread: number;
      }[];
      expect(conversations[0].unread).toBe(1);
    });

    it("does not auto-mark-read when no thread is open (user on another page)", async () => {
      setActivePeerId(null);
      qc.setQueryData(
        ["conversations"],
        [{ user: { id: "sender-1" }, unread: 1 }],
      );

      await dispatchEvent(
        qc,
        {
          type: "direct-message",
          message: { id: "m1", senderId: "sender-1", body: "hello" },
        },
        "user-1",
      );

      expect(markMessagesReadServer).not.toHaveBeenCalled();
      const conversations = qc.getQueryData(["conversations"]) as {
        user: { id: string };
        unread: number;
      }[];
      expect(conversations[0].unread).toBe(1);
    });

    it("reconciles the sender echo without recipientId via the active peer", async () => {
      setActivePeerId("recip-1");
      trackTempId("temp-123");
      qc.setQueryData(["messages", "recip-1"], {
        pages: [
          {
            messages: [
              {
                id: "temp-123",
                senderId: "user-1",
                body: "hello",
                pending: true,
              },
            ],
          },
        ],
        pageParams: [undefined],
      });

      await dispatchEvent(
        qc,
        {
          type: "direct-message",
          message: {
            id: "real-uuid",
            senderId: "user-1",
            body: "hello",
            _tempId: "temp-123",
            pending: false,
          },
        },
        "user-1",
      );

      const data = qc.getQueryData(["messages", "recip-1"]) as {
        pages: { messages: Record<string, unknown>[] }[];
      };
      expect(data.pages[0].messages).toHaveLength(1);
      expect(data.pages[0].messages[0].id).toBe("real-uuid");
      expect(data.pages[0].messages[0].pending).toBe(false);
    });

    it("does nothing when ownUserId is not provided", async () => {
      qc.setQueryData(["messages", "peer-1"], {
        pages: [{ messages: [{ id: "m1" }] }],
        pageParams: [undefined],
      });

      await dispatchEvent(qc, {
        type: "direct-message",
        message: { id: "m2", senderId: "peer-1", recipientId: "user-1" },
      });

      const data = qc.getQueryData(["messages", "peer-1"]) as {
        pages: { messages: { id: string }[] }[];
      };
      expect(data.pages[0].messages).toHaveLength(1);
    });

    it("computes peerId correctly when current user is the sender", async () => {
      qc.setQueryData(["messages", "recip-1"], {
        pages: [{ messages: [{ id: "m1" }] }],
        pageParams: [undefined],
      });

      await dispatchEvent(
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

    it("reconciles the sender echo tempId by replacing the pending entry", async () => {
      trackTempId("temp-123");
      qc.setQueryData(["messages", "recip-1"], {
        pages: [
          {
            messages: [
              {
                id: "temp-123",
                senderId: "user-1",
                body: "hello",
                pending: true,
              },
            ],
          },
        ],
        pageParams: [undefined],
      });

      await dispatchEvent(
        qc,
        {
          type: "direct-message",
          message: {
            id: "real-uuid",
            senderId: "user-1",
            recipientId: "recip-1",
            body: "hello",
            _tempId: "temp-123",
            pending: false,
          },
        },
        "user-1",
      );

      const data = qc.getQueryData(["messages", "recip-1"]) as {
        pages: { messages: Record<string, unknown>[] }[];
      };
      expect(data.pages[0].messages).toHaveLength(1);
      expect(data.pages[0].messages[0].id).toBe("real-uuid");
      expect(data.pages[0].messages[0].pending).toBe(false);
      expect(data.pages[0].messages[0].body).toBe("hello");
    });

    it("patches the sender's conversation list preview from the echo frame", async () => {
      qc.setQueryData(
        ["conversations"],
        [
          {
            user: { id: "recip-1", name: "Bob", email: "b@b.com" },
            lastMessage: "older",
            lastTime: "2026-08-04T10:00:00Z",
          },
        ],
      );
      qc.setQueryData(["messages", "recip-1"], {
        pages: [{ messages: [] }],
        pageParams: [undefined],
      });

      await dispatchEvent(
        qc,
        {
          type: "direct-message",
          message: {
            id: "m2",
            senderId: "user-1",
            recipientId: "recip-1",
            body: "hi from me",
            createdAt: "2026-08-05T10:00:00Z",
          },
        },
        "user-1",
      );

      const data = qc.getQueryData(["conversations"]) as {
        user: Record<string, unknown>;
        lastMessage: string;
        lastTime: string;
      }[];
      expect(data).toHaveLength(1);
      expect(data[0].user).toEqual({
        id: "recip-1",
        name: "Bob",
        email: "b@b.com",
      });
      expect(data[0].lastMessage).toBe("hi from me");
      expect(data[0].lastTime).toBe("2026-08-05T10:00:00Z");
    });

    it("does not insert a conversation row for a peer missing from the sidebar list", async () => {
      qc.setQueryData(["conversations"], []);
      qc.setQueryData(["messages", "recip-1"], {
        pages: [{ messages: [] }],
        pageParams: [undefined],
      });

      await dispatchEvent(
        qc,
        {
          type: "direct-message",
          message: {
            id: "m2",
            senderId: "recip-1",
            recipientId: "user-1",
            body: "hello",
            createdAt: "2026-08-05T10:00:00Z",
          },
        },
        "user-1",
      );

      const data = qc.getQueryData(["conversations"]);
      expect(data).toHaveLength(0);
    });
  });

  describe("message-read", () => {
    it("updates readAt on matching messages", async () => {
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

      await dispatchEvent(
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

    it("invalidates when conversation is not cached", async () => {
      const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

      await dispatchEvent(
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
    it("updates deliveredAt on matching message", async () => {
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

      await dispatchEvent(
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

    it("invalidates when conversation is not cached", async () => {
      const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

      await dispatchEvent(
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

  describe("message-deleted", () => {
    it("scope 'me' removes the message from the cache entirely", async () => {
      qc.setQueryData(["messages", "peer-1"], {
        pages: [{ messages: [{ id: "m1" }, { id: "m2" }] }],
        pageParams: [undefined],
      });

      await dispatchEvent(
        qc,
        {
          type: "message-deleted",
          scope: "me",
          messageId: "m1",
          peerId: "peer-1",
        },
        "user-1",
      );

      const data = qc.getQueryData(["messages", "peer-1"]) as {
        pages: { messages: { id: string }[] }[];
      };
      expect(data.pages[0].messages).toEqual([{ id: "m2" }]);
    });

    it("scope 'everyone' patches the message in place without changing array length or order", async () => {
      qc.setQueryData(["messages", "peer-1"], {
        pages: [
          {
            messages: [
              { id: "m1", body: "first" },
              { id: "m2", body: "second", attachments: [{ url: "x" }] },
              { id: "m3", body: "third" },
            ],
          },
        ],
        pageParams: [undefined],
      });

      await dispatchEvent(
        qc,
        {
          type: "message-deleted",
          scope: "everyone",
          messageId: "m2",
          senderId: "user-1",
          recipientId: "peer-1",
          deletedAt: "2026-08-08T00:00:00Z",
        },
        "user-1",
      );

      const data = qc.getQueryData(["messages", "peer-1"]) as {
        pages: { messages: Record<string, unknown>[] }[];
      };
      expect(data.pages[0].messages).toHaveLength(3);
      expect(data.pages[0].messages.map((m) => m.id)).toEqual([
        "m1",
        "m2",
        "m3",
      ]);
      expect(data.pages[0].messages[1]).toEqual({
        id: "m2",
        body: null,
        attachments: [],
        deletedAt: "2026-08-08T00:00:00Z",
      });
    });

    it("scope 'everyone' derives peerId as the sender when the current user is the recipient", async () => {
      qc.setQueryData(["messages", "sender-1"], {
        pages: [{ messages: [{ id: "m1", body: "hi" }] }],
        pageParams: [undefined],
      });

      await dispatchEvent(
        qc,
        {
          type: "message-deleted",
          scope: "everyone",
          messageId: "m1",
          senderId: "sender-1",
          recipientId: "user-1",
          deletedAt: "2026-08-08T00:00:00Z",
        },
        "user-1",
      );

      const data = qc.getQueryData(["messages", "sender-1"]) as {
        pages: { messages: Record<string, unknown>[] }[];
      };
      expect(data.pages[0].messages[0].deletedAt).toBe("2026-08-08T00:00:00Z");
    });

    it("invalidates when the conversation is not cached", async () => {
      const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

      await dispatchEvent(
        qc,
        {
          type: "message-deleted",
          scope: "me",
          messageId: "m1",
          peerId: "peer-1",
        },
        "user-1",
      );

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["messages", "peer-1"],
      });
    });
  });

  describe("room-message", () => {
    it("appends message to cached room messages", async () => {
      qc.setQueryData(["room", "general"], {
        pages: [{ messages: [{ id: "m1", body: "hello" }] }],
      });

      await dispatchEvent(qc, {
        type: "room-message",
        room: "general",
        message: { id: "m2", body: "world" },
      });

      const data = qc.getQueryData(["room", "general"]) as {
        pages: { messages: { id: string }[] }[];
      };
      expect(data.pages[0].messages).toHaveLength(2);
      expect(data.pages[0].messages[1].id).toBe("m2");
    });

    it("deduplicates by message id", async () => {
      qc.setQueryData(["room", "general"], {
        pages: [{ messages: [{ id: "m1", body: "hello" }] }],
      });

      await dispatchEvent(qc, {
        type: "room-message",
        room: "general",
        message: { id: "m1", body: "hello" },
      });

      const data = qc.getQueryData(["room", "general"]) as {
        pages: { messages: { id: string }[] }[];
      };
      expect(data.pages[0].messages).toHaveLength(1);
    });

    it("invalidates when room is not cached", async () => {
      const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

      await dispatchEvent(qc, {
        type: "room-message",
        room: "general",
        message: { id: "m1", body: "hello" },
      });

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["room", "general"],
      });
    });

    it("reconciles tempId by replacing pending entry", async () => {
      trackTempId("temp-123");
      qc.setQueryData(["room", "general"], {
        pages: [
          { messages: [{ id: "temp-123", body: "hello", pending: true }] },
        ],
      });

      await dispatchEvent(qc, {
        type: "room-message",
        room: "general",
        tempId: "temp-123",
        message: { id: "real-uuid", body: "hello", pending: false },
      });

      const data = qc.getQueryData(["room", "general"]) as {
        pages: { messages: Record<string, unknown>[] }[];
      };
      expect(data.pages[0].messages).toHaveLength(1);
      expect(data.pages[0].messages[0].id).toBe("real-uuid");
      expect(data.pages[0].messages[0].pending).toBe(false);
    });

    it("does nothing when room or message is missing", async () => {
      const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

      await dispatchEvent(qc, { type: "room-message" });

      expect(invalidateSpy).not.toHaveBeenCalled();
    });
  });

  it("ignores unknown frame types", async () => {
    const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

    await dispatchEvent(qc, { type: "unknown-type" }, "user-1");

    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it("ignores direct-message without message id", async () => {
    const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

    await dispatchEvent(
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

describe("scheduleSendTimeout", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("fires onTimeout when no echo clears the tempId in time", async () => {
    vi.useFakeTimers();
    trackTempId("temp-timeout-1");
    const onTimeout = vi.fn();

    scheduleSendTimeout("temp-timeout-1", onTimeout, 1000);
    vi.advanceTimersByTime(1000);
    await vi.advanceTimersByTimeAsync(0);

    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it("does not fire onTimeout once a matching echo has already cleared the tempId", async () => {
    vi.useFakeTimers();
    const qc = createQueryClient();
    trackTempId("temp-timeout-2");
    const onTimeout = vi.fn();
    scheduleSendTimeout("temp-timeout-2", onTimeout, 1000);

    qc.setQueryData(["messages", "peer-1"], {
      pages: [
        { messages: [{ id: "temp-timeout-2", body: "hi", pending: true }] },
      ],
    });
    await dispatchEvent(
      qc,
      {
        type: "direct-message",
        message: {
          id: "real-id",
          senderId: "user-1",
          recipientId: "peer-1",
          _tempId: "temp-timeout-2",
        },
      },
      "user-1",
    );

    vi.advanceTimersByTime(1000);
    await vi.advanceTimersByTimeAsync(0);

    expect(onTimeout).not.toHaveBeenCalled();
  });
});

// CROSS-024: room-message deletions patch the ["room", slug] cache.
describe("room-message-deleted", () => {
  const seed = () => {
    const qc = new QueryClient();
    qc.setQueryData(["room", "general"], {
      pages: [
        {
          messages: [
            { id: "r1", body: "one" },
            { id: "r2", body: "two", attachments: [{ url: "x" }] },
            { id: "r3", body: "three" },
          ],
        },
      ],
      pageParams: [undefined],
    });
    return qc;
  };
  const rows = (qc: QueryClient) =>
    (
      qc.getQueryData(["room", "general"]) as {
        pages: { messages: Record<string, unknown>[] }[];
      }
    ).pages[0].messages;

  it("scope 'me' removes the row", async () => {
    const qc = seed();
    await dispatchEvent(
      qc,
      {
        type: "room-message-deleted",
        scope: "me",
        room: "general",
        messageId: "r1",
      },
      "user-1",
    );
    expect(rows(qc).map((m) => m.id)).toEqual(["r2", "r3"]);
  });

  it("scope 'everyone' tombstones in place, keeping order and length", async () => {
    const qc = seed();
    await dispatchEvent(
      qc,
      {
        type: "room-message-deleted",
        scope: "everyone",
        room: "general",
        messageId: "r2",
        senderId: "user-2",
        deletedAt: "2026-09-03T10:05:00.000Z",
      },
      "user-1",
    );
    const after = rows(qc);
    expect(after.map((m) => m.id)).toEqual(["r1", "r2", "r3"]);
    expect(after[1]).toMatchObject({
      body: null,
      attachments: [],
      deletedAt: "2026-09-03T10:05:00.000Z",
    });
  });

  it("invalidates instead of patching when the room is not cached", async () => {
    const qc = new QueryClient();
    const spy = vi.spyOn(qc, "invalidateQueries");
    await dispatchEvent(
      qc,
      {
        type: "room-message-deleted",
        scope: "everyone",
        room: "vip-lounge",
        messageId: "r9",
      },
      "user-1",
    );
    expect(spy).toHaveBeenCalledWith({ queryKey: ["room", "vip-lounge"] });
  });
});
