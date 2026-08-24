import type { Metadata } from "next";
import { RtcLiveDiscoveryView } from "@/views/rtc/RtcLiveDiscoveryView";

export const metadata: Metadata = {
  title: "Live",
  description: "Live streams you can watch, or go live yourself.",
};

export default function RtcLivePage() {
  return <RtcLiveDiscoveryView />;
}
