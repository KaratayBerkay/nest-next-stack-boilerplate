import type { Metadata } from "next";
import { RtcLiveViewerView } from "@/views/rtc/RtcLiveViewerView";

export const metadata: Metadata = {
  title: "Live stream",
  description: "Watch a live stream.",
};

export default function RtcLiveViewerPage() {
  return <RtcLiveViewerView />;
}
