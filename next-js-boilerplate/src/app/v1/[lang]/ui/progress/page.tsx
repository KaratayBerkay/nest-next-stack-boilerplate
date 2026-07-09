import type { Metadata } from "next";
import PageContent from "@/views/ui/progress/PageContent";

export const metadata: Metadata = {
  title: "Progress",
  description: "Progress component demo",
};

export default function ProgressPage() {
  return <PageContent />;
}
