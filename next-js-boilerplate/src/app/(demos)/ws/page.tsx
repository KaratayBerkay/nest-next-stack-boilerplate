import type { Metadata } from "next";
import WsPageContent from "@/views/demos/ws/PageContent";

export const metadata: Metadata = {
  title: "WebSocket",
  description: "WebSocket demo",
};

export default function WsPage() {
  return <WsPageContent />;
}
