import type { Metadata } from "next";
import { RtcCallHistoryView } from "@/views/rtc/RtcCallHistoryView";

export const metadata: Metadata = {
  title: "Call history",
  description: "Your 1:1 voice and video call history.",
};

export default function RtcCallsPage() {
  return <RtcCallHistoryView />;
}
