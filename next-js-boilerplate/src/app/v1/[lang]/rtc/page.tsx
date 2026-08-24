import type { Metadata } from "next";
import { RtcHubView } from "@/views/rtc/RtcHubView";

export const metadata: Metadata = {
  title: "Calls & Live",
  description: "Voice and video calls, group meetings, and live streaming.",
};

export default function RtcPage() {
  return <RtcHubView />;
}
