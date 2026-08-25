export type RtcReportReason =
  | "HARASSMENT"
  | "SPAM"
  | "INAPPROPRIATE_CONTENT"
  | "OTHER";

export interface RtcReportView {
  id: string;
}

export interface RtcRecordingView {
  id: string;
  status: "NOT_STARTED" | "RECORDING" | "STOPPED";
  fileUrl: string | null;
  startedAt: string | null;
  endedAt: string | null;
}
