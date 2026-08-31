import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotificationDropdown } from "../NotificationDropdown";

const t = {
  title: "NOTIFICATIONS_TITLE",
  notificationsWithUnread: "NOTIFICATIONS_WITH_UNREAD ({count})",
  close: "CLOSE_LABEL",
};

const useBreakpointMock = vi.fn();

vi.mock("@/lib/i18n/MessagesProvider", () => ({
  useMessages: () => t,
}));
vi.mock("@/hooks", () => ({
  useBreakpoint: () => useBreakpointMock(),
}));
vi.mock("@/hooks/useClickOutside", () => ({
  useClickOutside: () => {},
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("@/lib/realtime/useNotifications", () => ({
  useNotifications: () => ({ data: { pages: [] } }),
  useUnreadNotificationCount: () => ({ data: 0 }),
}));
vi.mock("@/api/client/notifications/actions", () => ({
  useNotificationActions: () => ({
    markRead: vi.fn(),
    markAllRead: vi.fn().mockResolvedValue(undefined),
  }),
}));
vi.mock("@/components/feed/NotificationList", () => ({
  NotificationList: () => <div>notification-list</div>,
}));
// IconButton renders through useComponentVariant, which needs a ThemeProvider
// this unit test doesn't set up (same gap as this repo's other component-tree
// tests, e.g. planDetails.test.tsx) — stub it to the default variant.
vi.mock("@/hooks/useComponentVariant", () => ({
  useComponentVariant: () => "default",
}));

beforeEach(() => {
  useBreakpointMock.mockReset();
});

describe("NotificationDropdown", () => {
  it("uses the translated base title as the bell button's aria-label when there are no unread notifications", () => {
    useBreakpointMock.mockReturnValue(true);
    render(<NotificationDropdown lang="en" />);

    expect(screen.getByLabelText(t.title)).toBeTruthy();
  });

  it("shows the translated mobile header title and close aria-label instead of hardcoded English", () => {
    useBreakpointMock.mockReturnValue(false);
    render(<NotificationDropdown lang="en" />);

    fireEvent.click(screen.getByLabelText(t.title));

    expect(screen.getByLabelText(t.close)).toBeTruthy();
    expect(screen.queryByLabelText("Close")).toBeNull();
  });
});
