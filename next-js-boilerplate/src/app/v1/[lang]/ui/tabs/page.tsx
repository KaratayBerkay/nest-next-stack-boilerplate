import type { Metadata } from "next";
import PageContent from "@/views/ui/tabs/PageContent";

export const metadata: Metadata = {
  title: "Tabs",
  description: "Tabs component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function TabsPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
