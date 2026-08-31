// Ported from next-js-boilerplate/src/app/v1/lang/rtc/live/go-live/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import { RtcGoLiveView } from "@/views/rtc/RtcGoLiveView";

export const metadata: Metadata = {
  title: "Go Live",
  description: "Start broadcasting a live stream.",
};

export const Route = createFileRoute("/v1/$lang/rtc/live/go-live/")({
  head: () => metadataToHead(metadata),
  component: RtcGoLivePage,
});

function RtcGoLivePage() {
  return <RtcGoLiveView />;
}
