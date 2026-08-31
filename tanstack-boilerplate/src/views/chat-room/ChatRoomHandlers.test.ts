import { describe, it, expect, vi, afterEach } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { chatRoomHandleSend } from "./ChatRoomHandlers";

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
