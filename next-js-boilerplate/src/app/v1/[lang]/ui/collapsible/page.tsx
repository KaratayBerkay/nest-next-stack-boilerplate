import type { Metadata } from "next";
import PageContent from "@/views/ui/collapsible/PageContent";

export const metadata: Metadata = {
  title: "Collapsible",
  description: "Collapsible component demo",
};

export default function CollapsiblePage() {
  return <PageContent />;
}
