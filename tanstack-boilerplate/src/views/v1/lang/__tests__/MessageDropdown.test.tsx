import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MessageDropdown } from "../MessageDropdown";
import { setActivePeerId } from "@/lib/realtime/active-peer";

const t = {
  inbox: "INBOX_TITLE",
  noUnread: "NO_UNREAD",
  viewAll: "VIEW_ALL",
  close: "CLOSE_LABEL",
};

let pathname = "/v1/en/feed";
let searchParams = new URLSearchParams();
type FrameHandler = (frame: Record<string, unknown>) => void;
const handlers = new Map<string, FrameHandler>();

vi.mock("@/lib/i18n/MessagesProvider", () => ({
  useMessages: () => t,
}));
vi.mock("@/hooks", () => ({
  useBreakpoint: () => true,
}));
vi.mock("@/hooks/useClickOutside", () => ({
  useClickOutside: () => {},
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => pathname,
  useSearchParams: () => searchParams,
}));
vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "me" } }),
}));
vi.mock("@/lib/realtime/RealtimeProvider", () => ({
  useRealtime: () => ({
    subscribe: (type: string, handler: FrameHandler) => {
      handlers.set(type, handler);
      return () => handlers.delete(type);
    },
  }),
}));
vi.mock("@/api/server/messages/mark-read", () => ({
  markMessagesReadServer: vi.fn().mockResolvedValue({}),
}));
// IconButton renders through useComponentVariant, which needs a ThemeProvider
// this unit test doesn't set up (same gap as NotificationDropdown.test.tsx).
vi.mock("@/hooks/useComponentVariant", () => ({
  useComponentVariant: () => "default",
}));

function arriveDirectMessage(senderId: string) {
  act(() => {
    handlers.get("direct-message")?.({
      type: "direct-message",
      message: { id: "m1", senderId },
    });
  });
}

beforeEach(() => {
  pathname = "/v1/en/feed";
  searchParams = new URLSearchParams();
  handlers.clear();
  setActivePeerId(null);
});

describe("MessageDropdown auto-open", () => {
  it("auto-opens when a DM arrives from a peer whose thread is not open", () => {
    render(<MessageDropdown conversations={[]} lang="en" />);
    expect(screen.queryByText(t.viewAll)).toBeNull();

    arriveDirectMessage("peer-1");

    expect(screen.getByText(t.viewAll)).toBeTruthy();
  });

  it("does not auto-open when the sender's thread is the active conversation (sidebar selection, no ?user= in the URL)", () => {
    pathname = "/v1/en/messages";
    setActivePeerId("peer-1");
    render(<MessageDropdown conversations={[]} lang="en" />);

    arriveDirectMessage("peer-1");

    expect(screen.queryByText(t.viewAll)).toBeNull();
  });

  it("still auto-opens on the messages page when a different peer's thread is active", () => {
    pathname = "/v1/en/messages";
    setActivePeerId("peer-2");
    render(<MessageDropdown conversations={[]} lang="en" />);

    arriveDirectMessage("peer-1");

    expect(screen.getByText(t.viewAll)).toBeTruthy();
  });

  it("does not auto-open during the deep-link window when ?user= names the sender but no selection is active yet", () => {
    pathname = "/v1/en/messages";
    searchParams = new URLSearchParams("user=peer-1");
    render(<MessageDropdown conversations={[]} lang="en" />);

    arriveDirectMessage("peer-1");

    expect(screen.queryByText(t.viewAll)).toBeNull();
  });

  it("ignores the echo of the user's own sent message", () => {
    render(<MessageDropdown conversations={[]} lang="en" />);

    arriveDirectMessage("me");

    expect(screen.queryByText(t.viewAll)).toBeNull();
  });
});
