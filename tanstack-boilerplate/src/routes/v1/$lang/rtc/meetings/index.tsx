// Ported from next-js-boilerplate/src/app/v1/lang/rtc/meetings/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import { RtcMeetingsListView } from "@/views/rtc/RtcMeetingsListView";

export const metadata: Metadata = {
  title: "Meetings",
  description: "Your group video meetings.",
};

export const Route = createFileRoute("/v1/$lang/rtc/meetings/")({
  head: () => metadataToHead(metadata),
  component: RtcMeetingsPage,
});

function RtcMeetingsPage() {
  return <RtcMeetingsListView />;
}
