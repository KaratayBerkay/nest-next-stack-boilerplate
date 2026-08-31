// Ported from next-js-boilerplate/src/app/v1/lang/rtc/live/[slug]/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import { RtcLiveViewerView } from "@/views/rtc/RtcLiveViewerView";

export const metadata: Metadata = {
  title: "Live stream",
  description: "Watch a live stream.",
};

export const Route = createFileRoute("/v1/$lang/rtc/live/$slug/")({
  head: () => metadataToHead(metadata),
  component: RtcLiveViewerPage,
});

function RtcLiveViewerPage() {
  return <RtcLiveViewerView />;
}
