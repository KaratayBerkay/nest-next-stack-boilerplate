import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RtcCallOverlay } from "../RtcCallOverlay";
import type { RtcCallState } from "@/lib/rtc/RtcCallProvider";

const t = {
  decline: "DECLINE_LABEL",
  accept: "ACCEPT_LABEL",
  connectingTitle: "CONNECTING_LABEL",
  hangup: "HANGUP_LABEL",
  cancel: "CANCEL_LABEL",
  incomingCallTitle: "Incoming call",
  incomingVideoCallTitle: "Incoming video call",
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
vi.mock("@/hooks/rtc/useLiveKitRoom", () => ({
  useLiveKitRoom: () => ({
    connected: true,
    remoteConnected: true,
    livekitError: null,
    micEnabled: true,
    cameraEnabled: true,
    toggleMic: vi.fn(),
    toggleCamera: vi.fn(),
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
    };

    render(<RtcCallOverlay />);

    expect(screen.getByRole("button", { name: t.hangup })).toBeTruthy();
  });
});
