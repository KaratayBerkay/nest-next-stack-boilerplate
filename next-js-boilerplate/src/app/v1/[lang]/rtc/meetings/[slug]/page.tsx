import type { Metadata } from "next";
import { RtcMeetingRoomView } from "@/views/rtc/RtcMeetingRoomView";

export const metadata: Metadata = {
  title: "Meeting",
  description: "Group video meeting room.",
};

export default function RtcMeetingRoomPage() {
  return <RtcMeetingRoomView />;
}
