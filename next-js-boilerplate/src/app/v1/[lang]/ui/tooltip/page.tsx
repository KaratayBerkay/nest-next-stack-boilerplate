import type { Metadata } from "next";
import PageContent from "@/views/ui/tooltip/PageContent";

export const metadata: Metadata = {
  title: "Tooltip",
  description: "Tooltip component demo",
};

export default function TooltipPage() {
  return <PageContent />;
}
