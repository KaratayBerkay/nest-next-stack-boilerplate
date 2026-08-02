import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useChatRoomRealtime } from "@/views/chat-room/useChatRoomRealtime";

type FrameHandler = (frame: Record<string, unknown>) => void;

const mockRealtime = vi.hoisted(() => ({
  send: vi.fn(),
  subscribers: new Map<string, FrameHandler>(),
}));

vi.mock("@/lib/realtime/RealtimeProvider", () => ({
  useRealtime: () => ({
    send: mockRealtime.send,
    subscribe: (type: string, handler: FrameHandler) => {
      mockRealtime.subscribers.set(type, handler);
      return () => mockRealtime.subscribers.delete(type);
    },
  }),
}));

describe("useChatRoomRealtime", () => {
  beforeEach(() => {
    mockRealtime.send.mockClear();
    mockRealtime.subscribers.clear();
  });

  it("pulls the current member list on mount instead of only waiting for a join broadcast", () => {
    const setRoomCounts = vi.fn();
    const setRoomMembers = vi.fn();
    renderHook(() =>
      useChatRoomRealtime("general", setRoomCounts, setRoomMembers),
    );

    expect(mockRealtime.send).toHaveBeenCalledWith({
      type: "get-room-members",
      room: "general",
    });
  });

  it("applies a room-members response for the current room", () => {
    const setRoomCounts = vi.fn();
    const setRoomMembers = vi.fn();
    renderHook(() =>
      useChatRoomRealtime("general", setRoomCounts, setRoomMembers),
    );

    const handler = mockRealtime.subscribers.get("room-members");
    expect(handler).toBeDefined();
    handler!({
      type: "room-members",
      room: "general",
      members: [
        { userId: "u1", name: "Alice", chatNickname: "", avatarUrl: null },
        {
          userId: "u2",
          name: "Bob",
          chatNickname: "",
          avatarUrl: "https://example.com/bob.png",
        },
      ],
    });

    expect(setRoomMembers).toHaveBeenCalledWith([
      { id: "u1", name: "Alice", chatNickname: undefined, avatarUrl: null },
      {
        id: "u2",
        name: "Bob",
        chatNickname: undefined,
        avatarUrl: "https://example.com/bob.png",
      },
    ]);
  });

  it("ignores a room-members response for a different (stale) room", () => {
    const setRoomCounts = vi.fn();
    const setRoomMembers = vi.fn();
    renderHook(() =>
      useChatRoomRealtime("general", setRoomCounts, setRoomMembers),
    );

    const handler = mockRealtime.subscribers.get("room-members");
    handler!({ type: "room-members", room: "random", members: [] });

    expect(setRoomMembers).not.toHaveBeenCalled();
  });

  it("re-pulls the member list when the room changes", () => {
    const setRoomCounts = vi.fn();
    const setRoomMembers = vi.fn();
    const { rerender } = renderHook(
      ({ room }) => useChatRoomRealtime(room, setRoomCounts, setRoomMembers),
      { initialProps: { room: "general" } },
    );
    mockRealtime.send.mockClear();

    rerender({ room: "random" });

    expect(mockRealtime.send).toHaveBeenCalledWith({
      type: "get-room-members",
      room: "random",
    });
  });
});
