import type { Metadata } from "next";
import PageContent from "@/views/ui/error-boundary/PageContent";

export const metadata: Metadata = {
  title: "Error Boundary",
  description: "Error Boundary component demo",
};

export default function ErrorBoundaryPage() {
  return <PageContent />;
}
