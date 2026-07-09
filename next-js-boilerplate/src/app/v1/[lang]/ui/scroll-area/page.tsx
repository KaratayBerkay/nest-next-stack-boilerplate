import type { Metadata } from "next";
import PageContent from "@/views/ui/scroll-area/PageContent";

export const metadata: Metadata = {
  title: "Scroll Area",
  description: "Scroll Area component demo",
};

export default function ScrollAreaPage() {
  return <PageContent />;
}
