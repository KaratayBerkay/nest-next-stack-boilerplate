import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RtcCallOverlay, formatCallTimer } from "../RtcCallOverlay";
import type { RtcCallState } from "@/lib/rtc/RtcCallProvider";

const t = {
  decline: "DECLINE_LABEL",
  accept: "ACCEPT_LABEL",
  connectingTitle: "CONNECTING_LABEL",
  hangup: "HANGUP_LABEL",
  cancel: "CANCEL_LABEL",
  incomingCallTitle: "Incoming call",
  incomingVideoCallTitle: "Incoming video call",
  youLabel: "YOU_LABEL",
  cameraUnavailable: "CAMERA_UNAVAILABLE_BANNER",
  mute: "MUTE",
  unmute: "UNMUTE",
  speakerOn: "SPEAKER_ON",
  speakerOff: "SPEAKER_OFF",
  cameraOn: "CAMERA_ON",
  cameraOff: "CAMERA_OFF",
  screenShareOn: "SCREEN_SHARE_ON",
  screenShareOff: "SCREEN_SHARE_OFF",
  yourScreenLabel: "Your screen",
  participantScreenLabel: "{name}'s screen",
  zoomIn: "ZOOM_IN",
  zoomOut: "ZOOM_OUT",
  resetZoom: "RESET_ZOOM",
};

const rtcCallState = vi.hoisted(() => ({
  current: null as RtcCallState | null,
}));

vi.mock("@/lib/i18n/MessagesProvider", () => ({
  useMessages: () => t,
}));
vi.mock("@/components/ui/Toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));
vi.mock("@/lib/rtc/RtcCallProvider", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/rtc/RtcCallProvider")>();
  return {
    ...actual,
    useRtcCall: () => ({
      state: rtcCallState.current,
      acceptCall: vi.fn(),
      rejectCall: vi.fn(),
      cancelCall: vi.fn(),
      hangupCall: vi.fn(),
      dismissError: vi.fn(),
    }),
  };
});
// Avatar renders through useComponentVariant, which needs a ThemeProvider
// this unit test doesn't set up — stub it to the default variant.
vi.mock("@/hooks/useComponentVariant", () => ({
  useComponentVariant: () => "default",
}));
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "me-1", email: "me@example.com", name: "Me Myself" },
  }),
}));
const livekitState = vi.hoisted(() => ({
  connected: true,
  remoteConnected: true,
  remoteCameraLive: true,
  remoteScreenShareLive: false,
  screenShareEnabled: false,
  livekitError: null as string | null,
  micEnabled: true,
  cameraEnabled: true,
}));
vi.mock("@/hooks/rtc/useLiveKitRoom", () => ({
  useLiveKitRoom: () => ({
    ...livekitState,
    toggleMic: vi.fn(),
    toggleCamera: vi.fn(),
    toggleScreenShare: vi.fn(),
  }),
}));

const basePeer = { id: "peer-1", name: "Alice", avatarUrl: null };

describe("RtcCallOverlay accessible names", () => {
  it("gives the incoming-call Decline and Accept buttons a real accessible name, not just an icon", () => {
    rtcCallState.current = {
      phase: "incoming-ringing",
      callId: "call-1",
      peer: basePeer,
      hasVideo: false,
      livekit: null,
      warningSecondsRemaining: null,
      lastError: null,
      actionPending: null,
      connectedAt: null,
    };

    render(<RtcCallOverlay />);

    expect(screen.getByRole("button", { name: t.decline })).toBeTruthy();
    expect(screen.getByRole("button", { name: t.accept })).toBeTruthy();
  });

  it("gives the in-call Hangup button a real accessible name", () => {
    rtcCallState.current = {
      phase: "connected",
      callId: "call-1",
      peer: basePeer,
      hasVideo: false,
      livekit: { token: "tok", roomName: "room-1" },
      warningSecondsRemaining: null,
      lastError: null,
      actionPending: null,
      connectedAt: null,
    };

    render(<RtcCallOverlay />);

    expect(screen.getByRole("button", { name: t.hangup })).toBeTruthy();
  });
});

// Regression for the "black window" report of 2026-08-28: a camera that is
// off/denied/muted must render an avatar-and-name placeholder (Meet-style),
// never an opaque black video rectangle.
describe("RtcCallOverlay camera-off placeholders", () => {
  const videoCallState: RtcCallState = {
    phase: "connected",
    callId: "call-1",
    peer: basePeer,
    hasVideo: true,
    livekit: { token: "tok", roomName: "room-1" },
    warningSecondsRemaining: null,
    lastError: null,
    actionPending: null,
    connectedAt: null,
  };

  beforeEach(() => {
    rtcCallState.current = videoCallState;
    livekitState.connected = true;
    livekitState.remoteConnected = true;
    livekitState.remoteCameraLive = true;
    livekitState.remoteScreenShareLive = false;
    livekitState.screenShareEnabled = false;
    livekitState.cameraEnabled = true;
    livekitState.micEnabled = true;
    livekitState.livekitError = null;
  });

  it("hides the remote video element while the peer has no live camera track, so the avatar/name placeholder shows", () => {
    livekitState.remoteCameraLive = false;

    const { container } = render(<RtcCallOverlay />);

    const remoteVideo = container.querySelector(
      "video:not([aria-label])",
    ) as HTMLVideoElement;
    expect(remoteVideo.className).toContain("opacity-0");
    // The placeholder behind it names the peer.
    expect(screen.getAllByText(basePeer.name).length).toBeGreaterThan(0);
  });

  it("shows the remote video element when the peer's camera is live", () => {
    const { container } = render(<RtcCallOverlay />);

    const remoteVideo = container.querySelector(
      "video:not([aria-label])",
    ) as HTMLVideoElement;
    expect(remoteVideo.className).not.toContain("opacity-0");
  });

  it("overlays the self tile with the own avatar when the local camera is off", () => {
    livekitState.cameraEnabled = false;

    render(<RtcCallOverlay />);

    expect(screen.getByTestId("self-camera-placeholder")).toBeTruthy();
    const selfVideo = screen.getByLabelText(t.youLabel) as HTMLVideoElement;
    expect(selfVideo.className).toContain("opacity-0");
  });

  it("shows no self placeholder while the local camera is on", () => {
    const { container } = render(<RtcCallOverlay />);

    expect(
      container.querySelector('[data-testid="self-camera-placeholder"]'),
    ).toBeNull();
  });
});

// Same "camera never disappears behind the share" mechanics as the meeting
// room (RtcMeetingRoomView), applied to 1:1 calls: a screen share becomes
// the call's main stage while both cameras shrink to small tiles, rather
// than replacing the sharer's video outright.
describe("RtcCallOverlay screen sharing", () => {
  const videoCallState: RtcCallState = {
    phase: "connected",
    callId: "call-1",
    peer: basePeer,
    hasVideo: true,
    livekit: { token: "tok", roomName: "room-1" },
    warningSecondsRemaining: null,
    lastError: null,
    actionPending: null,
    connectedAt: null,
  };

  beforeEach(() => {
    rtcCallState.current = videoCallState;
    livekitState.connected = true;
    livekitState.remoteConnected = true;
    livekitState.remoteCameraLive = true;
    livekitState.remoteScreenShareLive = false;
    livekitState.screenShareEnabled = false;
    livekitState.cameraEnabled = true;
    livekitState.micEnabled = true;
    livekitState.livekitError = null;
  });

  // The zoom scroll container (the video's immediate parent) carries the
  // hidden/visible toggle now, not the video itself — the video's own
  // className instead reflects the zoom-driven width/height.
  function screenTileWrapper(labelText: string): HTMLElement {
    const video = screen.getByLabelText(labelText);
    return video.parentElement as HTMLElement;
  }

  it("shows the peer's shared screen as the main stage and shrinks their camera to a small tile — never removing it", () => {
    livekitState.remoteScreenShareLive = true;

    const { container } = render(<RtcCallOverlay />);

    expect(screenTileWrapper("Alice's screen").className).not.toContain(
      "hidden",
    );
    expect(screenTileWrapper(t.yourScreenLabel).className).toContain("hidden");

    // The peer's camera video must still be mounted and visible — shrunk
    // to a corner tile, not removed the way it used to disappear behind
    // the meeting room's screen share before that fix.
    const peerCamera = container.querySelector(
      "video:not([aria-label])",
    ) as HTMLVideoElement;
    expect(peerCamera).toBeTruthy();
    expect(peerCamera.className).not.toContain("inset-0");
    expect(peerCamera.className).not.toContain("opacity-0");

    // Zoom controls appear once a share is the main stage.
    expect(screen.getByRole("button", { name: t.zoomIn })).toBeTruthy();
    expect(screen.getByRole("button", { name: t.zoomOut })).toBeTruthy();
  });

  it("shows no zoom controls when nobody is sharing", () => {
    render(<RtcCallOverlay />);

    expect(screen.queryByRole("button", { name: t.zoomIn })).toBeNull();
    expect(screen.queryByRole("button", { name: t.zoomOut })).toBeNull();
  });

  it("shows your own shared screen as the main stage when you're presenting", () => {
    livekitState.screenShareEnabled = true;

    render(<RtcCallOverlay />);

    expect(screenTileWrapper(t.yourScreenLabel).className).not.toContain(
      "hidden",
    );
    expect(screenTileWrapper("Alice's screen").className).toContain("hidden");
  });

  it("keeps both screen-share tiles hidden and the peer camera full-stage when nobody is sharing", () => {
    const { container } = render(<RtcCallOverlay />);

    expect(screenTileWrapper("Alice's screen").className).toContain("hidden");
    expect(screenTileWrapper(t.yourScreenLabel).className).toContain("hidden");
    const peerCamera = container.querySelector(
      "video:not([aria-label])",
    ) as HTMLVideoElement;
    expect(peerCamera.className).toContain("inset-0");
  });
});

// The tier-scaled duration cap (10/25/45/120 min, min of the two parties)
// must be visible during the call as "elapsed / limit" next to the name.
describe("call timer with tier limit", () => {
  it("formats elapsed / limit when a cap is known, elapsed alone otherwise", () => {
    expect(formatCallTimer(137, 10)).toBe("2:17 / 10:00");
    expect(formatCallTimer(0, 25)).toBe("0:00 / 25:00");
    expect(formatCallTimer(3599, 120)).toBe("59:59 / 120:00");
    expect(formatCallTimer(137, null)).toBe("2:17");
    expect(formatCallTimer(137, undefined)).toBe("2:17");
  });

  it("renders the limit readout in a connected call that carries maxDurationMinutes", () => {
    rtcCallState.current = {
      phase: "connected",
      callId: "call-1",
      peer: basePeer,
      hasVideo: true,
      livekit: { token: "tok", roomName: "room-1", maxDurationMinutes: 10 },
      warningSecondsRemaining: null,
      lastError: null,
      actionPending: null,
      connectedAt: null,
    };
    livekitState.connected = true;
    livekitState.remoteConnected = true;

    render(<RtcCallOverlay />);

    expect(screen.getAllByText("0:00 / 10:00").length).toBeGreaterThan(0);
  });

  it("keeps the timer in the status readout when a media error is active — the error lives in its own banner, not the timer slot", () => {
    rtcCallState.current = {
      phase: "connected",
      callId: "call-1",
      peer: basePeer,
      hasVideo: true,
      livekit: { token: "tok", roomName: "room-1", maxDurationMinutes: 10 },
      warningSecondsRemaining: null,
      lastError: null,
      actionPending: null,
      connectedAt: null,
    };
    livekitState.connected = true;
    livekitState.remoteConnected = true;
    livekitState.livekitError = "camera";

    render(<RtcCallOverlay />);

    expect(screen.getAllByText("0:00 / 10:00").length).toBeGreaterThan(0);
    expect(screen.getByText(t.cameraUnavailable)).toBeTruthy();
  });
});
