// Ported from next-js-boilerplate/src/app/v1/lang/rtc/live/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import { RtcLiveDiscoveryView } from "@/views/rtc/RtcLiveDiscoveryView";

export const metadata: Metadata = {
  title: "Live",
  description: "Live streams you can watch, or go live yourself.",
};

export const Route = createFileRoute("/v1/$lang/rtc/live/")({
  head: () => metadataToHead(metadata),
  component: RtcLivePage,
});

function RtcLivePage() {
  return <RtcLiveDiscoveryView />;
}
