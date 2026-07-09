import type { Metadata } from "next";
import PageContent from "@/views/ui/badge/PageContent";

export const metadata: Metadata = {
  title: "Badge",
  description: "Badge component demo",
};

export default function BadgePage() {
  return <PageContent />;
}
