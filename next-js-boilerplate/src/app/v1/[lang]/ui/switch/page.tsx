import type { Metadata } from "next";
import PageContent from "@/views/ui/switch/PageContent";

export const metadata: Metadata = {
  title: "Switch",
  description: "Switch component demo",
};

export default function SwitchPage() {
  return <PageContent />;
}
