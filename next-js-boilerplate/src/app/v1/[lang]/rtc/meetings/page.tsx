import type { Metadata } from "next";
import { RtcMeetingsListView } from "@/views/rtc/RtcMeetingsListView";

export const metadata: Metadata = {
  title: "Meetings",
  description: "Your group video meetings.",
};

export default function RtcMeetingsPage() {
  return <RtcMeetingsListView />;
}
