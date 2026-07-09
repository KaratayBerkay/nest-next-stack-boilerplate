import type { Metadata } from "next";
import PageContent from "@/views/ui/toggle-group/PageContent";

export const metadata: Metadata = {
  title: "Toggle Group",
  description: "Toggle Group component demo",
};

export default function ToggleGroupPage() {
  return <PageContent />;
}
