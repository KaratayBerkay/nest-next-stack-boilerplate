import type { Metadata } from "next";
import PageContent from "@/views/ui/resizable/PageContent";

export const metadata: Metadata = {
  title: "Resizable",
  description: "Resizable component demo",
};

export default function ResizablePage() {
  return <PageContent />;
}
