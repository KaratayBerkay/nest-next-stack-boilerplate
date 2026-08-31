import type { MeetingParticipantView } from "@/hooks/rtc/useLiveKitMeetingRoom";

export interface MeetingParticipantTileProps {
  participant: MeetingParticipantView;
  youLabel: string;
  /** When set, the tile is clickable (focus/unfocus in the meeting stage). */
  onClick?: () => void;
  /** Accessible label for the click action; required when onClick is set. */
  clickLabel?: string;
}
