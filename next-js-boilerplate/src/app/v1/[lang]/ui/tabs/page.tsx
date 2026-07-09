import type { Metadata } from "next";
import PageContent from "@/views/ui/tabs/PageContent";

export const metadata: Metadata = {
  title: "Tabs",
  description: "Tabs component demo",
};

export default function TabsPage() {
  return <PageContent />;
}
