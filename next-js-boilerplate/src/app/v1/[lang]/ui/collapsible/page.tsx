import type { Metadata } from "next";
import PageContent from "@/views/ui/collapsible/PageContent";

export const metadata: Metadata = {
  title: "Collapsible",
  description: "Collapsible component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function CollapsiblePage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
