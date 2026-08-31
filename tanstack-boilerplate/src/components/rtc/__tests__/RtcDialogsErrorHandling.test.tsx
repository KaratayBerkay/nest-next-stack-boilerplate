import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeAll } from "vitest";
import { RtcInviteDialog } from "../RtcInviteDialog";
import { RtcReportDialog } from "../RtcReportDialog";
import { RtcRecordingControl } from "../RtcRecordingControl";

const t = {
  inviteToMeeting: "Invite",
  noFriendsToInvite: "No friends",
  invite: "Invite",
  invited: "Invited",
  inviteFailed: "INVITE_FAILED",
  searchFriendsPlaceholder: "Search friends",
  noFriendsMatch: "No friends match",
  close: "Close",
  reportTitle: "Report",
  reportReasonLabel: "Reason",
  reportReasonHarassment: "Harassment",
  reportReasonSpam: "Spam",
  reportReasonInappropriate: "Inappropriate",
  reportReasonOther: "Other",
  reportDetailsPlaceholder: "Details",
  reportSubmit: "Submit report",
  reportSubmitted: "Submitted",
  reportFailed: "REPORT_FAILED",
  startRecording: "Start recording",
  stopRecording: "Stop recording",
  recordingActionFailed: "RECORDING_ACTION_FAILED",
  recordingComingSoonNote: "Coming soon",
};

const toastMock = vi.fn();

vi.mock("@/lib/i18n/MessagesProvider", () => ({
  useMessages: () => t,
}));
vi.mock("@/components/ui/Toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));
vi.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({ componentStyle: "default" as const }),
}));
vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({
    data: [{ id: "f1", name: "Alice", email: "alice@example.com" }],
    isLoading: false,
  }),
}));
vi.mock("@/api/client/friends/query", () => ({
  friendsQueryOptions: () => ({}),
}));

beforeAll(() => {
  // jsdom may lack <dialog> modal methods.
  HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
    this.open = false;
  };
});

describe("RtcInviteDialog", () => {
  it("shows a translated failure toast and does not mark the friend as invited when onInvite rejects", async () => {
    const onInvite = vi.fn().mockRejectedValue(new Error("network"));
    toastMock.mockClear();

    render(
      <RtcInviteDialog onInvite={onInvite}>
        {(open) => <button onClick={open}>open-invite</button>}
      </RtcInviteDialog>,
    );
    fireEvent.click(screen.getByText("open-invite"));
    fireEvent.click(screen.getByRole("button", { name: "Invite" }));

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: "INVITE_FAILED" }),
      ),
    );
    expect(screen.queryByText("Invited")).toBeNull();
  });
});

describe("RtcReportDialog", () => {
  it("shows a translated failure toast and stays on the form when onSubmit rejects", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("network"));
    toastMock.mockClear();

    render(
      <RtcReportDialog onSubmit={onSubmit}>
        {(open) => <button onClick={open}>open-report</button>}
      </RtcReportDialog>,
    );
    fireEvent.click(screen.getByText("open-report"));
    fireEvent.click(screen.getByRole("button", { name: "Submit report" }));

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: "REPORT_FAILED" }),
      ),
    );
    expect(screen.queryByText("Submitted")).toBeNull();
  });
});

describe("RtcRecordingControl", () => {
  it("shows a translated failure toast when starting a recording fails", async () => {
    const onStart = vi.fn().mockRejectedValue(new Error("network"));
    const onStop = vi.fn();
    toastMock.mockClear();

    render(
      <RtcRecordingControl
        recording={null}
        onStart={onStart}
        onStop={onStop}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Start recording" }));

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: "RECORDING_ACTION_FAILED" }),
      ),
    );
  });
});
