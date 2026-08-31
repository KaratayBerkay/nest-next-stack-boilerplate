// Ported from next-js-boilerplate/src/app/v1/lang/rtc/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import { RtcHubView } from "@/views/rtc/RtcHubView";

export const metadata: Metadata = {
  title: "Calls & Live",
  description: "Voice and video calls, group meetings, and live streaming.",
};

export const Route = createFileRoute("/v1/$lang/rtc/")({
  head: () => metadataToHead(metadata),
  component: RtcPage,
});

function RtcPage() {
  return <RtcHubView />;
}
