import type { Metadata } from "next";
import PageContent from "@/views/ui/resizable/PageContent";

export const metadata: Metadata = {
  title: "Resizable",
  description: "Resizable component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ResizablePage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
