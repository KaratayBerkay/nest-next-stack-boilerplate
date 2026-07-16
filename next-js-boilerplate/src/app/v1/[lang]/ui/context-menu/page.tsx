import type { Metadata } from "next";
import PageContent from "@/views/ui/context-menu/PageContent";

export const metadata: Metadata = {
  title: "Context Menu",
  description: "Context Menu component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ContextMenuPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
