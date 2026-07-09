import type { Metadata } from "next";
import PageContent from "@/views/ui/aspect-ratio/PageContent";

export const metadata: Metadata = {
  title: "Aspect Ratio",
  description: "Aspect Ratio component demo",
};

export default function AspectRatioPage() {
  return <PageContent />;
}
