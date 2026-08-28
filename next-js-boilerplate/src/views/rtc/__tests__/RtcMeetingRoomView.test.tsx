import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RtcMeetingRoomView } from "../RtcMeetingRoomView";

const t = {
  joiningMeeting: "JOINING",
  joinMeetingFailed: "JOIN_FAILED",
  meetingNotFound: "NOT_FOUND",
  meetingEndedNotice: "MEETING_ENDED",
  meetingRemovedNotice: "REMOVED",
  backToMeetings: "Back",
};

const joinMeetingMock = vi.fn();

vi.mock("next/navigation", () => ({
  useParams: () => ({ lang: "en", slug: "s1" }),
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({ data: undefined, refetch: vi.fn() }),
}));
vi.mock("@/api/client/rtc/meetings-query", () => ({
  meetingChatQueryOptions: () => ({}),
  meetingRecordingQueryOptions: () => ({}),
}));
vi.mock("@/api/client/rtc/meetings-actions", () => ({
  useMeetingActions: () => ({
    joinMeeting: joinMeetingMock,
    leaveMeeting: vi.fn().mockResolvedValue(undefined),
    endMeeting: vi.fn(),
    muteParticipant: vi.fn(),
    removeParticipant: vi.fn(),
    inviteToMeeting: vi.fn(),
    reportMeeting: vi.fn(),
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
  }),
}));
vi.mock("@/lib/i18n/MessagesProvider", () => ({
  useMessages: () => t,
}));
vi.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({ componentStyle: "default" as const }),
}));
vi.mock("@/components/ui/Toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "u1" } }),
}));
vi.mock("@/lib/realtime/RealtimeProvider", () => ({
  useRealtime: () => null,
}));
vi.mock("@/hooks/rtc/useLiveKitMeetingRoom", () => ({
  useLiveKitMeetingRoom: () => ({
    participants: [],
    localMicEnabled: true,
    localCameraEnabled: true,
    localScreenShareEnabled: false,
    toggleMic: vi.fn(),
    toggleCamera: vi.fn(),
    toggleScreenShare: vi.fn(),
  }),
}));
vi.mock("@/hooks/rtc/useRoomChat", () => ({
  useRoomChat: () => ({
    chat: [],
    chatInput: "",
    setChatInput: vi.fn(),
    sendChat: vi.fn(),
  }),
}));
vi.mock("@/lib/rtc/rtc-telemetry", () => ({
  logRtcEvent: vi.fn(),
}));

describe("RtcMeetingRoomView join-failure phases", () => {
  beforeEach(() => {
    joinMeetingMock.mockReset();
  });

  it("shows the join-failed screen (not 'meeting has ended') when join dies with a server error", async () => {
    joinMeetingMock.mockRejectedValue(
      Object.assign(new Error("Cannot return null for non-nullable field"), {
        exception: { statusCode: 500 },
      }),
    );

    render(<RtcMeetingRoomView />);

    await waitFor(() => expect(screen.getByText("JOIN_FAILED")).toBeTruthy());
    expect(screen.queryByText("MEETING_ENDED")).toBeNull();
  });

  it("shows the not-found screen when join 404s", async () => {
    joinMeetingMock.mockRejectedValue(
      Object.assign(new Error("Meeting not found or already ended"), {
        exception: { statusCode: 404 },
      }),
    );

    render(<RtcMeetingRoomView />);

    await waitFor(() => expect(screen.getByText("NOT_FOUND")).toBeTruthy());
  });
});
