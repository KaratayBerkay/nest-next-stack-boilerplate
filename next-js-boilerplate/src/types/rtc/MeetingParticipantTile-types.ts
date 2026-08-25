import type { MeetingParticipantView } from "@/hooks/rtc/useLiveKitMeetingRoom";

export interface MeetingParticipantTileProps {
  participant: MeetingParticipantView;
  youLabel: string;
}
