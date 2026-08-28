import type { RefObject } from "react";

export interface PulsingAvatarProps {
  avatarUrl: string | null;
  name: string;
  /** Stable key (peer id, falling back to name) for the identity color. */
  paletteKey: string;
}

export interface IncomingCallOverlayProps {
  peerId: string | null;
  peerName: string;
  peerAvatarUrl: string | null;
  hasVideo: boolean;
  accepting: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export interface ActiveCallOverlayProps {
  peerId: string | null;
  peerName: string;
  peerAvatarUrl: string | null;
  /** Own name/avatar for the self-view placeholder while the local camera
   *  is off or unavailable. */
  selfName: string;
  selfAvatarUrl: string | null;
  hasVideo: boolean;
  phase: "outgoing-ringing" | "connected";
  micEnabled: boolean;
  cameraEnabled: boolean;
  /** Peer currently publishing an unmuted camera track — gates their video
   *  element vs the avatar placeholder. */
  remoteCameraLive: boolean;
  speakerEnabled: boolean;
  actionPending: boolean;
  remoteConnected: boolean;
  livekitConnected: boolean;
  /** Tier-scaled call cap from rtc:accepted; renders the timer as
   *  "elapsed / limit" when present. */
  maxDurationMinutes: number | null;
  warningSecondsRemaining: number | null;
  livekitError: "connection" | "microphone" | "camera" | null;
  remoteVideoRef: RefObject<HTMLVideoElement | null>;
  localVideoRef: RefObject<HTMLVideoElement | null>;
  remoteAudioRef: RefObject<HTMLAudioElement | null>;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleSpeaker: () => void;
  onHangup: () => void;
}
