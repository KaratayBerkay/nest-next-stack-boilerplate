import type { Metadata } from "next";
import { RtcGoLiveView } from "@/views/rtc/RtcGoLiveView";

export const metadata: Metadata = {
  title: "Go Live",
  description: "Start broadcasting a live stream.",
};

export default function RtcGoLivePage() {
  return <RtcGoLiveView />;
}
