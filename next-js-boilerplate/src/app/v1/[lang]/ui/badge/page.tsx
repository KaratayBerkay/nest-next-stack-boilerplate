import type { Metadata } from "next";
import PageContent from "@/views/ui/badge/PageContent";

export const metadata: Metadata = {
  title: "Badge",
  description: "Badge component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function BadgePage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
