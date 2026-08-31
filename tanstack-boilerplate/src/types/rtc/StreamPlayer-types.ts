import type { Track } from "livekit-client";

export interface StreamPlayerProps {
  videoTrack: Track | null;
  screenShareTrack: Track | null;
  audioTrack: Track | null;
  broadcasterName: string;
  offlineLabel: string;
  /** True while the broadcaster's mic is muted — shows the mute badge. */
  micMuted?: boolean;
  /** Localized text for the "Live" badge shown when `isLive` is set. */
  liveLabel?: string;
  isLive?: boolean;
  /**
   * The broadcaster's own preview passes `audioTrack: null` to avoid mic
   * echo — set this to false there so the missing local audio isn't shown
   * as a viewer-style "stream has no audio" indicator.
   */
  showNoAudioIndicator?: boolean;
}
