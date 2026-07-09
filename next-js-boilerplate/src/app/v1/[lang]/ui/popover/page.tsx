import type { Metadata } from "next";
import PageContent from "@/views/ui/popover/PageContent";

export const metadata: Metadata = {
  title: "Popover",
  description: "Popover component demo",
};

export default function PopoverPage() {
  return <PageContent />;
}
