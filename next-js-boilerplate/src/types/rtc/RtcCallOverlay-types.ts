import type { RefObject } from "react";

export interface IncomingCallOverlayProps {
  peerName: string;
  peerAvatarUrl: string | null;
  hasVideo: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export interface ActiveCallOverlayProps {
  peerName: string;
  peerAvatarUrl: string | null;
  hasVideo: boolean;
  phase: "outgoing-ringing" | "connected";
  micEnabled: boolean;
  cameraEnabled: boolean;
  speakerEnabled: boolean;
  remoteConnected: boolean;
  livekitConnected: boolean;
  warningSecondsRemaining: number | null;
  remoteVideoRef: RefObject<HTMLVideoElement | null>;
  localVideoRef: RefObject<HTMLVideoElement | null>;
  remoteAudioRef: RefObject<HTMLAudioElement | null>;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleSpeaker: () => void;
  onHangup: () => void;
}
