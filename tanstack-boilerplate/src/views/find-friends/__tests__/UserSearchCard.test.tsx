import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { UserSearchCard } from "../UserSearchCard";

const toastMock = vi.fn();

vi.mock("@/components/ui/Toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));
vi.mock("@/hooks/useComponentVariant", () => ({
  useComponentVariant: () => "default",
}));

describe("UserSearchCard", () => {
  it("shows a failure toast and re-enables the button when the request comes back false", async () => {
    toastMock.mockClear();
    const onSendRequest = vi.fn().mockResolvedValue(false);

    render(
      <UserSearchCard
        userId="u1"
        name="Alice"
        isPending={false}
        onSendRequest={onSendRequest}
        pendingLabel="Pending"
        addFriendLabel="Add Friend"
        sendFailedMessage="SEND_FAILED"
      />,
    );

    const button = screen.getByRole("button", { name: "Add Friend" });
    fireEvent.click(button);

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: "SEND_FAILED" }),
      ),
    );
    expect(onSendRequest).toHaveBeenCalledTimes(1);
  });

  it("shows a failure toast when the request rejects outright", async () => {
    toastMock.mockClear();
    const onSendRequest = vi.fn().mockRejectedValue(new Error("network"));

    render(
      <UserSearchCard
        userId="u2"
        name="Bob"
        isPending={false}
        onSendRequest={onSendRequest}
        pendingLabel="Pending"
        addFriendLabel="Add Friend"
        sendFailedMessage="SEND_FAILED"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add Friend" }));

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: "SEND_FAILED" }),
      ),
    );
  });

  it("does not fire a second request while one is already in flight", async () => {
    toastMock.mockClear();
    let resolveRequest!: (ok: boolean) => void;
    const onSendRequest = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          resolveRequest = resolve;
        }),
    );

    render(
      <UserSearchCard
        userId="u3"
        name="Carol"
        isPending={false}
        onSendRequest={onSendRequest}
        pendingLabel="Pending"
        addFriendLabel="Add Friend"
        sendFailedMessage="SEND_FAILED"
      />,
    );

    const button = screen.getByRole("button", { name: "Add Friend" });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(onSendRequest).toHaveBeenCalledTimes(1);
    resolveRequest(true);
    await waitFor(() => expect(toastMock).not.toHaveBeenCalled());
  });
});
