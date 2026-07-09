import type { Metadata } from "next";
import SsePageContent from "@/views/demos/sse/PageContent";

export const metadata: Metadata = {
  title: "SSE",
  description: "Server-Sent Events demo",
};

export default function SsePage() {
  return <SsePageContent />;
}
