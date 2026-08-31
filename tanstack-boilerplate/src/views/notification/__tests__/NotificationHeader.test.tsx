import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { NotificationHeader } from "../NotificationHeader";

// IconButton/Button render through useComponentVariant, which needs a
// ThemeProvider this unit test doesn't set up (same gap as this repo's other
// component-tree tests, e.g. planDetails.test.tsx) — stub it to the default variant.
vi.mock("@/hooks/useComponentVariant", () => ({
  useComponentVariant: () => "default",
}));
vi.mock("@/components/ui/page-info", () => ({
  PageInfoButton: () => null,
}));

describe("NotificationHeader", () => {
  it("renders the back button using the caller-supplied translated label, not a hardcoded one", () => {
    render(
      <NotificationHeader
        title="Notifications"
        supported={false}
        permission="default"
        subscription={null}
        requestPermission={vi.fn()}
        unsubscribe={vi.fn()}
        unreadCount={0}
        markAllRead={vi.fn()}
        backLabel="GERI_LABEL"
        markAllReadLabel="Mark all read"
        enablePushLabel="Enable push notifications"
        disablePushLabel="Disable push notifications"
        pushBlockedLabel="Notifications blocked"
        navigateToFeed={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("GERI_LABEL")).toBeTruthy();
    expect(screen.queryByLabelText("Back")).toBeNull();
  });

  it("shows an actionable enable button when permission has never been requested", () => {
    const requestPermission = vi.fn();
    render(
      <NotificationHeader
        title="Notifications"
        supported={true}
        permission="default"
        subscription={null}
        requestPermission={requestPermission}
        unsubscribe={vi.fn()}
        unreadCount={0}
        markAllRead={vi.fn()}
        backLabel="Back"
        markAllReadLabel="Mark all read"
        enablePushLabel="Enable push notifications"
        disablePushLabel="Disable push notifications"
        pushBlockedLabel="Notifications blocked"
        navigateToFeed={vi.fn()}
      />,
    );

    const button = screen.getByLabelText("Enable push notifications");
    expect((button as HTMLButtonElement).disabled).toBe(false);
  });

  it("shows a disabled, explanatory button instead of a dead 'enable' button once permission is denied", () => {
    const requestPermission = vi.fn();
    render(
      <NotificationHeader
        title="Notifications"
        supported={true}
        permission="denied"
        subscription={null}
        requestPermission={requestPermission}
        unsubscribe={vi.fn()}
        unreadCount={0}
        markAllRead={vi.fn()}
        backLabel="Back"
        markAllReadLabel="Mark all read"
        enablePushLabel="Enable push notifications"
        disablePushLabel="Disable push notifications"
        pushBlockedLabel="Notifications blocked"
        navigateToFeed={vi.fn()}
      />,
    );

    expect(screen.queryByLabelText("Enable push notifications")).toBeNull();
    const blocked = screen.getByLabelText(
      "Notifications blocked",
    ) as HTMLButtonElement;
    expect(blocked.disabled).toBe(true);
  });
});
