// Ported from next-js-boilerplate/src/app/v1/lang/rtc/meetings/[slug]/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import { RtcMeetingRoomView } from "@/views/rtc/RtcMeetingRoomView";

export const metadata: Metadata = {
  title: "Meeting",
  description: "Group video meeting room.",
};

export const Route = createFileRoute("/v1/$lang/rtc/meetings/$slug/")({
  head: () => metadataToHead(metadata),
  component: RtcMeetingRoomPage,
});

function RtcMeetingRoomPage() {
  return <RtcMeetingRoomView />;
}
