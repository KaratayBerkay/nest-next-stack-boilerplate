import type { Metadata } from "next";
import PageContent from "@/views/ui/context-menu/PageContent";

export const metadata: Metadata = {
  title: "Context Menu",
  description: "Context Menu component demo",
};

export default function ContextMenuPage() {
  return <PageContent />;
}
