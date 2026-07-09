import type { Metadata } from "next";
import PageContent from "@/views/ui/hover-card/PageContent";

export const metadata: Metadata = {
  title: "Hover Card",
  description: "Hover Card component demo",
};

export default function HoverCardPage() {
  return <PageContent />;
}
