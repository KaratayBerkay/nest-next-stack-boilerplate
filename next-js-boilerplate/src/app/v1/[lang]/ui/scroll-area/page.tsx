import type { Metadata } from "next";
import PageContent from "@/views/ui/scroll-area/PageContent";

export const metadata: Metadata = {
  title: "Scroll Area",
  description: "Scroll Area component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ScrollAreaPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
