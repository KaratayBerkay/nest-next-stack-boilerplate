import type { MeetingParticipantView } from "@/hooks/rtc/useLiveKitMeetingRoom";

export interface MeetingParticipantTileProps {
  participant: MeetingParticipantView;
  youLabel: string;
  /** Which of the participant's tracks this tile renders. Camera and screen
   *  share are now separate tiles (Meet-style) so a presenter's face never
   *  disappears behind their own shared screen. Defaults to "camera". */
  videoMode?: "camera" | "screen";
  /** Overrides the name-tag text. Used for screen-share tiles ("{name}'s
   *  screen" / "Your screen") — the tile itself stays i18n-agnostic beyond
   *  `youLabel`, so the caller resolves the string. */
  label?: string;
  /** Shows pan/zoom controls on a screen-share tile — only set for the
   *  spotlighted tile; a filmstrip/grid thumbnail is too small for the
   *  controls to be worth it. No-op when videoMode isn't "screen". */
  zoomable?: boolean;
  /** Accessible labels for the zoom controls; required when zoomable. */
  zoomInLabel?: string;
  zoomOutLabel?: string;
  resetZoomLabel?: string;
  /** When set, the tile is clickable (focus/unfocus in the meeting stage). */
  onClick?: () => void;
  /** Accessible label for the click action; required when onClick is set. */
  clickLabel?: string;
}
