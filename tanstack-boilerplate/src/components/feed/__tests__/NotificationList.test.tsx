import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { NotificationList } from "../NotificationList";
import type { NotificationItem } from "@/lib/realtime/useNotifications";

const t = {
  title: "NOTIFICATIONS_TITLE",
  markAllRead: "MARK_ALL_READ_LABEL",
  noNotifications: "NO_NOTIFICATIONS_LABEL",
  seeMore: "SEE_MORE_LABEL",
};

vi.mock("@/lib/i18n/MessagesProvider", () => ({
  useMessages: () => t,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("NotificationList", () => {
  it("shows translated heading and empty state instead of hardcoded English", () => {
    render(
      <NotificationList
        notifications={[]}
        onMarkRead={vi.fn()}
        onMarkAllRead={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );

    expect(screen.getByText(t.title)).toBeTruthy();
    expect(screen.getByText(t.noNotifications)).toBeTruthy();
    expect(screen.getByText(t.seeMore)).toBeTruthy();
    expect(screen.queryByText("Notifications")).toBeNull();
    expect(screen.queryByText("No notifications yet")).toBeNull();
    expect(screen.queryByText("See more")).toBeNull();
  });

  it("shows a translated Mark all read button when there are unread notifications", () => {
    const unread: NotificationItem = {
      id: "n1",
      title: "Someone liked your post",
      body: null,
      createdAt: new Date().toISOString(),
      readAt: null,
      payload: {},
      actor: null,
    } as unknown as NotificationItem;

    render(
      <NotificationList
        notifications={[unread]}
        onMarkRead={vi.fn()}
        onMarkAllRead={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );

    expect(screen.getByText(t.markAllRead)).toBeTruthy();
    expect(screen.queryByText("Mark all read")).toBeNull();
  });
});
