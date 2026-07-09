import type { Metadata } from "next";
import PageContent from "@/views/ui/accordion/PageContent";

export const metadata: Metadata = {
  title: "Accordion",
  description: "Accordion component demo",
};

export default function AccordionPage() {
  return <PageContent />;
}
