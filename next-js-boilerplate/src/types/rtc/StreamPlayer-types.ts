import type { Track } from "livekit-client";

export interface StreamPlayerProps {
  videoTrack: Track | null;
  screenShareTrack: Track | null;
  audioTrack: Track | null;
  broadcasterName: string;
  offlineLabel: string;
  isLive?: boolean;
}
