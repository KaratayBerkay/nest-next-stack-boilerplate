import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RtcMeetingRoomView } from "../RtcMeetingRoomView";
import type { MeetingParticipantView } from "@/hooks/rtc/useLiveKitMeetingRoom";
import type { JoinMeetingResult } from "@/api/server/rtc/meetings/types";

const t = {
  joiningMeeting: "JOINING",
  joinMeetingFailed: "JOIN_FAILED",
  meetingNotFound: "NOT_FOUND",
  meetingEndedNotice: "MEETING_ENDED",
  meetingRemovedNotice: "REMOVED",
  backToMeetings: "Back",
  focusParticipant: "Focus this participant",
  unfocusParticipant: "Exit focus view",
  youLabel: "You",
  yourScreenLabel: "Your screen",
  participantScreenLabel: "{name}'s screen",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  resetZoom: "Reset zoom",
  micOnStatus: "Mic on",
  micOffStatus: "Muted",
  participantsTitle: "Participants",
};

const joinMeetingMock = vi.fn();
const mockLivekitMeetingRoom = vi.fn();

vi.mock("next/navigation", () => ({
  useParams: () => ({ lang: "en", slug: "s1" }),
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({ data: undefined, refetch: vi.fn() }),
  queryOptions: (opts: unknown) => opts,
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
  useLiveKitMeetingRoom: () => mockLivekitMeetingRoom(),
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

function fakeTrack() {
  return {
    attach: vi.fn(),
    detach: vi.fn(),
  } as unknown as MeetingParticipantView["videoTrack"];
}

function fakeJoinResult(): JoinMeetingResult {
  return {
    token: "tok",
    roomName: "room-1",
    role: "HOST",
    meeting: {
      id: "m1",
      title: "Meeting",
      slug: "s1",
      maxParticipants: 10,
      maxDurationMinutes: 60,
      createdAt: new Date().toISOString(),
      room: { id: "r1", state: "ACTIVE", startedAt: null, endedAt: null },
      host: { id: "u1", name: "Host", email: "h@x.com", avatarUrl: null },
    },
  };
}

beforeEach(() => {
  mockLivekitMeetingRoom.mockReturnValue({
    connected: true,
    duplicateKicked: false,
    participants: [] as MeetingParticipantView[],
    localMicEnabled: true,
    localCameraEnabled: true,
    localScreenShareEnabled: false,
    toggleMic: vi.fn(),
    toggleCamera: vi.fn(),
    toggleScreenShare: vi.fn(),
  });
});

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

  // BE-031: removal is now a ban, so a removed user's rejoin 403s with
  // EX_MEETING_REMOVED — final, not a retryable join failure.
  it("shows the removed screen (not a retry prompt) when the host removed this user", async () => {
    joinMeetingMock.mockRejectedValue(
      Object.assign(new Error("You were removed from this meeting"), {
        exception: { statusCode: 403, exc: "EX_MEETING_REMOVED" },
      }),
    );

    render(<RtcMeetingRoomView />);

    await waitFor(() => expect(screen.getByText("REMOVED")).toBeTruthy());
    expect(screen.queryByText("JOIN_FAILED")).toBeNull();
  });

  it("still shows the join-failed screen for a capacity 403", async () => {
    joinMeetingMock.mockRejectedValue(
      Object.assign(new Error("This meeting is at capacity"), {
        exception: { statusCode: 403, exc: "EX_MEETING_FULL" },
      }),
    );

    render(<RtcMeetingRoomView />);

    await waitFor(() => expect(screen.getByText("JOIN_FAILED")).toBeTruthy());
  });
});

describe("RtcMeetingRoomView screen share + camera tiles", () => {
  beforeEach(() => {
    joinMeetingMock.mockReset();
    joinMeetingMock.mockResolvedValue(fakeJoinResult());
  });

  it("renders the presenter's camera and their screen share as two separate tiles", async () => {
    const audioAttach = vi.fn();
    const presenter: MeetingParticipantView = {
      identity: "u2",
      name: "Presenter",
      isLocal: false,
      videoTrack: fakeTrack(),
      screenShareTrack: fakeTrack(),
      audioTrack: {
        attach: audioAttach,
        detach: vi.fn(),
      } as unknown as MeetingParticipantView["audioTrack"],
      micEnabled: true,
      cameraEnabled: true,
      screenShareEnabled: true,
      isSpeaking: false,
    };
    mockLivekitMeetingRoom.mockReturnValue({
      connected: true,
      duplicateKicked: false,
      participants: [presenter],
      localMicEnabled: true,
      localCameraEnabled: true,
      localScreenShareEnabled: false,
      toggleMic: vi.fn(),
      toggleCamera: vi.fn(),
      toggleScreenShare: vi.fn(),
    });

    render(<RtcMeetingRoomView />);

    // The screen share auto-pins to the spotlight, so it renders once
    // there and once more as a filmstrip camera tile — two <video>
    // elements total, never zero for the camera.
    await waitFor(() =>
      expect(document.querySelectorAll("video").length).toBe(2),
    );
    expect(screen.getByText("Presenter's screen")).toBeTruthy();
    expect(screen.getByText("Presenter")).toBeTruthy();

    // The presenter's mic must attach to exactly one of the two tiles —
    // duplicating it onto the screen tile would play their voice twice.
    expect(audioAttach).toHaveBeenCalledTimes(1);

    // The auto-spotlighted screen tile gets zoom controls; nothing else
    // on the stage (the camera filmstrip tile) does.
    expect(screen.getByRole("button", { name: "Zoom in" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Zoom out" })).toBeTruthy();
  });
});
