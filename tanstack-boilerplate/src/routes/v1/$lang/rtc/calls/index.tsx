// Ported from next-js-boilerplate/src/app/v1/lang/rtc/calls/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import { RtcCallHistoryView } from "@/views/rtc/RtcCallHistoryView";

export const metadata: Metadata = {
  title: "Call history",
  description: "Your 1:1 voice and video call history.",
};

export const Route = createFileRoute("/v1/$lang/rtc/calls/")({
  head: () => metadataToHead(metadata),
  component: RtcCallsPage,
});

function RtcCallsPage() {
  return <RtcCallHistoryView />;
}
