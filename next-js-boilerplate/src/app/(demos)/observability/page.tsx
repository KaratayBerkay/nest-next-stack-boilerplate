import type { Metadata } from "next";
import ObservabilityPageContent from "@/views/demos/observability/PageContent";

export const metadata: Metadata = {
  title: "Observability",
  description: "Observability and monitoring demo",
};

export default function ObservabilityPage() {
  return <ObservabilityPageContent />;
}
