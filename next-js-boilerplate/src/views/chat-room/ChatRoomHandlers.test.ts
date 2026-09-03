import { describe, it, expect, vi, afterEach } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { chatRoomHandleSend, chatRoomDeleteMessage } from "./ChatRoomHandlers";

const deleteForMe = vi.fn();
const deleteForEveryone = vi.fn();
vi.mock("@/api/server/messages/delete-room-message", () => ({
  deleteRoomMessageForMeServer: (...a: unknown[]) => deleteForMe(...a),
  deleteRoomMessageForEveryoneServer: (...a: unknown[]) =>
    deleteForEveryone(...a),
}));

function makeQueryClientStub() {
  return { setQueryData: vi.fn() } as unknown as Parameters<
    typeof chatRoomHandleSend
  >[3];
}

describe("chatRoomHandleSend message-length validation", () => {
  it("rejects an over-limit message with the translated error, without sending it", async () => {
    const send = vi.fn();
    const setInput = vi.fn();
    const setMessageError = vi.fn();
    const scrollToBottom = vi.fn();

    await chatRoomHandleSend(
      "x".repeat(5001),
      { send } as unknown as Parameters<typeof chatRoomHandleSend>[1],
      "general",
      makeQueryClientStub(),
      { id: "u1", name: "Alice" },
      setInput,
      scrollToBottom,
      setMessageError,
      "MESSAGE_TOO_LONG",
    );

    expect(setMessageError).toHaveBeenCalledWith("MESSAGE_TOO_LONG");
    expect(send).not.toHaveBeenCalled();
    expect(setInput).not.toHaveBeenCalled();
  });

  it("clears any previous error and sends a message within the length limit", async () => {
    const send = vi.fn();
    const setInput = vi.fn();
    const setMessageError = vi.fn();
    const scrollToBottom = vi.fn();

    await chatRoomHandleSend(
      "hello room",
      { send } as unknown as Parameters<typeof chatRoomHandleSend>[1],
      "general",
      makeQueryClientStub(),
      { id: "u1", name: "Alice" },
      setInput,
      scrollToBottom,
      setMessageError,
      "MESSAGE_TOO_LONG",
    );

    expect(setMessageError).toHaveBeenCalledWith(null);
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ type: "room-message", text: "hello room" }),
    );
  });
});

describe("chatRoomHandleSend send timeout", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("marks the optimistic message as failed if the server never echoes it back", async () => {
    vi.useFakeTimers();
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    qc.setQueryData(["room", "general"], { pages: [{ messages: [] }] });

    await chatRoomHandleSend(
      "hello room",
      { send: vi.fn() } as unknown as Parameters<typeof chatRoomHandleSend>[1],
      "general",
      qc,
      { id: "u1", name: "Alice" },
      vi.fn(),
      vi.fn(),
      vi.fn(),
      "MESSAGE_TOO_LONG",
    );

    vi.advanceTimersByTime(15_000);
    await vi.advanceTimersByTimeAsync(0);

    const data = qc.getQueryData(["room", "general"]) as {
      pages: { messages: Record<string, unknown>[] }[];
    };
    expect(data.pages[0].messages[0]).toMatchObject({
      failed: true,
      pending: false,
    });
  });
});

// CROSS-024: reply-to rides on the WS frame; delete patches the cache first.
describe("chatRoomHandleSend reply-to", () => {
  it("sends replyToId and stamps the optimistic message with the quote", async () => {
    const send = vi.fn();
    const qc = new QueryClient();
    qc.setQueryData(["room", "general"], {
      pages: [{ messages: [] }],
      pageParams: [undefined],
    });
    const replyTo = {
      id: "m1",
      senderId: "u2",
      senderName: "Bea",
      body: "lunch?",
      deletedAt: null,
      hasAttachments: false,
    };

    await chatRoomHandleSend(
      "sure",
      { send } as unknown as Parameters<typeof chatRoomHandleSend>[1],
      "general",
      qc,
      { id: "u1", name: "Alice" },
      vi.fn(),
      vi.fn(),
      vi.fn(),
      "MESSAGE_TOO_LONG",
      undefined,
      replyTo,
    );

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ type: "room-message", replyToId: "m1" }),
    );
    const data = qc.getQueryData(["room", "general"]) as {
      pages: { messages: { replyTo?: unknown; pending?: boolean }[] }[];
    };
    expect(data.pages[0].messages[0]).toMatchObject({ pending: true, replyTo });
  });

  it("omits replyToId when not replying", async () => {
    const send = vi.fn();
    await chatRoomHandleSend(
      "plain",
      { send } as unknown as Parameters<typeof chatRoomHandleSend>[1],
      "general",
      makeQueryClientStub(),
      { id: "u1", name: "Alice" },
      vi.fn(),
      vi.fn(),
      vi.fn(),
      "MESSAGE_TOO_LONG",
    );
    expect(send.mock.calls[0][0]).not.toHaveProperty("replyToId");
  });
});

describe("chatRoomDeleteMessage", () => {
  const seed = () => {
    const qc = new QueryClient();
    qc.setQueryData(["room", "general"], {
      pages: [
        {
          messages: [
            { id: "m1", body: "one", attachments: [{ url: "x" }] },
            { id: "m2", body: "two" },
          ],
        },
      ],
      pageParams: [undefined],
    });
    return qc;
  };
  const read = (qc: QueryClient) =>
    (
      qc.getQueryData(["room", "general"]) as {
        pages: { messages: Record<string, unknown>[] }[];
      }
    ).pages[0].messages;

  afterEach(() => {
    deleteForMe.mockReset();
    deleteForEveryone.mockReset();
  });

  it("scope everyone tombstones in place and calls the room endpoint", async () => {
    deleteForEveryone.mockResolvedValue(undefined);
    const qc = seed();
    await chatRoomDeleteMessage(qc, "general", "m1", "everyone");
    expect(deleteForEveryone).toHaveBeenCalledWith("general", "m1");
    const rows = read(qc);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ id: "m1", body: null, attachments: [] });
    expect(typeof rows[0].deletedAt).toBe("string");
  });

  it("scope me removes the row for this viewer only", async () => {
    deleteForMe.mockResolvedValue(undefined);
    const qc = seed();
    await chatRoomDeleteMessage(qc, "general", "m1", "me");
    expect(deleteForMe).toHaveBeenCalledWith("general", "m1");
    expect(read(qc).map((m) => m.id)).toEqual(["m2"]);
  });

  it("rolls the optimistic patch back when the server rejects", async () => {
    deleteForEveryone.mockRejectedValue(new Error("window expired"));
    const qc = seed();
    await expect(
      chatRoomDeleteMessage(qc, "general", "m1", "everyone"),
    ).rejects.toThrow("window expired");
    expect(read(qc)[0]).toMatchObject({ id: "m1", body: "one" });
  });
});
