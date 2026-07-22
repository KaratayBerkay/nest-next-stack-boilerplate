import type { SessionInfo } from "./SessionInfo-types";
import type { DateDisplayPreference } from "@/lib/date-time";

export interface SessionCardProps {
  session: SessionInfo;
  isCurrent: boolean;
  dateDisplay: DateDisplayPreference;
  onRevoke: (sessionId: string) => void;
}
