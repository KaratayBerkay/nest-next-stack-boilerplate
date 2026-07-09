import type { Metadata } from "next";
import PageContent from "@/views/ui/toggle/PageContent";

export const metadata: Metadata = {
  title: "Toggle",
  description: "Toggle component demo",
};

export default function TogglePage() {
  return <PageContent />;
}
