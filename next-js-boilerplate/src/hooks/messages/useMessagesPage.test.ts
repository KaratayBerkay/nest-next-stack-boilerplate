import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMessagesPage } from "@/hooks/messages/useMessagesPage";

const mockUseMessagesData = vi.hoisted(() => vi.fn());

vi.mock("@/lib/i18n/MessagesProvider", () => ({
  useMessages: () => ({}),
}));
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "me", name: "Me", email: "me@example.com", avatarUrl: null },
    loading: false,
  }),
}));
vi.mock("@/api/client/messages/actions", () => ({
  useMessageActions: () => ({ markRead: vi.fn() }),
}));
vi.mock("@/hooks/useSwipeGesture", () => ({
  useSwipeGesture: () => ({ progress: 0, direction: null, isSwiping: false }),
}));
vi.mock("@/hooks/useConnectionState", () => ({
  useConnectionState: () => "online",
}));
vi.mock("@/hooks/usePresence", () => ({
  usePresence: () => new Set<string>(),
}));
vi.mock("@/lib/realtime/event-dispatch", () => ({
  setActivePeerId: vi.fn(),
}));
vi.mock("@/hooks/messages/useMessagesSearch", () => ({
  useMessagesSearch: () => ({
    search: "",
    setSearch: vi.fn(),
    findInput: "",
    setFindInput: vi.fn(),
    findResults: [],
    sentRequestIds: new Set<string>(),
    setSentRequestIds: vi.fn(),
    debouncedSearch: vi.fn(),
  }),
}));
vi.mock("@/hooks/messages/useMessagesData", () => ({
  useMessagesData: (...args: unknown[]) => mockUseMessagesData(...args),
}));
const PEER_ID = "peer-1";

function conversation(avatarUrl: string | null) {
  return [
    {
      user: {
        id: PEER_ID,
        email: "peer@example.com",
        name: "Peer",
        avatarUrl,
        online: false,
      },
      lastMessage: "hi",
      lastTime: "2026-08-02T00:00:00.000Z",
      unread: 0,
    },
  ];
}

describe("useMessagesPage selectedUser freshness", () => {
  it("overlays live avatarUrl from `conversations` instead of the stale click-time snapshot", () => {
    mockUseMessagesData.mockReturnValue({
      friends: [],
      conversations: conversation("https://cdn.example/avatar.png"),
      convsError: false,
    });

    const { result, rerender } = renderHook(() => useMessagesPage({}));

    result.current.openConversation({
      id: PEER_ID,
      name: "Peer",
      email: "peer@example.com",
      avatarUrl: "https://cdn.example/avatar.png",
    });
    rerender();
    expect(result.current.selectedUser?.avatarUrl).toBe(
      "https://cdn.example/avatar.png",
    );

    // The peer toggles hideAvatar mid-conversation — `conversations` refetches
    // with a redacted avatarUrl while `selectedUser` was never re-clicked.
    mockUseMessagesData.mockReturnValue({
      friends: [],
      conversations: conversation(null),
      convsError: false,
    });
    rerender();

    expect(result.current.selectedUser?.avatarUrl).toBeNull();
  });

  it("falls back to the snapshot when the peer is no longer in conversations or friends", () => {
    mockUseMessagesData.mockReturnValue({
      friends: [],
      conversations: conversation("https://cdn.example/avatar.png"),
      convsError: false,
    });

    const { result, rerender } = renderHook(() => useMessagesPage({}));

    result.current.openConversation({
      id: PEER_ID,
      name: "Peer",
      email: "peer@example.com",
      avatarUrl: "https://cdn.example/avatar.png",
    });
    rerender();

    mockUseMessagesData.mockReturnValue({
      friends: [],
      conversations: [],
      convsError: false,
    });
    rerender();

    expect(result.current.selectedUser?.avatarUrl).toBe(
      "https://cdn.example/avatar.png",
    );
  });
});
