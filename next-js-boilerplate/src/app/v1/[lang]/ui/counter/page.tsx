import type { Metadata } from "next";
import PageContent from "@/views/ui/counter/PageContent";

export const metadata: Metadata = {
  title: "Counter",
  description: "Counter component demo",
};

export default function CounterPage() {
  return <PageContent />;
}
